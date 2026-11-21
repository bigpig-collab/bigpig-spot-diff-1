# Twin Tides — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

Two pictures. One is lying. **Twin Tides** is a complete, original spot-the-difference game that runs offline in a desktop browser from static files — no build step, no network requests, all art drawn procedurally on canvas and all sounds synthesised with WebAudio.

Entry for the make.fun bounty [Make the best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451).

## How to play

- **Click a difference** in either picture (or move the crosshair with the arrow keys and press Enter). Found differences get a green ring and a check on both panels.
- **3 scenes, 24 differences**: Harbour Dawn (7, 3:00), Night Market (8, 2:30), Star Garden (9, 2:00) — each harder than the last.
- **Wrong clicks cost 5 seconds**; fast finds build a combo for bonus points.
- **H** spends a hint (a pulsing gold ring around one unfound difference), **P** pauses, **M** mutes, **Backspace** returns to the title screen.
- Clear a level before the clock runs out to bank a time bonus; find all 24 to win.

## Play it locally

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot scenes are staged deterministically with `?shot=start|play|play2|end&seed=N` (see `shots.json`).

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game: `config.js` (numbers), `random.js` (seeded RNG), `scenes.js` (the three hand-drawn scenes and their differences), `world.js` (rules and state), `render.js` (HUD, panels, markers, screens), `input.js` (mouse + keyboard), `audio.js` (synthesised sounds), `shots.js` (screenshot staging), `main.js` (boot and loop).
- `screenshots/` — 4 real renders of the game's own code in a browser.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
