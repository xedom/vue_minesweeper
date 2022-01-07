function genID() {
  return Math.floor(Math.random() * 999999999);
  // return Date.now();
}

document.oncontextmenu = function() {
  return false;
}

function getMap(gamemap) {
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
    flag: false
  }));
  return gamemap;
}

const app = new Vue({
  el: '#app',
  data: { boxes: getMap(map001), gameOver: false },
  methods: {
    calcAround(_id) {
      const row = Math.floor(_id / 30);
      const col = _id % 30;

      let toCheck = [
        [row-1,col-1],[row-1,col],[row-1,col+1],
        [row  ,col-1],[row  ,col+1],
        [row+1,col-1],[row+1,col],[row+1,col+1],
      ];
      toCheck = toCheck.filter(coord => coord[0] >=0 && coord[0] <16);
      toCheck = toCheck.filter(coord => coord[1] >=0 && coord[1] <30);
      toCheck = toCheck.map(coord => (30*coord[0])+coord[1]);

      return toCheck;
    },

    calcAreaToOpen(_id, selected = [], depth = 0) {
      // console.log("--------------");
      if (depth > 4) return;
      selected.push(_id);

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

    onClickRight(_id) {
      // console.log(_id);
      this.boxes.forEach(box => {
        if (box.id == _id && box.covered) {
          box.flag = !box.flag;
        }
      })
    },


    onClick(_id) {
      if (this.gameOver) return;

      this.boxes.map(x => {
        if (x.id == _id && x.covered) {
          if (x.flag) {
            return x;
          }

          x.covered = false;
          if (x.value == "x") {
            this.gameOver = true;
            alert("Game Over!")
          }

          if (x.value == "") {
            const ids = this.calcAreaToOpen(_id);
            // console.log(ids);

            this.boxes.forEach(box => {
              if (ids.includes(box.id) && !box.flag) {
                box.covered = false;
              }
            });
          }
        } else if (x.id == _id && !x.covered) {
          const aroundIDS = this.calcAround(x.id);
          const val = x.value;

          let boxees = this.boxes.filter(box => aroundIDS.includes(box.id))
          boxees = boxees.filter(box => box.covered)

          flagged = (boxees.filter(box => box.flag)).length

          if (flagged != val) return x;

          boxees = boxees.filter(box => !box.flag)

          // console.log("boxees",boxees)

          boxees.forEach(box => {
            this.onClick(box.id)
          })

        }

        return x;
      });
    
      if (this.gameOver) {
        this.boxes.forEach(box => {
          if (box.value == "x") {
            box.covered = false;
          }
        })
      }

    }
  }
})
