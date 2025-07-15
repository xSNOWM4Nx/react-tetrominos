import React, { useContext } from 'react'
import { Box } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ViewKeys } from './viewKeys.js';
import GameBoard from '../components/GameBoard.tsx';

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

      <Box
        sx={{
          height: '100%',
          flex: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'yellow'
        }}>

        <Box
          sx={{
            height: '100%',
            flex: '0 0 200px',
            display: 'flex',
            backgroundColor: 'green'
          }}>

        </Box>

        <Box
          sx={{
            height: '100%',
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'red'
          }}>

          <GameBoard />
        </Box>

        <Box
          sx={{
            height: '100%',
            flex: '0 0 240px',
            minWidth: 180,
            backgroundColor: 'blue'
          }}>

        </Box>

      </Box>

    </Box>
  );
}

const GameView = React.memo(GameViewMemoized, (prevProps, nextProps) => {

  return true
});

export default GameView;
