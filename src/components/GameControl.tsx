import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, Divider, Typography, Card, CardContent, Button, Fab } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';
import { GameStateEnumeration, CellStateEnumeration } from '../tetrominos/types.js';
import { createEmptyData, isTetrominoCell } from '../helpers/gameFunctions.js';

// Types
import type { GameData, Cell, Tetromino, TetrominoType } from "../tetrominos/types.js";
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

// Icons
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

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

  const renderDivider = () => {
    return (
      <React.Fragment>
        <Box sx={{ height: 16 }} />
        <Divider sx={{ width: '100%' }} />
        <Box sx={{ height: 16 }} />
      </React.Fragment>
    );
  };

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

  const renderButtonControls = () => {

    if (!tetrominosGameService)
      return null;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

        <Box sx={{ height: 16 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1
              }}>

              <Fab
                color='secondary'
                onClick={() => tetrominosGameService.moveLeft()}>
                <KeyboardArrowLeftIcon />
              </Fab>

              <Fab
                color='secondary'
                onClick={() => tetrominosGameService.moveRight()}>
                <KeyboardArrowRightIcon />
              </Fab>

            </Box>

            <Fab
              color='secondary'
              onClick={() => tetrominosGameService.moveDown()}>
              <KeyboardArrowDownIcon />
            </Fab>

          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>

            <Fab
              color='secondary'
              onClick={() => tetrominosGameService.rotate()}>
              <RotateRightIcon />
            </Fab>
            <Fab
              color='secondary'>
              <KeyboardDoubleArrowDownIcon />
            </Fab>

          </Box>

        </Box>

        <Box sx={{ height: 16 }} />

      </Box>
    );
  };

  const renderKeyboardDescription = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>

        <Typography variant="subtitle1">Keyboard Controls</Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}>
          <KeyboardArrowLeftIcon />
          <Typography variant="body2">Left Arrow, A</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}>
          <KeyboardArrowRightIcon />
          <Typography variant="body2">Right Arrow, D</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}>
          <KeyboardArrowDownIcon />
          <Typography variant="body2">Down Arrow, S</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}>
          <RotateRightIcon />
          <Typography variant="body2">Up Arrow, W</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}>
          <KeyboardDoubleArrowDownIcon />
          <Typography variant="body2">Spacebar</Typography>
        </Box>

      </Box>
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

        {renderDivider()}

        {renderButtonControls()}

        {renderDivider()}

        {renderKeyboardDescription()}

      </CardContent >
    </Card >
  );
}

export default GameControl;