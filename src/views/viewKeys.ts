import { NavigationTypeEnumeration } from '../navigation/navigationTypes.js';

// Types
import type { INavigationElement } from '../navigation/navigationTypes.js';

// Icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';

export class ViewKeys {
  public static GameView: string = 'GameView';
  public static SettingsView: string = 'SettingsView';
  public static AboutView: string = 'AboutView';
};

export const gameViewNavigationData: INavigationElement = {
  key: ViewKeys.GameView,
  name: 'Game',
  importPath: 'views/GameView',
  type: NavigationTypeEnumeration.View,
  Icon: SportsEsportsIcon
};

export const settingsViewNavigationData: INavigationElement = {
  key: ViewKeys.SettingsView,
  name: 'Settings',
  importPath: 'views/SettingsView',
  type: NavigationTypeEnumeration.Dialog,
  Icon: SettingsIcon
};

export const aboutViewNavigationData: INavigationElement = {
  key: ViewKeys.AboutView,
  name: 'About',
  importPath: 'views/AboutView',
  type: NavigationTypeEnumeration.Dialog,
  Icon: InfoIcon
};
