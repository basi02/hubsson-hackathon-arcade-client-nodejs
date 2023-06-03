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

interface TotalDirectionScore {
	isBoundary: boolean;
	score: number;
	direction: Direction
}


function makeSmartMove(gameState: GameState): Direction {

	const myCoordinate = getMyCurrentPosition(gameState);
	const takenCoordinates : Coordinate[] = gameState.players.flatMap( el => el.coordinates)

	const horizontalLine = takenCoordinates.filter(el => el.y == myCoordinate.y).map(el => el.x)
	
	const leftPoints = horizontalLine.filter(el => el < myCoordinate.x)
	const directionPoints : TotalDirectionScore[] = [];
	let leftScore: TotalDirectionScore = {
		isBoundary: false,
		score: 0,
		direction: Direction.LEFT
	}
	if (leftPoints.length > 0) {
		const leftPoint = Math.max(...leftPoints)
		leftScore.score = Math.abs(myCoordinate.x - leftPoint)
		leftScore.isBoundary = false
	} else {
		leftScore.score = myCoordinate.x
		leftScore.isBoundary = true
	}
	directionPoints.push(leftScore)
	

	const rightPoints = horizontalLine.filter(el => el > myCoordinate.x)
	let rightScore: TotalDirectionScore = {
		isBoundary: false,
		score: 0,
		direction: Direction.RIGHT
	}
	if (rightPoints.length > 0) {
		const rightPoint = Math.min(...rightPoints)
		rightScore.score = Math.abs(myCoordinate.x - rightPoint)
		rightScore.isBoundary = false
	} else {
		rightScore.score = gameState.width - myCoordinate.x
		rightScore.isBoundary = true
	}
	directionPoints.push(rightScore)

	const verticalLine = takenCoordinates.filter(el => el.x == myCoordinate.x).map(el => el.y)

	const upPoints = verticalLine.filter(el => el < myCoordinate.y)
	let upScore: TotalDirectionScore = {
		isBoundary: false,
		score: 0,
		direction: Direction.UP
	}
	if (upPoints.length > 0) {
		const upPoint = Math.max(...upPoints)
		upScore.score = Math.abs(myCoordinate.y - upPoint)
		upScore.isBoundary = false
	} else {
		upScore.score = myCoordinate.y
		upScore.isBoundary = true
	}
	directionPoints.push(upScore)
	
	const downPoints = verticalLine.filter(el => el > myCoordinate.y)
	let downScore: TotalDirectionScore = {
		isBoundary: false,
		score: 0,
		direction: Direction.DOWN
	}
	if (downPoints.length > 0) {
		const downPoint = Math.min(...downPoints)
		downScore.score = Math.abs(myCoordinate.y - downPoint)
		downScore.isBoundary = false
	} else {
		downScore.score = gameState.height - myCoordinate.y
		downScore.isBoundary = true
	}
	directionPoints.push(downScore)
	

	console.log(upScore, downScore, leftScore, rightScore)
	const chosenMove = Math.max(upScore.score, downScore.score, leftScore.score, rightScore.score)
	
	const isBoundaryPoints = directionPoints.filter(el => el.isBoundary == true).sort( (a, b) => b.score - a.score) // boundary points
	const maxScorePoint = directionPoints.find(el => el.score == chosenMove) // previous logic max

	if (isBoundaryPoints.length > 0) {
		return isBoundaryPoints[0].direction
	} else {
		return maxScorePoint.direction
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
