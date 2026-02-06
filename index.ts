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



  // Are there any safe moves left?
  const safeMoves = Object.keys(isMoveSafe).filter(key => isMoveSafe[key]);
  if (safeMoves.length == 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: "down" };
  }

  // Choose a random move from the safe moves
  // Strategy chooser:
  let nextMove = ""
  if (gameState.you.length > 5 && gameState.turn % 5) {
    nextMove = moveCloserToMiddle(gameState, safeMoves, gameState.board.width / 2, gameState.board.height / 2)
  } else {
    nextMove = tryToEatNearbyFood(gameState, safeMoves)
    // nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
  const food = gameState.board.food;

  console.log(`MOVE ${gameState.turn}: ${nextMove}`)
  return { move: nextMove };
}


const moveCloserToMiddle = (gameState: GameState, safeMoves: string[], targetX: number, targetY: number): string => {
  let nextMove = "";

  // desired start coordinate = 6,6
  let head = gameState.you.head
  if (head.x < targetX) {
    if (safeMoves.includes("right")) {
      nextMove = "right";
    }
  }

  if (head.x > targetX) {
    if (safeMoves.includes("left")) {
      nextMove = "left";
    }
  }
  if (head.y > targetY) {
    if (safeMoves.includes("down")) {
      nextMove = "down";
    }
  }
  if (head.y < targetY) {
    if (safeMoves.includes("up")) {
      nextMove = "up";
    }
  }



  return nextMove
}

const interceptEnemyHead = (gameState: GameState, safeMoves: string[]): string => {
  let nextMove = "";
  // desired start coordinate = 6,6



  return nextMove
}

const tryToEatNearbyFood = (gameState: GameState, safeMoves: string[]): string => {
  let closestFood: Coord = { x: 6, y: 6 };
  let rangeToClosestFood = 10000;
  gameState.board.food.forEach((food) => {
    let absX = Math.abs(gameState.you.head.x - food.x)
    let absY = Math.abs(gameState.you.head.y - food.y)

    let disctance = Math.sqrt(Math.pow(absX, 2) + Math.pow(absY, 2))

    if (rangeToClosestFood > disctance) {
      closestFood = food;
    }

  })

  return moveCloserToMiddle(gameState, safeMoves, closestFood.x, closestFood.y)

}

runServer({
  info: info,
  start: start,
  move: move,
  end: end
});
