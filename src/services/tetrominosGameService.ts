import { Service } from './infrastructure/service.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../tetrominos/constants.js';
import { GameStateEnumeration } from '../tetrominos/types.js';
import { createEmptyData, createTetromino, getRandomTetrominoType } from '../helpers/gameFunctions.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { GameData, Board, Tetromino, TetrominoType } from '../tetrominos/types.js';

export type GameBoardUpdatedCallbackMethod = (dataVersion: number) => void;
interface IGameBoardUpdatedSubscriberDictionary { [key: string]: GameBoardUpdatedCallbackMethod };

export interface ITetrominosGameService extends IService {
  getGameData: () => GameData;
  startGame: () => void;
  resumeGame: () => void;
  pauseGame: () => void;
  stopGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  onGameBoardUpdated: (contextKey: string, callbackHandler: GameBoardUpdatedCallbackMethod) => string;
  offGameBoardUpdated: (registerKey: string) => boolean;
};

export class TetrominosGameService extends Service implements ITetrominosGameService {

  // Props
  private gameBoardUpdatedSubscriberDictionary: IGameBoardUpdatedSubscriberDictionary = {};
  private gameBoardUpdatedSubscriptionCounter: number = 0;

  // Game state
  private gameData: GameData;
  private lastStepTimestamp = 0;
  private stepDelay = 800;

  private rafHandle: number | null = null;

  constructor(key: string) {
    super(key);

    this.gameData = createEmptyData(BOARD_HEIGHT, BOARD_WIDTH);
  };

  public getGameData = () => this.gameData;

  public startGame = () => {

    if (this.gameData.state !== GameStateEnumeration.Init &&
      this.gameData.state !== GameStateEnumeration.Stopped) {
      console.warn('Game is already running or paused.');
      return;
    }

    this.setGameState(GameStateEnumeration.Running);

    this.lastStepTimestamp = performance.now();
    this.spawnTetromino();
    this.runGameLoop();
  };

  public resumeGame = () => {

    if (this.gameData.state !== GameStateEnumeration.Paused) return;

    this.setGameState(GameStateEnumeration.Running);
    this.lastStepTimestamp = performance.now();
    this.runGameLoop();
  };

  public pauseGame = () => {

    if (this.gameData.state !== GameStateEnumeration.Running) return;

    this.setGameState(GameStateEnumeration.Paused);
  };

  public stopGame = () => {

    this.setGameState(GameStateEnumeration.Stopped);

    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  };

  public moveLeft = () => {
    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x - 1, tetromino.y)) {
      tetromino.x -= 1;
      this.notifyGameBoardUpdated();
    }
  };

  public moveRight = () => {
    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x + 1, tetromino.y)) {
      tetromino.x += 1;
      this.notifyGameBoardUpdated();
    }
  };

  public moveDown = () => {
    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x, tetromino.y + 1)) {
      tetromino.y += 1;
      this.notifyGameBoardUpdated();
    }
  };

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

  private runGameLoop = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    this.rafHandle = requestAnimationFrame((timestamp) => {

      if (this.gameData.state !== GameStateEnumeration.Running)
        return;

      if (timestamp - this.lastStepTimestamp >= this.stepDelay) {
        this.lastStepTimestamp = timestamp;

        this.stepGame();
        this.notifyGameBoardUpdated();
      }

      this.runGameLoop();
    });
  };

  private stepGame = () => {

    const tetromino = this.gameData.activeTetromino;
    if (!tetromino) {
      this.spawnTetromino();
      return;
    }

    if (this.canMove(tetromino, tetromino.x, tetromino.y + 1)) {
      tetromino.y += 1;
      this.gameData.activeTetromino = tetromino;
    } else {
      this.lockTetromino(tetromino);
      // this.clearFullLines();
      this.spawnTetromino();
    }

  };

  private spawnTetromino = () => {

    const type = getRandomTetrominoType();
    const tetromino = createTetromino(type);

    this.gameData.activeTetromino = tetromino;
  };

  private canMove = (tetromino: Tetromino, newX: number, newY: number): boolean => {

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {

        if (!tetromino.shape[y][x])
          continue;

        const boardY = newY + y;
        const boardX = newX + x;

        if (
          boardY < 0 ||
          boardY >= BOARD_HEIGHT ||
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          this.gameData.board[boardY][boardX].value) {
          return false;
        }
      }
    }

    return true;
  };

  private lockTetromino = (tetromino: Tetromino) => {

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {

        if (!tetromino.shape[y][x])
          continue;

        const boardY = tetromino.y + y;
        const boardX = tetromino.x + x;

        if (
          boardY >= 0 &&
          boardY < BOARD_HEIGHT &&
          boardX >= 0 &&
          boardX < BOARD_WIDTH
        ) {
          this.gameData.board[boardY][boardX] = {
            state: 2, // CellStateEnumeration.Fixed,
            value: tetromino.type,
            color: tetromino.color,
          };
        }
      }
    }

    this.gameData.activeTetromino = null;
  };

  private setGameState = (newState: GameStateEnumeration) => {
    this.gameData.state = newState;
  };

  private notifyGameBoardUpdated = () => {

    this.gameData.version++;
    Object.values(this.gameBoardUpdatedSubscriberDictionary).forEach(cb => cb(this.gameData.version));
  };
};