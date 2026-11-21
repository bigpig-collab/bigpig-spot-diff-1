// Twin Tides: the game state and its rules, kept free of the DOM so the
// logic can be tested on its own. A game is three levels in order; each
// level is one scene with a time limit and a fixed set of differences.
import {
  COMBO_STEP,
  FIND_BASE_SCORE,
  HINT_SCORE_COST,
  HINTS_PER_LEVEL,
  WRONG_CLICK_SCORE_COST,
  WRONG_CLICK_TIME_COST,
} from './config.js';
import { SCENES, differenceAt } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_HINT = 4;
export const EVENT_LEVEL_WIN = 8;
export const EVENT_GAME_WIN = 16;
export const EVENT_TIME_OUT = 32;

export function createGame() {
  const state = {
    level: 0,
    screen: 'title',
    found: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: SCENES[0].timeLimit,
    hintsLeft: HINTS_PER_LEVEL,
    hintIndex: -1,
    hintTime: 0,
    wrongClicks: 0,
    finds: 0,
    levelScores: [0, 0, 0],
    levelTimes: [0, 0, 0],
    message: '',
    messageTime: 0,
    lastFound: -1,
    flash: 0,
    flashX: 0,
    flashY: 0,
    flashPanel: 0,
    totalFound: 0,
  };

  function scene() {
    return SCENES[state.level];
  }

  function startLevel(level) {
    state.level = level;
    state.screen = 'play';
    state.found = [];
    state.combo = 0;
    state.timeLeft = SCENES[level].timeLimit;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintIndex = -1;
    state.hintTime = 0;
    state.message = `${SCENES[level].name}: find ${SCENES[level].differences.length} differences!`;
    state.messageTime = 3;
    state.lastFound = -1;
  }

  function toTitle() {
    state.screen = 'title';
    state.message = '';
  }

  // A click at scene coordinates (either panel maps to the same scene).
  // Returns an event bitmask for the sound and the renderer to react to.
  function clickAt(x, y, panel) {
    if (state.screen !== 'play') return EVENT_NONE;
    const index = differenceAt(state.level, x, y);
    if (index === -1) {
      state.combo = 0;
      state.wrongClicks += 1;
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_COST);
      state.score = Math.max(0, state.score - WRONG_CLICK_SCORE_COST);
      state.message = `Nothing there! -${WRONG_CLICK_TIME_COST}s`;
      state.messageTime = 1.6;
      state.flash = 0.5;
      state.flashX = x;
      state.flashY = y;
      state.flashPanel = panel;
      return EVENT_MISS;
    }
    if (state.found.includes(index)) {
      state.message = 'Already found — look elsewhere!';
      state.messageTime = 1.4;
      return EVENT_NONE;
    }
    state.found.push(index);
    state.finds += 1;
    state.totalFound += 1;
    state.lastFound = index;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = FIND_BASE_SCORE + (state.combo - 1) * COMBO_STEP;
    state.score += gained;
    state.levelScores[state.level] += gained;
    state.message = `${scene().differences[index].label} +${gained}`;
    state.messageTime = 2;
    if (state.found.length === scene().differences.length) {
      const bonus = Math.round(state.timeLeft) * 5;
      state.score += bonus;
      state.levelScores[state.level] += bonus;
      state.levelTimes[state.level] = scene().timeLimit - state.timeLeft;
      if (state.level === SCENES.length - 1) {
        state.screen = 'game-win';
        return EVENT_FOUND | EVENT_GAME_WIN;
      }
      state.screen = 'level-win';
      return EVENT_FOUND | EVENT_LEVEL_WIN;
    }
    return EVENT_FOUND;
  }

  function useHint() {
    if (state.screen !== 'play' || state.hintsLeft <= 0) return EVENT_NONE;
    const remaining = scene().differences
      .map((diff, i) => i)
      .filter((i) => !state.found.includes(i));
    if (remaining.length === 0) return EVENT_NONE;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_SCORE_COST);
    state.hintIndex = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintTime = 3;
    state.message = `Hint: something hides near the glowing ring (-${HINT_SCORE_COST} pts)`;
    state.messageTime = 2.5;
    return EVENT_HINT;
  }

  function tick(dt) {
    if (state.screen !== 'play') return EVENT_NONE;
    state.timeLeft -= dt;
    if (state.hintTime > 0) {
      state.hintTime -= dt;
      if (state.hintTime <= 0) state.hintIndex = -1;
    }
    if (state.messageTime > 0) state.messageTime -= dt;
    if (state.flash > 0) state.flash -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'level-lose';
      return EVENT_TIME_OUT;
    }
    return EVENT_NONE;
  }

  function remaining() {
    return scene().differences.length - state.found.length;
  }

  function starsForLevel(level) {
    const timeUsed = state.levelTimes[level];
    const limit = SCENES[level].timeLimit;
    if (timeUsed <= limit * 0.45) return 3;
    if (timeUsed <= limit * 0.7) return 2;
    return 1;
  }

  return {
    state,
    scene,
    startLevel,
    toTitle,
    clickAt,
    useHint,
    tick,
    remaining,
    starsForLevel,
  };
}
