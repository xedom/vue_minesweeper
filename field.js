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