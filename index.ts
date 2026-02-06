// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com
import runServer from './server';
import { Coord, GameState, InfoResponse, MoveResponse } from './types';
import { Grid, AStarFinder } from "pathfinding";

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info(): InfoResponse {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "",       // TODO: Your Battlesnake Username
    color: "#888888", // TODO: Choose color
    head: "default",  // TODO: Choose head
    tail: "default",  // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState: GameState): void {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState: GameState): void {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data
function move(gameState: GameState): MoveResponse {

  let isMoveSafe: { [key: string]: boolean; } = {
    up: true,
    down: true,
    left: true,
    right: true
  };

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
    isMoveSafe.left = false;

  } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
    isMoveSafe.right = false;

  } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
    isMoveSafe.down = false;

  } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  let boardWidth = gameState.board.width;
  let boardHeight = gameState.board.height;


  // er vi langs venstre vegg
  if (gameState.you.head.x == 0) {
    isMoveSafe.left = false;
  }

  if (gameState.you.head.x == boardWidth - 1) {
    isMoveSafe.right = false;
  }
  if (gameState.you.head.y == 0) {
    isMoveSafe.down = false;
  }
  if (gameState.you.head.y == boardHeight - 1) {
    isMoveSafe.up = false;
  }

  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself

  // gameState.you.body.forEach((bodyBlock, index) => {

  //   if (gameState.you.body.length - 1 == index) {
  //     return;
  //   }

  //   if (bodyBlock.x + 1 == myHead.x && bodyBlock.y == myHead.y) {        // Body is left of head, don't move left
  //     isMoveSafe.left = false;

  //   } else if (bodyBlock.x - 1 == myHead.x && bodyBlock.y == myHead.y) { // Body is right of head, don't move right
  //     isMoveSafe.right = false;

  //   } else if (bodyBlock.y + 1 == myHead.y && bodyBlock.x == myHead.x) { // Body is below head, don't move down
  //     isMoveSafe.down = false;

  //   } else if (bodyBlock.y - 1 == myHead.y && bodyBlock.x == myHead.x) { // Body is above head, don't move up
  //     isMoveSafe.up = false;
  //   }
  // })

  // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
  gameState.board.snakes.forEach((snake) => {
    snake.body.forEach((bodyBlock, index) => {

      if (snake.body.length - 1 == index) {
        return;
      }

      if (bodyBlock.x + 1 == myHead.x && bodyBlock.y == myHead.y) {        // Body is left of head, don't move left
        isMoveSafe.left = false;

      } else if (bodyBlock.x - 1 == myHead.x && bodyBlock.y == myHead.y) { // Body is right of head, don't move right
        isMoveSafe.right = false;

      } else if (bodyBlock.y + 1 == myHead.y && bodyBlock.x == myHead.x) { // Body is below head, don't move down
        isMoveSafe.down = false;

      } else if (bodyBlock.y - 1 == myHead.y && bodyBlock.x == myHead.x) { // Body is above head, don't move up
        isMoveSafe.up = false;
      }
    })
  })

  //Build map
  let myMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]


  gameState.board.snakes.forEach((snake) => {
    snake.body.forEach((bodyBlock, index) => {
      if (index < snake.body.length - 1)
        myMatrix[bodyBlock.y][bodyBlock.x] = 1;
    });
  });


  const myGrid = new Grid(myMatrix)

  const aStarInstance = new AStarFinder();

  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  // Strategy chooser:
  let nextMove = ""
  let ourSnake = gameState.you
  let enemySnake = gameState.board.snakes.find(e => e.id !== ourSnake.id);

  if (enemySnake && ourSnake.length > enemySnake.length) {
    // if (gameState.you.length > 5 && Math.floor(gameState.turn / 5) % 2 == 0) {
    console.log("strategi KILLKILL")
    // nextMove = moveToPoint(gameState, safeMoves, Math.floor(gameState.board.width / 2), Math.floor(gameState.board.height / 2), aStarInstance, myGrid)
    nextMove = interceptEnemyHead(gameState, safeMoves, aStarInstance, myGrid)
  } else {
    console.log("strategi eate")
    nextMove = tryToEatNearbyFood(gameState, safeMoves, aStarInstance, myGrid, myMatrix)
    // 
  }

  if (nextMove == "") {
    nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
  const food = gameState.board.food;

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove };
}


