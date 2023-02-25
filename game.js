const GameStatus = createEnum([
  'Starting',
  'Playing',
  'Playing (CheatMode)',
  'GameOver',
  'Won',
]);

class Move {
  constructor(clickedField, fields) {
    this.clickedField = clickedField;
    this.fields = fields;
  }
}

class Field {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.covered = true;
    this.flagged = false;
  }
}

class Game {
  constructor(width, height, bombsCount) {
    this.width = width;
    this.height = height;
    this.bombsCount = bombsCount;
    this.fields = [];
    this.moves = [];
    this.won = false;
    this.gameStatus = GameStatus.Starting;
    this.time = 0;
    this.timer = null;
  }
}