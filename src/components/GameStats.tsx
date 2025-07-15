import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent } from '@mui/material';
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

        }}>



      </CardContent >
    </Card >
  );
}

export default GameStats;