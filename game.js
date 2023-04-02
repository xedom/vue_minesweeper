const GameStatus = createEnum([
  'Starting',
  'Playing',
  'CheatMode',
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

class Game {
  constructor(width, height, bombsCount, listeners) {
    this.addListeners(...listeners);

    this.width = width;
    this.height = height;
    this.bombsCount = bombsCount;

    this.fields = []; // <Field>
    this.moves = []; // <Move>
    this.lstMove = null; // <Move>
    
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
  getAdjacentFields(field, width, height) {
    const fieldsID = this.getAdjacentFieldsID(field.id, width, height);
    const fields = fieldsID.map(id => this.fields[id]);

    return fields;
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
    const x = w-1;
    const y = h-1;
    const fieldPosition = (y) * this.width + (x);
    const field = this.fields[fieldPosition];
    if (!field) return new Field(fieldPosition, x, y, 11);
    return field;
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
    this.time = Math.floor((this.endDateTime - this.startDateTime));
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
    if (this.isEnded()) return;
    if (this.gameStatus === GameStatus.Starting) this.start(field);
    if (field.flagged) return;

    const move = new Move(MoveType.Uncover, field);
    if (this.lstMove === null) {
      this.lstMove = move;
      this.moves.push(this.lstMove);
    } else if (!this.lstMove.equals(move)) {
      this.moves.push(move);
      this.lstMove = move;
    };

    this.uncoverFieldAndCheck(field);
    this.uncoverAdjacentFields(field);
    if (this.fields.filter(field => field.covered && !field.isBomb()).length === 0) {
      this.wonGame();
      this.flagRemainingBombFields();
    }
  }
  onFieldRightClick(field) {
    if (this.isEnded()) return;
    if (!field.covered) {
      this.onFieldClick(field);
      return;
    };
    
    this.moves.push(new Move(MoveType.Flag, field));
    field.flagged = !field.flagged;
  }
  uncoverField(field) {
    if (!field.covered) return;
    if (field.flagged) return;
    
    field.setCovered(false);
  }
  uncoverFieldAndCheck(field) {
    this.uncoverField(field);
    if (field.isBomb() && !field.covered) this.lostGame();
  }
  uncoverAdjacentFields(field) {
    if (field.flagged) return;

    this.uncoverEmptyFields(field);
    this.uncoverNumberFields(field);
  }
  uncoverEmptyFields(field) {
    if (field.value !== 0) return;
    const adjacentFieldsID = this.getAdjacentFieldsID(field.id, this.width, this.height);
    for(let fieldID of adjacentFieldsID) {
      const adjacentField = this.fields[fieldID];
      if (!adjacentField.covered) continue;

      this.uncoverFieldAndCheck(adjacentField);

      if (adjacentField.value === 0)
        this.uncoverEmptyFields(adjacentField);
    }
  }
  uncoverNumberFields(field) {
    if (field.value === 0) return;
    const adjacentFields = this.getAdjacentFields(field, this.width, this.height);
    const flaggedCount = adjacentFields.filter(field => field.flagged).length;

    if (flaggedCount !== field.value) return;

    // uncover all adjacent not flagged fields
    for(let field of adjacentFields) {
      this.uncoverFieldAndCheck(field);
      if (field.value === 0) this.uncoverEmptyFields(field);
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
  flagRemainingBombFields() {
    this.fields.forEach(field => {
      if (field.isBomb() && !field.flagged) field.flagged = true;
    });
  }
  isEnded() {
    return this.endDateTime;
  }
  activateCheatMode() {
    // todo: add cheat mode
    if (!this.isEnded()) return;
    if (this.won) return;

    this.setStatus(GameStatus.CheatMode);
  }
  /*
  * GameInfo format:
  * difficulty$won$width$height$startDateTime$endDateTime$gameFields$moves
  */
  exportMoves() {
    let gameInfo = `${this.gameDifficulty}$${this.won}$`;
    gameInfo += `${this.width}$${this.height}$`;
    gameInfo += `${this.startDateTime.toISOString()}$${this.endDateTime.toISOString()}$`;
    gameInfo += `${this.fields.map(field => field.value).join("")}$`;

    const movesList = this.moves.map(move => move.export());
    const movesJoined = movesList.join("|");

    return gameInfo+movesJoined;
  }
}
