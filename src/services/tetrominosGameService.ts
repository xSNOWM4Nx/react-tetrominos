import { Service } from './infrastructure/service.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../tetrominos/constants.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { Board, Tetromino, TetrominoType } from '../tetrominos/types.js';

export type GameBoardUpdatedCallbackMethod = (board: Board) => void;
interface IGameBoardUpdatedSubscriberDictionary { [key: string]: GameBoardUpdatedCallbackMethod };

export interface ITetrominosGameService extends IService {
  getBoard: () => Board;
  onGameBoardUpdated: (contextKey: string, callbackHandler: GameBoardUpdatedCallbackMethod) => string;
  offGameBoardUpdated: (registerKey: string) => boolean;
};

export class TetrominosGameService extends Service implements ITetrominosGameService {

  // Props
  private gameBoardUpdatedSubscriberDictionary: IGameBoardUpdatedSubscriberDictionary = {};
  private gameBoardUpdatedSubscriptionCounter: number = 0;

  // Game state
  private board: Board;
  private activeTetromino: Tetromino | null = null;

  constructor(key: string) {
    super(key);

    this.board = this.createEmptyBoard();
  };

  public getBoard = () => this.board;

  public onGameBoardUpdated = (contextKey: string, callbackHandler: GameBoardUpdatedCallbackMethod) => {

    // Setup register key
    this.gameBoardUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.gameBoardUpdatedSubscriptionCounter}`

    // Register callback
    this.gameBoardUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    console.debug(`Component with key '${registerKey}' has subscribed on 'GameBoardUpdated'.`);
    return registerKey;
  };

  public offGameBoardUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.gameBoardUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.gameBoardUpdatedSubscriberDictionary[registerKey];
      console.debug(`Component with key '${registerKey}' has unsubscribed on 'GameBoardUpdated'.`);
      return true;
    }
    else {

      console.error(`Component with key '${registerKey}' not registered on 'GameBoardUpdated'.`);
      return false;
    };
  };

  protected async onStarting(): Promise<boolean> {
    return true;
  };

  protected async onStopping(): Promise<boolean> {
    return true;
  };

  private notifyGameBoardUpdated = () => {
    Object.values(this.gameBoardUpdatedSubscriberDictionary).forEach(cb => cb(this.getBoard()));
  };

  private createEmptyBoard = (): Board => {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => ({
        value: null,
        color: null,
        ghost: false
      }))
    );
  };

};