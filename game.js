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
  constructor(id, x, y, value) {
    this.id = id;
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
    this.fields = []; // <Field>
    this.moves = []; // <Move>
    this.won = false;
    this.gameStatus = GameStatus.Starting;
    this.time = 0;
    this.timer = null;
    this.startDateTime = null;
    this.endDateTime = null;

    this.createEmptyFields();
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
    this.generateBombs(clickedField);
    this.calculateNumbers();
  }
  generateBombs(clickedField) {
    const safeZone = this.getAdjacentFieldsID(clickedField, width, height);
    const bombs = [];
    while (bombs.length < this.bombsCount) {
      const bombField = this.fields[Math.floor(Math.random() * this.fields.length)];
      
      if (safeZone.includes(bombField.id)) continue;
      if (bombs.includes(bombField)) continue;

      bombField.value = 'x';
      bombs.push(bombField);
    }
  }
  calculateNumbers() {
    this.fields.forEach(field => {
      if (field.value === 'x') return;
      let count = 0;
      const adjacentFieldsID = this.getAdjacentFieldsID(field.id, this.width, this.height);
      adjacentFieldsID.forEach(fieldID => {
        if (this.fields[fieldID].value === 'x') count++;
      });
      field.value = count;
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
}