const moveToPoint = (gameState: GameState, safeMoves: string[], targetX: number, targetY: number, aStarInstance: AStarFinder, myGrid: Grid): string => {
  let nextMove = ""

  // desired start coordinate = 6,6
  let head = gameState.you.head
  if (head.x == targetX && head.y == targetY) {
    return nextMove
  }
  // if (head.x < targetX) {
  //   if (safeMoves.includes("right")) {
  //     nextMove = "right";
  //   }
  // }

  // if (head.x > targetX) {
  //   if (safeMoves.includes("left")) {
  //     nextMove = "left";
  //   }
  // }
  // if (head.y > targetY) {
  //   if (safeMoves.includes("down")) {
  //     nextMove = "down";
  //   }
  // }
  // if (head.y < targetY) {
  //   if (safeMoves.includes("up")) {
  //     nextMove = "up";
  //   }
  // }
  console.log("target x: ", targetX)
  console.log("target y: ", targetY)
  console.log("head X: ", head.x)
  console.log("head Y: ", head.y)
  const path = aStarInstance.findPath(head.x, head.y, targetX, targetY, myGrid);
  const firstStep = path[1];
  console.log("Full path: ", path)
  if (path.length == 0) {
    return nextMove
  }
  let firstStepX = firstStep[0]
  let firstStepY = firstStep[1]

  if (firstStepX == head.x) {
    if (firstStepY < head.y) {
      nextMove = "down"
    }
    else {
      nextMove = "up"
    }
  }


  if (firstStepY == head.y) {
    if (firstStepX < head.x) {
      nextMove = "left"
    }
    else {
      nextMove = "right"
    }
  }

  return nextMove;
}

const interceptEnemyHead = (gameState: GameState, safeMoves: string[], aStarInstance: AStarFinder, myGrid: Grid): string => {
  let nextMove = "";

  const { closestFood, rangeToClosestFood } = distanceFinderFood(gameState)
  if (rangeToClosestFood < 2) {
    console.log("Closest food: ", closestFood, " move to point: ", closestFood.x, closestFood.y)
    return moveToPoint(gameState, safeMoves, closestFood.x, closestFood.y, aStarInstance, myGrid)
  }


  // desired start coordinate = right before enemy head.
  let ourSnake = gameState.you
  let enemySnake = gameState.board.snakes.find(e => e.id !== ourSnake.id);

  //early return if enemy snake is not found
  if (enemySnake == undefined) return nextMove


  const headIsMovingToX = enemySnake.head.x - enemySnake.body[1].x
  const headIsMovingToY = enemySnake.head.y - enemySnake.body[1].y

  let newTargetX = 0
  const isMovingToX = enemySnake.head.x + headIsMovingToX
  if (isMovingToX < 0 || isMovingToX >= 11) {
    // ikke mulig å fortsette rett på x aksen
    return ""
  }

  let newTargetY = 0
  const isMovingToY = enemySnake.head.y + headIsMovingToY
  if (isMovingToY < 0 || isMovingToY >= 11) {
    // ikke mulig å fortsette rett på y aksen
    return ""
  }

  return moveToPoint(gameState, safeMoves, enemySnake.head.x + headIsMovingToX, enemySnake.head.y + headIsMovingToY, aStarInstance, myGrid)

  console.log(ourSnake)



  return nextMove
}

const tryToEatNearbyFood = (gameState: GameState, safeMoves: string[], aStarInstance: AStarFinder, myGrid: Grid, myMatrix: number[][]): string => {
  const { closestFood, rangeToClosestFood } = distanceFinderFood(gameState)

  // avoid nearby snake head
  let ourSnake = gameState.you
  let enemySnake = gameState.board.snakes.find(e => e.id !== ourSnake.id);
  if (enemySnake == undefined) {
    return ""
  }

  if (enemySnake.head.x + 1 < 11) myMatrix[enemySnake.head.x + 1][enemySnake.head.y] = 1
  if (enemySnake.head.x - 1 >= 0) myMatrix[enemySnake.head.x - 1][enemySnake.head.y] = 1
  if (enemySnake.head.y + 1 < 11) myMatrix[enemySnake.head.x][enemySnake.head.y + 1] = 1
  if (enemySnake.head.y - 1 >= 0) myMatrix[enemySnake.head.x][enemySnake.head.y - 1] = 1
  myGrid = new Grid(myMatrix)


  return moveToPoint(gameState, safeMoves, closestFood.x, closestFood.y, aStarInstance, myGrid)

}

const distanceFinderFood = (gameState: GameState) => {
  let closestFood: Coord = { x: 6, y: 6 };
  let rangeToClosestFood = 10000;
  gameState.board.food.forEach((food) => {
    const realFood = food
    const absX = Math.abs(gameState.you.head.x - food.x)
    const absY = Math.abs(gameState.you.head.y - food.y)

    let disctance = Math.sqrt(Math.pow(absX, 2) + Math.pow(absY, 2))
    console.log("Food pos: ", food, " distance: ", disctance)
    if (rangeToClosestFood > disctance) {
      rangeToClosestFood = disctance;
      closestFood = realFood;
    }

  })

  return { closestFood, rangeToClosestFood }
}
runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
