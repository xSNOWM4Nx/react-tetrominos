import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigation } from '../components/infrastructure/NavigationProvider.js';
import NavigationElementInjector from '../components/infrastructure/NavigationElementInjector.js';
import { getImportableView } from '../navigation/navigationElements.js';
import { ViewKeys } from '../views/viewKeys.js';

interface ILocalProps {
}
type Props = ILocalProps;

const StartPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'StartPage'

  // Hooks
  const { navigateByKey, currentViewElement } = useNavigation();

  // Effects
  useEffect(() => {
    navigateByKey(ViewKeys.GameView);
  }, []);

  if (currentViewElement === null || currentViewElement === undefined)
    return null;

  return (

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}>

      <NavigationElementInjector
        navigationElement={currentViewElement}
        onInject={navigationElement => React.lazy(() => getImportableView(navigationElement.importPath))} />

    </Box>
  );
}

export default StartPage;
