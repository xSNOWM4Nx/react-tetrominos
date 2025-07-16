import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Button } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';
import { GameStateEnumeration, CellStateEnumeration } from '../tetrominos/types.js';
import { createEmptyData, isTetrominoCell } from '../helpers/gameFunctions.js';

// Types
import type { GameData, Cell, Tetromino, TetrominoType } from "../tetrominos/types.js";
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

interface ILocalProps {

}
type Props = ILocalProps;

export const GameControl: React.FC<Props> = (props) => {

  //Fields
  const buttonWidth = 140;

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [gameStateVersion, setGameStateVersion] = useState(0);

  // Effects
  useEffect(() => {

    if (!tetrominosGameService)
      return undefined;

    const key = tetrominosGameService.onGameStateUpdated("GameControl", (newVersion) => {
      setGameStateVersion(newVersion);
    });

    return () => {
      tetrominosGameService.offGameStateUpdated(key);
    };
  }, [tetrominosGameService]);

  const renderStartButton = () => {

    if (!tetrominosGameService)
      return null;

    const gameData = tetrominosGameService.getGameData();

    let buttonText = "Start Game";
    if (gameData.state === GameStateEnumeration.Paused)
      buttonText = "Resume Game";

    return (
      <Button
        disabled={gameData.state === GameStateEnumeration.Running}
        variant="contained"
        color="primary"
        onClick={() => tetrominosGameService.startGame()}
        sx={{
          mb: 2,
          width: buttonWidth,
        }}>
        {buttonText}
      </Button>
    );
  };

  const renderPauseButton = () => {

    if (!tetrominosGameService)
      return null;

    const gameData = tetrominosGameService.getGameData();

    return (
      <Button
        disabled={gameData.state !== GameStateEnumeration.Running}
        variant="contained"
        color="primary"
        onClick={() => tetrominosGameService.pauseGame()}
        sx={{
          mb: 2,
          width: buttonWidth,
        }}>
        Pause Game
      </Button>
    );
  };

  const renderStopButton = () => {

    if (!tetrominosGameService)
      return null;

    const gameData = tetrominosGameService.getGameData();

    return (
      <Button
        disabled={gameData.state !== GameStateEnumeration.Running && gameData.state !== GameStateEnumeration.Paused}
        variant="contained"
        color="primary"
        onClick={() => tetrominosGameService.stopGame()}
        sx={{
          mb: 2,
          width: buttonWidth,
        }}>
        Stop Game
      </Button>
    );
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>

        {renderStartButton()}
        {renderPauseButton()}
        {renderStopButton()}

      </CardContent >
    </Card >
  );
}

export default GameControl;