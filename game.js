const GameStatus = createEnum([
  'Starting',
  'Playing',
  'Playing (CheatMode)',
  'GameOver',
  'Stopped',
  'Won',
]);

const GameDifficulty = createEnum([
  'Beginner',
  'Intermediate',
  'Advanced',
  'Custom',
]);

class Move {
  constructor(clickedField, fields) {
    this.clickedField = clickedField;
    this.fields = fields;
  }
}

class Field {
  constructor(id, x, y, value) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.setValue(value);
    this.covered = true;
    this.flagged = false;
  }
  setValue(value) {
    this.value = value;
  }
  displayValue() {
    if (this.flagged) return '🚩';
    if (this.covered) return '';
    if (this.isBomb()) return '💣';
    if (this.value == 0) return '';
    return this.value;
  }
  setCovered(covered) {
    if (this.flagged) return;
    this.covered = covered;
  }
  isBomb() {
    return this.value == 9;
  }
}

class Game {
  constructor(width, height, bombsCount, listeners) {
    this.addListeners(...listeners);

    this.width = width;
    this.height = height;
    this.bombsCount = bombsCount;

    this.fields = []; // <Field>
    this.moves = []; // <Move>
    
    this.gameStatus = GameStatus.Starting;
    this.gameDifficulty = this.getDifficulty();
    this.won = false;

    this.time = 0;
    this.timer = null;
    this.startDateTime = null;
    this.endDateTime = null;

    this.createEmptyFields();
    this.onGameTimeChange(this.time);
    this.onGameDifficultyChange(this.gameDifficulty);
  }
  createEmptyFields() {
    this.fields = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const id = y * this.width + x;
        this.fields.push(new Field(id, x, y, 0));
      }
    }
  }
  populateFields(clickedField) {
    this.generateBombs(clickedField.id);
    this.calculateNumbers();
  }
  generateBombs(clickedField) {
    const safeZone = this.getAdjacentFieldsID(clickedField, this.width, this.height);
    const bombs = [];
    while (bombs.length < this.bombsCount) {
      const bombField = this.fields[Math.floor(Math.random() * this.fields.length)];
      
      if (safeZone.includes(bombField.id)) continue;
      if (bombs.includes(bombField)) continue;

      bombField.value = 9;
      bombs.push(bombField);
    }
  }
  calculateNumbers() {
    this.fields.forEach(field => {
      if (field.isBomb()) return;
      let count = 0;
      const adjacentFieldsID = this.getAdjacentFieldsID(field.id, this.width, this.height);
      adjacentFieldsID.forEach(fieldID => {
        if (this.fields[fieldID].isBomb()) count++;
      });
      field.setValue(count);
    });
  }
  getAdjacentFieldsID(fieldID, width, height) {
    const row = Math.floor(fieldID / width);
    const col = fieldID % width;
  
    let toCheck = [
      [row-1,col-1],[row-1,col],[row-1,col+1],
      [row  ,col-1],[row  ,col],[row  ,col+1],
      [row+1,col-1],[row+1,col],[row+1,col+1],
    ];
    toCheck = toCheck.filter(coord => coord[0] >=0 && coord[0] < height);
    toCheck = toCheck.filter(coord => coord[1] >=0 && coord[1] < width);
    toCheck = toCheck.map(coord => (width*coord[0])+coord[1]);
  
    return toCheck;
  }
  getDifficulty() {
    if (this.width === 8 && this.height === 8 && this.bombsCount === 10)
      return GameDifficulty.Beginner;
    if (this.width === 16 && this.height === 16 && this.bombsCount === 40)
      return GameDifficulty.Intermediate;
    if (this.width === 30 && this.height === 16 && this.bombsCount === 99)
      return GameDifficulty.Advanced;

    return GameDifficulty.Custom;
  }
  getField(h, w) {
    return this.fields[(h-1) * this.width + (w-1)];
  }
  isGameOver() {
    return this.gameStatus === GameStatus.GameOver;
  }
  startTimer() {
    this.startDateTime = new Date();
    this.timer = setInterval(() => {
      this.time = Math.floor((new Date() - this.startDateTime));
      this.onGameTimeChange(this.time);
    }, 100);
  }
  stopTimer() {
    this.endDateTime = new Date();
    clearInterval(this.timer);
  }
  start(field) {
    this.populateFields(field);
    this.gameStatus = GameStatus.Playing;
    this.startTimer();
    this.onGameStart();
    this.onGameStatusChange(this.gameStatus);
    this.onGameDifficultyChange(this.gameDifficulty);
    this.onGameTimeChange(this.time);
  }
  stop() {
    this.setStatus(GameStatus.Stopped);
    this.stopTimer();
    this.removeListeners();
    this.onGameStatusChange(this.gameStatus);
  }
  addListeners(
    onGameStart = () => {},
    onGameWon = () => {},
    onGameLost = () => {},
    onGameStatusChange = (status) => {},
    onGameDifficultyChange = (difficulty) => {},
    onGameTimeChange = (time) => {},
  ) {
    this.onGameStart = onGameStart;
    this.onGameWon = onGameWon;
    this.onGameLost = onGameLost;
    this.onGameStatusChange = onGameStatusChange;
    this.onGameDifficultyChange = onGameDifficultyChange;
    this.onGameTimeChange = onGameTimeChange;
  }
  removeListeners() {
    this.onGameStart = () => {};
    this.onGameWon = () => {};
    this.onGameLost = () => {};
    this.onGameStatusChange = (status) => {};
    this.onGameDifficultyChange = (difficulty) => {};
    this.onGameTimeChange = (time) => {};
  }
  setStatus(status) {
    this.gameStatus = status;
    this.onGameStatusChange(this.gameStatus);
  }
  wonGame() {
    this.setStatus(GameStatus.Won);
    this.won = true;
    this.stopTimer();
    this.onGameWon();
  }
  lostGame() {
    this.setStatus(GameStatus.GameOver);
    this.stopTimer();
    this.uncoverBombFields();
    this.onGameLost();
  }
  onFieldClick(field) {
    if (this.isGameOver()) return;
    if (this.gameStatus === GameStatus.Starting) this.start(field);
    if (field.flagged) return;

    this.uncoverField(field);
    if (field.isBomb()) {
      this.lostGame(); return;
    }

    this.uncoverAdjacentFields(field);
    if (this.fields.filter(field => field.covered && !field.isBomb()).length === 0) {
      this.wonGame();
    }
  }
  uncoverField(field) {
    if (!field.covered) return;
    if (field.flagged) return;
    
    field.setCovered(false);
    if (field.isBomb()) {
      this.lostGame();
      return;
    }
  }
  onFieldRightClick(field) {
    // if (this.gameStatus === GameStatus.Starting) this.start();
    if (this.gameStatus === GameStatus.Won) return;
    if (this.gameStatus === GameStatus.GameOver) return;
    if (this.isGameOver()) return;
    if (!field.covered) return;
    field.flagged = !field.flagged;
  }
  uncoverAdjacentFields(field) {
    if (field.value === 0) this.uncoverEmptyFields(field);
    if (field.value !== 0) this.uncoverNumberFields(field);
  }
  uncoverEmptyFields(field) {
    if (field.value !== 0) return;
    const adjacentFieldsID = this.getAdjacentFieldsID(field.id, this.width, this.height);
    for(let fieldID of adjacentFieldsID) {
      const adjacentField = this.fields[fieldID];
      if (!adjacentField.covered) continue;

      this.uncoverField(adjacentField);
      this.uncoverAdjacentFields(adjacentField);
    }
  }
  uncoverNumberFields(field) {
    const adjacentFieldsID = this.getAdjacentFieldsID(field.id, this.width, this.height);
    let flaggedCount = 0;
    for(let fieldID of adjacentFieldsID) {
      const adjacentField = this.fields[fieldID];
      if (adjacentField.flagged) flaggedCount++;
    }
    if (flaggedCount === field.value) {
      for(let fieldID of adjacentFieldsID) {
        const adjacentField = this.fields[fieldID];
        if (!adjacentField.covered) continue;
        this.uncoverField(adjacentField);
        this.uncoverAdjacentFields(adjacentField);
      }
    }
  }
  uncoverBombFields() {
    this.fields.forEach(field => {
      if (field.isBomb()) this.uncoverField(field);
    });
  }
  getFlagsCount() {
    return this.fields.filter(field => field.flagged).length;
  }
}
