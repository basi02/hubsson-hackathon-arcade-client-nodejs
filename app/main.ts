import {Coordinate, Direction, GameState} from "../libs/model";
import {GameClient} from "../libs/game-client";

import {config} from "./config";


const gameClient = new GameClient(config);

gameClient.onGameStart((): void => {
	console.log("Game started!");
});

gameClient.onGameUpdate((gameState: GameState): void => {
	console.log("Game State received");
 	const direction = makeMove(gameState)
	gameClient.sendAction(direction, gameState.iteration);
});


function makeMove(game: GameState): Direction {
    const possibleMoves: Direction[] = getPossibleMoves(game);

    // Choose a random move
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];

    return move
    
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
