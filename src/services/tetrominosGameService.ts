import { Service } from './infrastructure/service.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../tetrominos/constants.js';
import { SCORE_TABLE, DROP_INTERVALS } from '../tetrominos/tetrominos.js';
import { GameStateEnumeration, CellStateEnumeration } from '../tetrominos/types.js';
import { createEmptyData, createTetromino, getRandomTetrominoType, getTetrominoShapes, getWallkickOffsets } from '../helpers/gameFunctions.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { GameData, Board, Tetromino, TetrominoType } from '../tetrominos/types.js';

export type GameUpdatedCallbackMethod = (version: number) => void;
interface IGameStateUpdatedSubscriberDictionary { [key: string]: GameUpdatedCallbackMethod };
interface IGameBoardUpdatedSubscriberDictionary { [key: string]: GameUpdatedCallbackMethod };
interface IGameStatsUpdatedSubscriberDictionary { [key: string]: GameUpdatedCallbackMethod };

export interface ITetrominosGameService extends IService {
  getGameData: () => GameData;
  startGame: () => void;
  pauseGame: () => void;
  stopGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  rotate: () => void;
  onGameStateUpdated: (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => string;
  offGameStateUpdated: (registerKey: string) => boolean;
  onGameBoardUpdated: (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => string;
  offGameBoardUpdated: (registerKey: string) => boolean;
  onGameStatsUpdated: (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => string;
  offGameStatsUpdated: (registerKey: string) => boolean;
};

export class TetrominosGameService extends Service implements ITetrominosGameService {

  // Props
  private gameStateUpdatedSubscriberDictionary: IGameStateUpdatedSubscriberDictionary = {};
  private gameStateUpdatedSubscriptionCounter: number = 0;
  private gameBoardUpdatedSubscriberDictionary: IGameBoardUpdatedSubscriberDictionary = {};
  private gameBoardUpdatedSubscriptionCounter: number = 0;
  private gameStatsUpdatedSubscriberDictionary: IGameStatsUpdatedSubscriberDictionary = {};
  private gameStatsUpdatedSubscriptionCounter: number = 0;

  // Game state
  private gameData: GameData;
  private lastStepTimestamp = 0;
  private stepDelay = 800;
  private timeInterval: number | undefined = undefined;
  private gameStartTimestamp: number = 0;

  private rafHandle: number | null = null;

  constructor(key: string) {
    super(key);

    this.gameData = createEmptyData(BOARD_HEIGHT, BOARD_WIDTH);
  };

  public getGameData = () => this.gameData;

  public startGame = () => {

    // Restart ?
    if (this.gameData.state === GameStateEnumeration.Running) {
      return;
    }

    // Resume
    if (this.gameData.state === GameStateEnumeration.Paused) {

      this.setGameState(GameStateEnumeration.Running);
      this.lastStepTimestamp = performance.now();
      this.runGameLoop();

      // Reset start timestamp
      this.gameStartTimestamp = Date.now() - this.gameData.timeTicks;
      this.startTimeInterval();
      return;
    }

    // After game over
    if (this.gameData.state === GameStateEnumeration.GameOver) {

      // Clear data
      this.gameData = createEmptyData(BOARD_HEIGHT, BOARD_WIDTH);
      this.notifyGameStatsUpdated();
    }

    if (this.gameData.state !== GameStateEnumeration.Init &&
      this.gameData.state !== GameStateEnumeration.Stopped) {
      return;
    };

    this.setGameState(GameStateEnumeration.Running);
    this.spawnTetromino();
    this.lastStepTimestamp = performance.now();
    this.runGameLoop();

    this.gameStartTimestamp = Date.now();
    this.startTimeInterval();
  };

  public pauseGame = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    this.setGameState(GameStateEnumeration.Paused);
    clearInterval(this.timeInterval);

    this.stopGameLoop();
  };

  public stopGame = () => {

    this.setGameState(GameStateEnumeration.Stopped);
    clearInterval(this.timeInterval);

    this.stopGameLoop();

    this.gameData = createEmptyData(BOARD_HEIGHT, BOARD_WIDTH);
    this.notifyGameBoardUpdated();
    this.notifyGameStatsUpdated();
  };

  public moveLeft = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x - 1, tetromino.y)) {
      tetromino.x -= 1;
      this.notifyGameBoardUpdated();
    }
  };

  public moveRight = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x + 1, tetromino.y)) {
      tetromino.x += 1;
      this.notifyGameBoardUpdated();
    }
  };

  public moveDown = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    const tetromino = this.gameData.activeTetromino;
    if (tetromino && this.canMove(tetromino, tetromino.x, tetromino.y + 1)) {
      tetromino.y += 1;
      this.notifyGameBoardUpdated();
    }
  };

  public rotate = () => {

    if (this.gameData.state !== GameStateEnumeration.Running)
      return;

    const tetromino = this.gameData.activeTetromino;
    if (!tetromino) return;

    const from = tetromino.rotation;
    const to = (from + 1) % 4;
    const shapes = getTetrominoShapes(tetromino.type);
    const newShape = shapes[to];

    const wallkicks = getWallkickOffsets(tetromino.type, from, to);

    for (const [dx, dy] of wallkicks) {
      const testX = tetromino.x + dx;
      const testY = tetromino.y + dy;
      const testTetromino = { ...tetromino, shape: newShape, rotation: to, x: testX, y: testY };
      if (this.canMove(testTetromino, testX, testY)) {
        tetromino.shape = newShape;
        tetromino.rotation = to;
        tetromino.x = testX;
        tetromino.y = testY;
        this.notifyGameBoardUpdated();
        return;
      }
    }
    // No rotation if all kicks failed
  };

  public onGameStateUpdated = (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => {

    // Setup register key
    this.gameStateUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.gameStateUpdatedSubscriptionCounter}`

    // Register callback
    this.gameStateUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    console.debug(`Component with key '${registerKey}' has subscribed on 'GameStateUpdated'.`);
    return registerKey;
  };

  public offGameStateUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.gameStateUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.gameStateUpdatedSubscriberDictionary[registerKey];
      console.debug(`Component with key '${registerKey}' has unsubscribed on 'GameStateUpdated'.`);
      return true;
    }
    else {

      console.error(`Component with key '${registerKey}' not registered on 'GameStateUpdated'.`);
      return false;
    };
  };

  public onGameBoardUpdated = (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => {

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

  public onGameStatsUpdated = (contextKey: string, callbackHandler: GameUpdatedCallbackMethod) => {

    // Setup register key
    this.gameStatsUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.gameStatsUpdatedSubscriptionCounter}`

    // Register callback
    this.gameStatsUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    console.debug(`Component with key '${registerKey}' has subscribed on 'GameStatsUpdated'.`);
    return registerKey;
  };

  public offGameStatsUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.gameStatsUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.gameStatsUpdatedSubscriberDictionary[registerKey];
      console.debug(`Component with key '${registerKey}' has unsubscribed on 'GameStatsUpdated'.`);
      return true;
    }
    else {

      console.error(`Component with key '${registerKey}' not registered on 'GameStatsUpdated'.`);
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

  private stopGameLoop = () => {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
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
      this.clearFullLines();
      this.spawnTetromino();
    }

  };

  private spawnTetromino = () => {

    if (!this.gameData.nextTetromino)
      this.gameData.nextTetromino = createTetromino(getRandomTetrominoType());

    const newTetromino = this.gameData.nextTetromino;
    this.gameData.nextTetromino = createTetromino(getRandomTetrominoType());

    if (!this.canMove(newTetromino, newTetromino.x, newTetromino.y)) {

      // GAME OVER!
      this.gameOver();
      return;
    }

    this.gameData.activeTetromino = newTetromino;
    this.notifyGameStatsUpdated();
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
            state: CellStateEnumeration.Fixed,
            value: tetromino.type,
            color: tetromino.color,
          };
        }
      }
    }

    this.gameData.activeTetromino = null;
  };

  private clearFullLines = () => {

    const board = this.gameData.board;
    const fullRows: number[] = [];

    // Find all full rows
    for (let y = 0; y < board.length; y++) {
      if (board[y].every(cell => cell.value)) {
        fullRows.push(y);

        // Mark cells for blink effect
        for (let x = 0; x < board[y].length; x++) {
          board[y][x].state = CellStateEnumeration.Blink;
        }
      }
    }

    if (fullRows.length === 0) return;

    // Update UI to show blink effect
    this.notifyGameBoardUpdated();

    // Delay to show the blink effect
    setTimeout(() => {

      // Clear full rows and shift the board down
      let linesCleared = 0;
      const newBoard: Board = [];

      for (let y = 0; y < board.length; y++) {
        if (fullRows.includes(y)) {
          linesCleared++;
        } else {
          newBoard.push(board[y]);
        }
      }

      while (newBoard.length < board.length) {
        newBoard.unshift(Array.from({ length: board[0].length }, () => ({
          state: CellStateEnumeration.Empty,
          value: null,
          color: null,
        })));
      }

      this.gameData.board = newBoard;

      // Count lines cleared
      if (linesCleared === 1) this.gameData.singles++;
      if (linesCleared === 2) this.gameData.doubles++;
      if (linesCleared === 3) this.gameData.triples++;
      if (linesCleared === 4) this.gameData.tetrises++;
      this.gameData.lines += linesCleared;

      // Update score
      const points = SCORE_TABLE[linesCleared] * (this.gameData.level + 1);
      this.gameData.score += points;

      this.notifyGameBoardUpdated();
      this.notifyGameStatsUpdated();
    }, 300); // Effect duration
  };

  private setGameState = (newState: GameStateEnumeration) => {
    this.gameData.state = newState;
    this.gameData.stateVersion++;
    Object.values(this.gameStateUpdatedSubscriberDictionary).forEach(cb => cb(this.gameData.stateVersion));
  };

  private startTimeInterval = () => {

    if (this.timeInterval)
      clearInterval(this.timeInterval);

    this.timeInterval = setInterval(() => {

      this.gameData.timeTicks = Date.now() - this.gameStartTimestamp;
      this.gameData.timeSeconds = Math.floor(this.gameData.timeTicks / 1000); // Convert to seconds
      this.notifyGameStatsUpdated();

    }, 1000);
  };

  private gameOver = () => {

    this.setGameState(GameStateEnumeration.GameOver);
    clearInterval(this.timeInterval);

    this.stopGameLoop();

    this.gameData.activeTetromino = null; // No active tetromino
    this.notifyGameBoardUpdated();
    this.notifyGameStatsUpdated();
  };

  private notifyGameBoardUpdated = () => {

    this.gameData.boardVersion++;
    Object.values(this.gameBoardUpdatedSubscriberDictionary).forEach(cb => cb(this.gameData.boardVersion));
  };

  private notifyGameStatsUpdated = () => {

    // Check for level up
    if (this.gameData.lines >= (this.gameData.level + 1) * 10)
      this.gameData.level++;

    // Update step delay based on level
    this.stepDelay = DROP_INTERVALS[Math.min(this.gameData.level, DROP_INTERVALS.length - 1)];

    this.gameData.statsVersion++;
    Object.values(this.gameStatsUpdatedSubscriberDictionary).forEach(cb => cb(this.gameData.statsVersion));
  };
};