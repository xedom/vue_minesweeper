class GameReplay {
  constructor() {
    this.replay = [];
  }

  addMove(move) {
    this.replay.push(move);
  }

  getReplay() {
    return this.replay;
  }
}