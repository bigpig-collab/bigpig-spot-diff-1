// Twin Tides: mouse and keyboard input. The mouse clicks a panel; the
// keyboard drives a crosshair (arrow keys move it, Enter/Space clicks at
// it, Tab swaps panels), so the whole game is playable without a mouse.
import {
  ACTION_BACK,
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_LEVEL_1,
  ACTION_LEVEL_2,
  ACTION_LEVEL_3,
  ACTION_MUTE,
  ACTION_PAUSE,
  PANEL_HEIGHT,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_WIDTH,
  PANEL_Y,
} from './config.js';

export function createInput(canvas, onClick) {
  let actions = 0;
  let crosshair = { x: PANEL_LEFT_X + PANEL_WIDTH / 2, y: PANEL_Y + PANEL_HEIGHT / 2 };
  let panel = 0;
  let hover = null;
  let lastClick = null;
  const keys = new Set();

  function toScene(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    if (y >= PANEL_Y && y <= PANEL_Y + PANEL_HEIGHT) {
      if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL_WIDTH) {
        return { x: x - PANEL_LEFT_X, y: y - PANEL_Y, panel: 0 };
      }
      if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL_WIDTH) {
        return { x: x - PANEL_RIGHT_X, y: y - PANEL_Y, panel: 1 };
      }
    }
    return null;
  }

  function toCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    lastClick = toCanvas(event.clientX, event.clientY);
    const hit = toScene(event.clientX, event.clientY);
    if (hit) {
      crosshair = { x: hit.panel === 0 ? PANEL_LEFT_X + hit.x : PANEL_RIGHT_X + hit.x, y: PANEL_Y + hit.y };
      panel = hit.panel;
      onClick(hit.x, hit.y, hit.panel);
    } else {
      actions |= ACTION_CONFIRM;
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    hover = toScene(event.clientX, event.clientY);
  });

  canvas.addEventListener('pointerleave', () => {
    hover = null;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
      }
      return;
    }
    keys.add(event.key);
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        actions |= ACTION_CONFIRM;
        break;
      case 'p':
      case 'P':
      case 'Escape':
        actions |= ACTION_PAUSE;
        break;
      case 'h':
      case 'H':
        actions |= ACTION_HINT;
        break;
      case 'm':
      case 'M':
        actions |= ACTION_MUTE;
        break;
      case 'Backspace':
        actions |= ACTION_BACK;
        break;
      case 'Tab':
        event.preventDefault();
        panel = panel === 0 ? 1 : 0;
        crosshair.x = (panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X) + PANEL_WIDTH / 2;
        break;
      case '1':
        actions |= ACTION_LEVEL_1;
        break;
      case '2':
        actions |= ACTION_LEVEL_2;
        break;
      case '3':
        actions |= ACTION_LEVEL_3;
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (event) => keys.delete(event.key));

  function moveCrosshair(dt) {
    const speed = 520 * dt;
    let moved = false;
    if (keys.has('ArrowLeft')) {
      crosshair.x -= speed;
      moved = true;
    }
    if (keys.has('ArrowRight')) {
      crosshair.x += speed;
      moved = true;
    }
    if (keys.has('ArrowUp')) {
      crosshair.y -= speed;
      moved = true;
    }
    if (keys.has('ArrowDown')) {
      crosshair.y += speed;
      moved = true;
    }
    if (moved) {
      crosshair.x = Math.max(0, Math.min(1279, crosshair.x));
      crosshair.y = Math.max(0, Math.min(719, crosshair.y));
      if (crosshair.y >= PANEL_Y && crosshair.y <= PANEL_Y + PANEL_HEIGHT) {
        panel = crosshair.x >= PANEL_RIGHT_X ? 1 : 0;
      }
    }
  }

  // The keyboard "click": Enter/Space while playing clicks at the crosshair.
  function crosshairScene() {
    const baseX = panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    return { x: crosshair.x - baseX, y: crosshair.y - PANEL_Y, panel };
  }

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  return {
    takeActions,
    moveCrosshair,
    crosshairScene,
    getCrosshair: () => crosshair,
    getHover: () => hover,
    getPanel: () => panel,
    getLastClick: () => lastClick,
  };
}
