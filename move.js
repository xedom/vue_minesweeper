const MoveType = createEnum([
  'Uncover',
  'UncoverAdjacent',
  'Flag',
]);

class Move {
  constructor(moveType, clickedField) {
    this.moveType = moveType;
    this.clickedField = clickedField;

    this.time = new Date();
  }
  display() {
    const time = this.time.toLocaleTimeString();
    const field = this.clickedField;
    
    return `${time} - ${this.moveType} - ${field.x}, ${field.y}`;
  }
  equals(move) {
    return this.moveType === move.moveType
      && this.clickedField.id === move.clickedField.id;
  }
  export(startTime) {
    const timeDiff = this.time - startTime;
    const field = this.clickedField;
    const symbolMoveType = {
      'Uncover': 'u',
      'UncoverAdjacent': 'a',
      'Flag': 'f',
    }[this.moveType];

    const timeConverted = convert(timeDiff,64)
    const exportString = `${timeConverted}|${symbolMoveType}|${field.x}|${field.y}`;
    const exportAsciis = exportString.split('').map(c => c.charCodeAt(0));
    const exportBase64 = exportAsciis.map(ascii => convert(ascii, 64));
    const exportConverted = exportBase64.join('')
    // return convert(decNum, base)(`${time} | ${symbolMoveType} | ${field.x} | ${field.y}`)
    return exportConverted;
  }
}