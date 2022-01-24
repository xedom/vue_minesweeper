document.oncontextmenu = function() {
  return false;
}

const app = new Vue({
  el: '#app',
  data: {
    boxes: null,
    gameOver: false,
    startTime: Date.now(),
    playTime: 0,
    timer: null,
    placeHolderMap: true,
    difficulty: "expert",
    height: 0,
    width: 0,
    mines: 0,
  },
  created: function () {
    // this.startTimer();
    this.keyHandler();
    this.gameStatus = "Waiting";

    // setting default difficulty
    this.difficulty = "expert";
    this.height = 16;
    this.width = 30;
    this.mines = 99;

    // placeholder
    this.boxes = [];

    for(let i = 0; i < this.height*this.width; i++) {
      this.boxes.push({ 
        id: i,
        value: 0,
        covered: true,
        flagged: false,
      });
    }
    this.placeHolderMap = true;
  },
  methods: {
    getBox(_id, prop) {
      console.log(_id);
      console.log(prop);
    },

    startTimer() {
      if (this.timer != null) return;
      this.timer = setInterval(() => {
        this.playTime = this.getPlaytime();
      }, 100)
    },

    setDifficultySettings() {
      if (this.difficulty == "beginner") {
        this.width = 8;
        this.height = 8
        this.mines = 10;
      } else if (this.difficulty == "intermediate") {
        this.width = 16;
        this.height = 16
        this.mines = 40;
      } else if (this.difficulty == "expert") {
        this.width = 30;
        this.height = 16
        this.mines = 99;
      }
      // else if (this.difficulty == "custom") {
      //   this.width =
      // }
    },

    onChangeDifficulty(e) {
      let curr_difficulty = e.target.value;
      
      console.log("difficulty: " + curr_difficulty);
      this.difficulty = curr_difficulty;

      this.setDifficultySettings();
      this.onNewGame();
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

    calcAreaToOpen(_id, selected = [], depth = 0) {
      if (depth > 4) return;
      selected.push(_id);

      toCheck = calcAdjacentBoxes(_id, this.width, this.height);
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

    coverBombs() {
      this.boxes.forEach(box => {
        if (box.value == "x") box.covered = true;
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
      const aroundIDs = calcAdjacentBoxes(box.id, this.width, this.height);

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
      this.gameStatus = "Game Over";

      clearInterval(this.timer);
      this.timer = null;
    },

    checkWin() {
      const notBombCount = this.boxes.filter(box => box.value != "x").length;
      const uncoveredBoxesCount = this.boxes.filter(box => !box.covered).length;

      if (notBombCount == uncoveredBoxesCount) {
        this.gameOver = true;
        this.uncoverBombs();
        this.gameStatus = "Won";

        clearInterval(this.timer);
        this.timer = null;
      }
    },

    onClick(_id) {
      if (this.gameOver) return;
      
      this.gameStatus = "Playing";

      if (this.placeHolderMap) {
        this.setDifficultySettings();

        let newmap = generateMap(this.width, this.height, this.mines, _id);
        this.boxes = getMap(newmap);
        this.placeHolderMap = false;
      }

      this.startTimer();
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

      this.checkWin();
    },

    onClickRight(_id) {
      if (this.gameOver) return;
      const box = this.boxes[_id];
      if (box.covered) box.flagged = !box.flagged;
    },

    onNewGame() {
      this.gameOver = false;
      clearInterval(this.timer);
      this.timer = null;
      this.startTime = Date.now();
      this.playTime = 0;
      
      this.boxes = [];

      for(let i = 0; i < this.height*this.width; i++) {
        this.boxes.push({ 
          id: i,
          value: 0,
          covered: true,
          flagged: false,
        });
      }
      this.placeHolderMap = true;

      // this.boxes = getMap();
    },

    keyHandler() {
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
          this.coverBombs();
          this.gameOver = false;
          this.startTimer();
          this.gameStatus = "Playing";
        }
      });
    },
  }
})
