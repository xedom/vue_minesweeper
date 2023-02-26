document.oncontextmenu = function() {
  return false;
}

const app = new Vue({
  el: '#app',
  data: {
    game: null,

    playTime: 0,
    
    gameStatus: "xxxxxx",
    difficulty: "expert",
    difficulties: [
      GameDifficulty.Beginner,
      GameDifficulty.Intermediate,
      GameDifficulty.Advanced,
    ],
  },
  created: function () {
    // this.startTimer();
    this.keyHandler();

    // creating a new game
    this.createGame(GameDifficulty.Advanced);
  },
  methods: {
    onGameStart() {
      console.log("main.onGameStart");
    },
    onGameStatusChange(status) {
      console.log("main.onGameStatusChange: " + status);
      this.gameStatus = status;
    },
    onGameWon() {
      console.log("main.onGameWon");
    },
    onGameLost() {
      console.log("main.onGameLost");
    },
    onGameDifficultyChange(difficulty) {
      console.log("main.onGameDifficultyChange: " + difficulty);
      this.difficulty = difficulty;
    },
    onGameTimeChange(time) {
      this.playTime = time;
    },

    parseTime(time) {
      let milliseconds = (time % 1000);
      let seconds = Math.floor(time / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      seconds = seconds % 60;
      minutes = minutes % 60;
      return `${
        hours.toString().padStart(2, '0')
      }:${
        minutes.toString().padStart(2, '0')
      }:${
        seconds.toString().padStart(2, '0')
      }.${
        milliseconds.toString().slice(0, 3).padStart(3, '0')
      }`;
    },

    onChangeDifficulty(e) {
      let difficulty = e.target.value;
      
      console.log("difficulty: " + difficulty);
      this.createGame(GameDifficulty[difficulty]);
    },
    onNewGame() {
      this.createGame(GameDifficulty.Advanced);
    },
    createGame(difficulty = GameDifficulty.Advanced) {
      console.log("createGame: " + difficulty);

      if (this.game) {
        this.game.stop();
        this.game = null;
      }
      
      const listeners = [
        this.onGameStart,
        this.onGameWon,
        this.onGameLost,
        this.onGameStatusChange,
        this.onGameDifficultyChange,
        this.onGameTimeChange,
      ];

      switch (difficulty) {
        case GameDifficulty.Beginner:
          this.game = new Game(8, 8, 10, listeners); break;
        case GameDifficulty.Intermediate:
          this.game = new Game(16, 16, 40, listeners); break;
        case GameDifficulty.Advanced:
          this.game = new Game(30, 16, 99, listeners); break;
        case GameDifficulty.Custom:
          this.game = new Game(30, 16, 10, listeners); break;
        default:
          break;
      }
    },
    keyHandler() {
      // window.addEventListener('keydown', (e) => {
      //   if (e.ctrlKey && e.key === 'z') {
      //     this.coverBombs();
      //     this.gameOver = false;
      //     const lstPlayTime = this.playTime;
      //     this.startTimer();
      //     this.startTimeDate = Date.now() - (lstPlayTime*1000);
      //     this.gameStatus = "Playing (CheatMode)";
      //   }
      // });
    },
  }
})
