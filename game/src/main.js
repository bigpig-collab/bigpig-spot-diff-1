// Twin Tides — Spot the Difference: boot and the one loop.
//
// The game moves between title, play, paused, level-win, game-win and
// level-lose screens. ?seed=N fixes the (currently unused) shuffle seed;
// ?shot=start|play|play2|end stages a screenshot scene instead of running
// the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, SCREEN_GAME_WIN, SCREEN_LEVEL_LOSE, SCREEN_LEVEL_WIN, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, ACTION_BACK, ACTION_CONFIRM, ACTION_HINT, ACTION_LEVEL_1, ACTION_LEVEL_2, ACTION_LEVEL_3, ACTION_MUTE, ACTION_PAUSE } from './config.js';
import { createAudio } from './audio.js';
import { createGame, EVENT_FOUND, EVENT_GAME_WIN, EVENT_HINT, EVENT_LEVEL_WIN, EVENT_MISS, EVENT_TIME_OUT } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 1;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts one visit.
  }
}

let best = readBest();
let screen = SCREEN_TITLE;
let lastTickSecond = -1;

function announce(message) {
  status.textContent = message;
}

function startLevel(level) {
  game.startLevel(level);
  screen = SCREEN_PLAY;
  lastTickSecond = -1;
  announce(`${game.scene().name}. Find ${game.scene().differences.length} differences.`);
}

function levelCardAt(point) {
  if (!point || point.y < 292 || point.y > 442) return -1;
  for (let i = 0; i < 3; i += 1) {
    const x = 190 + i * 310;
    if (point.x >= x && point.x <= x + 280) return i;
  }
  return -1;
}

function handleFound(events) {
  if (events & EVENT_FOUND) audio.playFind();
  if (events & EVENT_MISS) audio.playMiss();
  if (events & EVENT_HINT) audio.playHint();
  if (events & EVENT_LEVEL_WIN) {
    screen = SCREEN_LEVEL_WIN;
    audio.playWin();
    announce(`Level cleared! Score ${game.state.score}.`);
  }
  if (events & EVENT_GAME_WIN) {
    screen = SCREEN_GAME_WIN;
    audio.playWin();
    if (game.state.score > best) {
      best = game.state.score;
      saveBest(best);
    }
    announce(`You found them all! Final score ${game.state.score}.`);
  }
  if (events & EVENT_TIME_OUT) {
    screen = SCREEN_LEVEL_LOSE;
    audio.playLose();
    announce(`Time's up on ${game.scene().name}.`);
  }
}

function runShot(name) {
  screen = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game.state, screen, best, 0.4, { x: 640, y: 360 }, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (x, y, panel) => {
    if (screen !== SCREEN_PLAY) return;
    audio.unlock();
    handleFound(game.clickAt(x, y, panel));
  });

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
      return;
    }
    if (actions & ACTION_LEVEL_1 && screen === SCREEN_TITLE) startLevel(0);
    else if (actions & ACTION_LEVEL_2 && screen === SCREEN_TITLE) startLevel(1);
    else if (actions & ACTION_LEVEL_3 && screen === SCREEN_TITLE) startLevel(2);
    else if (actions & ACTION_CONFIRM) {
      audio.unlock();
      if (screen === SCREEN_TITLE) {
        const card = levelCardAt(input.getLastClick());
        startLevel(card >= 0 ? card : 0);
      } else if (screen === SCREEN_LEVEL_WIN) {
        startLevel(game.state.level + 1);
      } else if (screen === SCREEN_GAME_WIN || screen === SCREEN_LEVEL_LOSE) {
        if (screen === SCREEN_LEVEL_LOSE) startLevel(game.state.level);
        else {
          game.state.score = 0;
          game.state.levelScores = [0, 0, 0];
          startLevel(0);
        }
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (screen === SCREEN_PLAY) {
        const at = input.crosshairScene();
        if (at.y >= 0 && at.y <= 520 && at.x >= 0 && at.x <= 600) {
          handleFound(game.clickAt(at.x, at.y, at.panel));
        }
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      handleFound(game.useHint());
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_BACK) {
      if (screen !== SCREEN_TITLE) {
        game.toTitle();
        screen = SCREEN_TITLE;
        announce('Twin Tides. Pick a level to play.');
      }
    }
  }

  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    input.moveCrosshair(dt);
    handleActions();
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= 1 / 60) {
        const events = game.tick(1 / 60);
        if (events & EVENT_TIME_OUT) handleFound(events);
        accumulator -= 1 / 60;
      }
      const whole = Math.ceil(game.state.timeLeft);
      if (whole !== lastTickSecond && whole <= 10 && whole > 0) {
        lastTickSecond = whole;
        audio.playTick();
      }
    }
    renderer.draw(game.state, screen, best, now / 1000, input.getCrosshair(), input.getHover());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Tides. Pick a level: press 1, 2 or 3, or click a level card.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
