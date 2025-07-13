import React, { useContext } from 'react'
import { Box } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ViewKeys } from './viewKeys.js';

// Types
import type { SelectChangeEvent } from '@mui/material';
import type { INavigationElementProps } from '../navigation/navigationTypes.js';

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const FractalViewMemoized: React.FC<Props> = (props) => {

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
        flexDirection: 'column'
      }}>


    </Box>
  );
}

const FractalView = React.memo(FractalViewMemoized, (prevProps, nextProps) => {

  return true
});

export default FractalView;
