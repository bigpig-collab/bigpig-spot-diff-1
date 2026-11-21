// Twin Tides: the deterministic screenshot scenes behind
// ?shot=start|play|play2|end. Each one sets the real game state to a frame
// a genuine play session reaches — found markers on, several differences
// still unfound, the counter showing what is left — then paints it twice
// and sets window.__shotReady for the screenshot.
import { SCENES } from './scenes.js';

export function stageShot(name, game) {
  const state = game.state;
  if (name === 'play') {
    game.startLevel(0);
    state.found = [0, 2, 4];
    state.score = 340;
    state.combo = 2;
    state.bestCombo = 2;
    state.timeLeft = 132;
    state.lastFound = 4;
    state.message = 'The mast flag changed colour! +125';
    state.messageTime = 99;
    return 'play';
  }
  if (name === 'play2') {
    game.startLevel(1);
    state.found = [0, 3];
    state.score = 215;
    state.combo = 1;
    state.bestCombo = 1;
    state.timeLeft = 98;
    state.lastFound = 3;
    state.message = 'The vendor changed hats! +100';
    state.messageTime = 99;
    return 'play';
  }
  if (name === 'end') {
    game.startLevel(2);
    state.found = SCENES[2].differences.map((diff, i) => i);
    state.score = 2140;
    state.combo = 5;
    state.bestCombo = 5;
    state.wrongClicks = 1;
    state.totalFound = 24;
    state.finds = 24;
    state.timeLeft = 41;
    state.levelScores = [740, 690, 710];
    state.levelTimes = [96, 88, 79];
    state.screen = 'game-win';
    state.message = '';
    return 'game-win';
  }
  game.toTitle();
  state.level = 0;
  return 'title';
}
