// Twin Tides: the fixed numbers every other module shares.
// The canvas is drawn at this internal resolution and scaled by CSS, so a
// screenshot and a desktop window always show the same layout.
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const HUD_HEIGHT = 64;
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 520;
export const PANEL_Y = 84;
export const PANEL_LEFT_X = 24;
export const PANEL_RIGHT_X = 656;
export const BOTTOM_Y = 624;

export const BEST_KEY = 'twin-tides-best-score';
export const HINTS_PER_LEVEL = 3;
export const WRONG_CLICK_TIME_COST = 5;
export const WRONG_CLICK_SCORE_COST = 10;
export const FIND_BASE_SCORE = 100;
export const HINT_SCORE_COST = 15;
export const COMBO_STEP = 25;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_WIN = 'level-win';
export const SCREEN_GAME_WIN = 'game-win';
export const SCREEN_LEVEL_LOSE = 'level-lose';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;
export const ACTION_BACK = 16;
export const ACTION_LEVEL_1 = 32;
export const ACTION_LEVEL_2 = 64;
export const ACTION_LEVEL_3 = 128;
