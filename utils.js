function calcAdjacentBoxes(_id, width, height) {
  const row = Math.floor(_id / width);
  const col = _id % width;

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

// beginner = generateMap(8, 8, 10, safebox)
// intermediate = generateMap(16, 16, 40, safebox)
// expert = generateMap(30, 16, 99, safebox)

function countMines(boxes) {
  return boxes.filter(x => x == 9).length
}

function generateMap(width, height, mines, safebox) {
  let emptyMap = Array(width*height);
  let initializedMap = emptyMap.fill(0);

  if (width == undefined || height == undefined || width < 1 || height < 1) throw new Error(`invalid functions parameters`);
  if (width*height < mines && safebox == undefined) throw new Error(`too many mines, boxes: ${width*height} mines: ${mines}`);
  if (width*height-9 < mines && safebox != undefined) throw new Error(`too many mines, boxes: ${width*height} mines: ${mines} safeboxes: 9`);

  let safezone = calcAdjacentBoxes(safebox, width, height)

  // adding bombs to the map
  let addedMines = 0;
  while (addedMines < mines) {
    let randomID = Math.random()*width*height;
    randomID = Math.round(randomID);

    if (initializedMap[randomID] == 0 && !safezone.includes(randomID)) {
      initializedMap[randomID] = 9;
      addedMines++;
    }
  }
  
  // adding bomb counter around the bombs
  for (let i = 0; i < width*height; i++) {
    if (initializedMap[i] == 9) continue;
    let adjacentBoxesIDs = calcAdjacentBoxes(i, width, height);
    let adjacentBoxes = adjacentBoxesIDs.map(x => initializedMap[x]);
    let bombCounter = countMines(adjacentBoxes);

    initializedMap[i] = bombCounter;
  }

  return initializedMap;
}

function getMap(gamemap = null, clickedBoxID = null) {
  if (gamemap == null) gamemap = generateMap(30, 16, 99, clickedBoxID);
  //generateMap(2, clickedBoxID);

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
    flagged: false,
  }));
  return gamemap;
}