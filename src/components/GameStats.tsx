import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
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

export const GameStats: React.FC<Props> = (props) => {

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [gameStatsVersion, setGameStatsVersion] = useState(0);

  // Effects
  useEffect(() => {

    if (!tetrominosGameService)
      return undefined;

    const key = tetrominosGameService.onGameStatsUpdated("GameStats", (newVersion) => {
      setGameStatsVersion(newVersion);
    });

    return () => {
      tetrominosGameService.offGameStatsUpdated(key);
    };
  }, [tetrominosGameService]);

  let level = 0;
  let lines = 0;
  let score = 0;
  if (tetrominosGameService) {
    const gameData = tetrominosGameService.getGameData();
    level = gameData.level;
    lines = gameData.lines;
    score = gameData.score;
  }

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

        <Typography variant="body1">LEVEL</Typography>
        <Typography variant="h4">{level}</Typography>

        <Box sx={{ height: 16 }} />

        <Typography variant="body1">LINES</Typography>
        <Typography variant="h4">{lines}</Typography>

        <Box sx={{ height: 16 }} />

        <Typography variant="body1">SCORE</Typography>
        <Typography variant="h4">{score}</Typography>

      </CardContent >
    </Card >
  );
}

export default GameStats;