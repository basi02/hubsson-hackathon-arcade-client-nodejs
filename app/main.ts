import {Coordinate, Direction, GameState} from "../libs/model";
import {GameClient} from "../libs/game-client";

import {config} from "./config";


const gameClient = new GameClient(config);

gameClient.onGameStart((): void => {
	console.log("Game started!");
});

gameClient.onGameUpdate((gameState: GameState): void => {
	console.log("Game State received");
 	// const direction = makeMove(gameState)
	 const direction = makeSmartMove(gameState)
	gameClient.sendAction(direction, gameState.iteration);
});


function makeMove(game: GameState): Direction {
    const possibleMoves: Direction[] = getPossibleMoves(game);

    // Choose a random move
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];

    return move
    
}

function makeSmartMove(gameState: GameState): Direction {
	const myCoordinate = getMyCurrentPosition(gameState);
	const takenCoordinates : Coordinate[] = gameState.players.flatMap( el => el.coordinates)

	const horizontalLine = takenCoordinates.filter(el => el.y == myCoordinate.y).map(el => el.x)
	
	const leftPoints = horizontalLine.filter(el => el < myCoordinate.x)
	let leftScore: number
	if (leftPoints.length > 0) {
		const leftPoint = Math.max(...leftPoints)
		leftScore = Math.abs(myCoordinate.x - leftPoint)
	} else {
		leftScore = myCoordinate.x
	}
	

	const rightPoints = horizontalLine.filter(el => el > myCoordinate.x)
	let rightScore: number
	if (rightPoints.length > 0) {
		const rightPoint = Math.min(...rightPoints)
		rightScore = Math.abs(myCoordinate.x - rightPoint)
	} else {
		rightScore = gameState.width - myCoordinate.x
	}
	

	const verticalLine = takenCoordinates.filter(el => el.x == myCoordinate.x).map(el => el.y)

	const upPoints = verticalLine.filter(el => el < myCoordinate.y)
	let upScore: number
	if (upPoints.length > 0) {
		const upPoint = Math.max(...upPoints)
		upScore = Math.abs(myCoordinate.y - upPoint)
	} else {
		upScore = myCoordinate.y
	}
	
	const downPoints = verticalLine.filter(el => el > myCoordinate.y)
	let downScore: number
	if (downPoints.length > 0) {
		const downPoint = Math.min(...downPoints)
		downScore = Math.abs(myCoordinate.y - downPoint)
	} else {
		downScore = gameState.height - myCoordinate.y
	}
	

	console.log(upScore, downScore, leftScore, rightScore)
	const chosenMove = Math.max(upScore, downScore, leftScore, rightScore)

	if (upScore == chosenMove) {
		return Direction.UP
	}
	if (downScore == chosenMove) {
		return Direction.DOWN
	}
	if (leftScore == chosenMove) {
		return Direction.LEFT
	}
	if (rightScore == chosenMove) {
		return Direction.RIGHT
	}

	return Direction.DOWN
}

function getPossibleMoves(gameState: GameState): Direction[] {
    const possibleMoves: Direction[] = [];
	const myCoordinate = getMyCurrentPosition(gameState);
	
	const takenCoordinates : Coordinate[] = gameState.players.flatMap( el => el.coordinates)
    // Check if moving up is a valid move
    if ( myCoordinate.y > 0 && takenCoordinates.some( el => el.x == myCoordinate.x && el.y == myCoordinate.y -1 ) == false ) {
      possibleMoves.push(Direction.UP);
    }

	// // Check if moving down is a valid move
	if ( myCoordinate.y < gameState.height - 1 && takenCoordinates.some( el => el.x == myCoordinate.x && el.y == myCoordinate.y +1 ) == false ) {
		possibleMoves.push(Direction.DOWN);
	  }

	  // // Check if moving left is a valid move
	  if ( myCoordinate.x > 0 && takenCoordinates.some( el => el.y == myCoordinate.y && el.x == myCoordinate.x -1 ) == false ) {
		possibleMoves.push(Direction.LEFT);
	  }

	  // // Check if moving right is a valid move
	  if ( myCoordinate.x < gameState.width-1 && takenCoordinates.some( el => el.y == myCoordinate.y && el.x == myCoordinate.x +1 ) == false ) {
		possibleMoves.push(Direction.RIGHT);
	  }

    return possibleMoves;
}

function getMyCurrentPosition(gameState: GameState) : Coordinate {
	const myPlayer = gameState.players.find(el => el.playerId == config.id)
	return myPlayer.coordinates[myPlayer.coordinates.length - 1]
}



gameClient.run();
