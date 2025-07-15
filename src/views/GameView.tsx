import React, { useContext } from 'react'
import { Box } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ViewKeys } from './viewKeys.js';
import GameControl from '../components/GameControl.js';
import GameBoard from '../components/GameBoard.js';
import GameStats from '../components/GameStats.js';

// Types
import type { SelectChangeEvent } from '@mui/material';
import type { INavigationElementProps } from '../navigation/navigationTypes.js';

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const GameViewMemoized: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.GameView

  // Contexts
  const appContext = useContext(AppContext);

  return (

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>

      {/* Top spacer */}
      <Box sx={{ height: (theme) => theme.spacing(2) }} />

      <Box
        sx={{
          // height: '100%',
          flex: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}>

        <Box
          sx={{
            height: '100%',
            flex: '0 0 240px',
            minWidth: 180
          }}>

          <GameControl />
        </Box>

        {/* Spacer */}
        <Box sx={{ width: (theme) => theme.spacing(2) }} />

        <Box
          sx={{
            height: '100%',
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>

          <GameBoard />
        </Box>

        {/* Spacer */}
        <Box sx={{ width: (theme) => theme.spacing(2) }} />

        <Box
          sx={{
            height: '100%',
            flex: '0 0 240px',
            minWidth: 180
          }}>
          <GameStats />
        </Box>

      </Box>

      {/* Bottom spacer */}
      <Box sx={{ height: (theme) => theme.spacing(2) }} />

    </Box>
  );
}

const GameView = React.memo(GameViewMemoized, (prevProps, nextProps) => {

  return true
});

export default GameView;
