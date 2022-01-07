document.oncontextmenu = function() {
  return false;
}

function calcAround(_id) {
  const row = Math.floor(_id / 30);
  const col = _id % 30;

  let toCheck = [
    [row-1,col-1],[row-1,col],[row-1,col+1],
    [row  ,col-1],[row  ,col],[row  ,col+1],
    [row+1,col-1],[row+1,col],[row+1,col+1],
  ];
  toCheck = toCheck.filter(coord => coord[0] >=0 && coord[0] <16);
  toCheck = toCheck.filter(coord => coord[1] >=0 && coord[1] <30);
  toCheck = toCheck.map(coord => (30*coord[0])+coord[1]);

  return toCheck;
}

function genMap(difficulty = 2) {
  let maparray = [];

  if (difficulty == 2) {
    const rows = 16;
    const cols = 30;

    // initializing the map
    for (let i = 0; i < rows*cols; i++) {
      maparray.push(0);
    }

    // adding bombs to the map
    for (let i = 0; i < 99; i++) {
      while (true) {
        let randomID = Math.random()*rows*cols;
        randomID = Math.round(randomID);

        if (maparray[randomID] == 0) {
          maparray[randomID] = 9;
          break;
        }
      }
    }

    // adding bomb counter around the bombs
    for (let i = 0; i < rows*cols; i++) {
      if (maparray[i] == 9) continue;
      let aroundBoxes = calcAround(i);
      let bombCount = 0;

      aroundBoxes.forEach(id => {
        if (maparray[id] == 9) bombCount++;
      })
      maparray[i] = bombCount;
    }

  }

  return maparray;
}

function getMap(gamemap = null) {
  if (gamemap == null) gamemap = genMap();

  gamemap = gamemap.map(x => {
    if (x == 0) return ""
    if (x == 9) return "x"
    return x.toString();
  })

  let id = 0;
  gamemap = gamemap.map(x => ({ 
    id: id++,
    value: x,
    covered: true,
    flagged: false
  }));
  return gamemap;
}

const app = new Vue({
  el: '#app',
  data: {
    boxes: getMap(map001),
    gameOver: false,
    startTime: Date.now(),
    playTime: 0,
    timer: null
  },
  created: function () {
    this.startTimer();
  },
  methods: {
    startTimer() {
      this.timer = setInterval(() => {
        this.playTime = this.getPlaytime();
      }, 100)
    },

    getBombsCount() {
      return this.boxes.filter(box => box.value == "x").length;
    },

    getFlaggetBoxesCount() {
      return this.boxes.filter(box => box.flagged).length;
    },

    getPlaytime() {
      return ((Date.now() - this.startTime)/1000).toFixed(2);
    },

    calcAround(_id) {
      const row = Math.floor(_id / 30);
      const col = _id % 30;

      let toCheck = [
        [row-1,col-1],[row-1,col],[row-1,col+1],
        [row  ,col-1],[row  ,col],[row  ,col+1],
        [row+1,col-1],[row+1,col],[row+1,col+1],
      ];
      toCheck = toCheck.filter(coord => coord[0] >=0 && coord[0] <16);
      toCheck = toCheck.filter(coord => coord[1] >=0 && coord[1] <30);
      toCheck = toCheck.map(coord => (30*coord[0])+coord[1]);

      return toCheck;
    },

    calcAreaToOpen(_id, selected = [], depth = 0) {
      if (depth > 4) return;
      selected.push(_id);

      toCheck = this.calcAround(_id);
      toCheck = toCheck.filter(id => !selected.includes(id));

      this.boxes.forEach(box => {
        if (!selected.includes(box.id) && toCheck.includes(box.id) && box.value == "") {
          toCheck = [
            ...toCheck, 
            ...this.calcAreaToOpen(box.id, selected)
          ]
        }
      });

      return toCheck;
    },

    uncoverBombs() {
      this.boxes.forEach(box => {
        if (box.value == "x") box.covered = false;
      })
    },

    uncoverArea(_id) {
      const ids = this.calcAreaToOpen(_id);

      this.boxes.forEach(box => {
        if (ids.includes(box.id) && !box.flagged) box.covered = false;
      });
    },

    uncoverNums(_id) {
      const box = this.boxes[_id];
      const aroundIDs = this.calcAround(box.id);

      let boxesToUncover = this.boxes.filter(x => aroundIDs.includes(x.id));
      boxesToUncover = boxesToUncover.filter(x => x.covered);

      flaggedCounter = (boxesToUncover.filter(x => x.flagged)).length;
      if (flaggedCounter != box.value) return;

      boxesToUncover = boxesToUncover.filter(box => !box.flagged);
      boxesToUncover.forEach(box => this.onClick(box.id));
    },

    coverAllBoxes() {
      this.boxes.forEach(box => {
        box.covered = true;
        box.flagged = false;
      })
    },

    gameOverHandler() {
      this.gameOver = true;
      this.uncoverBombs();

      clearInterval(this.timer);
    },

    onClick(_id) {
      if (this.gameOver) return;

      const box = this.boxes[_id];

      // ignore if the box is flagged
      if (box.flagged) return;

      // game over if the uncovered box is a bomb
      if (box.value == "x") this.gameOverHandler();

      // if the box is empty uncover the area
      if (box.value == "") this.uncoverArea(_id);

      // clicked on uncovered box
      if (!box.covered) this.uncoverNums(_id);

      // just uncover the box
      box.covered = false;
    },

    onClickRight(_id) {
      if (this.gameOver) return;
      const box = this.boxes[_id];
      if (box.covered) box.flagged = !box.flagged;
    },

    onNewGame() {
      this.gameOver = false;
      this.startTime = Date.now();
      this.playTime = 0;
      this.timer = null;

      this.boxes = getMap();
    },

    onRetry() {
      this.gameOver = false;
      this.startTime = Date.now();
      this.playTime = 0;
      this.timer = null;

      this.startTimer();
      this.coverAllBoxes();
    },

  }
})
