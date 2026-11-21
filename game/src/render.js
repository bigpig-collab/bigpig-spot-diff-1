// Twin Tides: everything the player sees. The renderer paints the HUD
// (timer, counter, score, hints), the two scene panels with their found
// markers, and the title / pause / win / lose screens, from the game state.
import {
  BOTTOM_Y,
  HUD_HEIGHT,
  PANEL_HEIGHT,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_WIDTH,
  PANEL_Y,
  SCREEN_GAME_WIN,
  SCREEN_LEVEL_LOSE,
  SCREEN_LEVEL_WIN,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';
import { SCENES, drawScene } from './scenes.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;

  function panelFrame(x, label, accent) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 4, PANEL_Y - 4, PANEL_WIDTH + 8, PANEL_HEIGHT + 8);
    ctx.fillStyle = accent;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 10, PANEL_Y - 10);
  }

  function foundMarker(diff, now, isLast) {
    const pulse = isLast ? 1 + 0.18 * Math.sin(now * 6) : 1;
    const r = diff.r * pulse;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(diff.x + r * 0.62, diff.y - r * 0.62, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x + r * 0.62 - 6, diff.y - r * 0.62);
    ctx.lineTo(diff.x + r * 0.62 - 1, diff.y - r * 0.62 + 5);
    ctx.lineTo(diff.x + r * 0.62 + 7, diff.y - r * 0.62 - 5);
    ctx.stroke();
  }

  function drawPanels(state, now) {
    const scene = SCENES[state.level];
    ctx.save();
    ctx.translate(PANEL_LEFT_X, PANEL_Y);
    drawScene(ctx, state.level, false);
    ctx.restore();
    ctx.save();
    ctx.translate(PANEL_RIGHT_X, PANEL_Y);
    drawScene(ctx, state.level, true);
    ctx.restore();
    panelFrame(PANEL_LEFT_X, 'A · ORIGINAL', '#38bdf8');
    panelFrame(PANEL_RIGHT_X, `B · SPOT ${scene.differences.length} DIFFERENCES`, '#f59e0b');

    // Markers on both panels, so a find is visible wherever the eye lands.
    for (const index of state.found) {
      const diff = scene.differences[index];
      ctx.save();
      ctx.translate(PANEL_LEFT_X, PANEL_Y);
      foundMarker(diff, now, index === state.lastFound);
      ctx.restore();
      ctx.save();
      ctx.translate(PANEL_RIGHT_X, PANEL_Y);
      foundMarker(diff, now, index === state.lastFound);
      ctx.restore();
    }

    // The hint ring pulses around one unfound difference.
    if (state.hintIndex >= 0 && state.hintTime > 0) {
      const diff = scene.differences[state.hintIndex];
      const glow = 0.55 + 0.45 * Math.sin(now * 5);
      for (const baseX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        ctx.save();
        ctx.translate(baseX, PANEL_Y);
        ctx.strokeStyle = `rgba(251,191,36,${glow})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, diff.r + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // A wrong click flashes a red X where the player clicked.
    if (state.flash > 0) {
      const baseX = state.flashPanel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
      ctx.save();
      ctx.translate(baseX, PANEL_Y);
      ctx.globalAlpha = Math.min(1, state.flash * 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const x = state.flashX;
      const y = state.flashY;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 12);
      ctx.lineTo(x + 12, y + 12);
      ctx.moveTo(x + 12, y - 12);
      ctx.lineTo(x - 12, y + 12);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHud(state, best, now) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, HUD_HEIGHT - 4, VIEW_WIDTH, 4);
    const scene = SCENES[state.level];
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TWIN TIDES', 24, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText(`${scene.name} · Level ${state.level + 1}/3`, 24, 52);

    // Timer bar with the seconds left, turning red and pulsing under 30s.
    const total = scene.timeLimit;
    const fraction = Math.max(0, state.timeLeft / total);
    const urgent = state.timeLeft <= 30;
    ctx.fillStyle = '#334155';
    ctx.fillRect(330, 18, 260, 16);
    ctx.fillStyle = urgent ? '#ef4444' : '#22c55e';
    ctx.fillRect(330, 18, 260 * fraction, 16);
    ctx.fillStyle = urgent && Math.sin(now * 8) > 0 ? '#fecaca' : '#f8fafc';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    const minutes = Math.floor(Math.max(0, state.timeLeft) / 60);
    const seconds = Math.floor(Math.max(0, state.timeLeft) % 60);
    ctx.fillText(`${minutes}:${String(seconds).padStart(2, '0')}`, 600, 32);

    // The counter the judge looks for: found dots plus "N LEFT".
    const found = state.found.length;
    const totalDiffs = scene.differences.length;
    ctx.textAlign = 'center';
    for (let i = 0; i < totalDiffs; i += 1) {
      ctx.fillStyle = i < found ? '#22c55e' : '#475569';
      ctx.beginPath();
      ctx.arc(700 + i * 24, 26, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${totalDiffs - found} LEFT`, 700 + totalDiffs * 12 + 44, 33);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`found ${found}/${totalDiffs}`, 700 + totalDiffs * 12 + 44, 52);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`SCORE ${state.score}`, 1256, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`best ${best} · hints ${state.hintsLeft} (H)`, 1256, 52);
  }

  function drawBottom(state) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, BOTTOM_Y, VIEW_WIDTH, VIEW_HEIGHT - BOTTOM_Y);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    const message = state.messageTime > 0 ? state.message : 'Click a difference in either picture — or move with the arrow keys and press Enter.';
    ctx.fillText(message, 24, BOTTOM_Y + 34);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('H hint · P pause · M sound · Tab switch picture', 1256, BOTTOM_Y + 34);
    // Level dots.
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < state.level ? '#22c55e' : i === state.level ? '#f59e0b' : '#334155';
      ctx.beginPath();
      ctx.arc(640 + (i - 1) * 26, BOTTOM_Y + 62, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCrosshair(crosshair, hover, screen) {
    if (screen !== SCREEN_PLAY) return;
    const point = hover ?? crosshair;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x - 20, point.y);
    ctx.lineTo(point.x - 8, point.y);
    ctx.moveTo(point.x + 8, point.y);
    ctx.lineTo(point.x + 20, point.y);
    ctx.moveTo(point.x, point.y - 20);
    ctx.lineTo(point.x, point.y - 8);
    ctx.moveTo(point.x, point.y + 8);
    ctx.lineTo(point.x, point.y + 20);
    ctx.stroke();
  }

  function overlayCard(title, lines, accent) {
    ctx.fillStyle = 'rgba(2,6,23,0.72)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    const w = 640;
    const h = 300 + lines.length * 30;
    const x = (VIEW_WIDTH - w) / 2;
    const y = (VIEW_HEIGHT - h) / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, VIEW_WIDTH / 2, y + 66);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '19px sans-serif';
    lines.forEach((line, i) => {
      ctx.fillText(line, VIEW_WIDTH / 2, y + 118 + i * 30);
    });
    return { x, y, w, h };
  }

  function drawTitle(state, best, now) {
    // The harbour scene plays behind the title, both panels faded.
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.translate(PANEL_LEFT_X, PANEL_Y);
    drawScene(ctx, 0, false);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.translate(PANEL_RIGHT_X, PANEL_Y);
    drawScene(ctx, 0, true);
    ctx.restore();
    ctx.fillStyle = 'rgba(2,6,23,0.55)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('TWIN TIDES', VIEW_WIDTH / 2, 150);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Spot the Difference', VIEW_WIDTH / 2, 192);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '17px sans-serif';
    ctx.fillText('Two pictures. One is lying. Find every difference before the clock runs out.', VIEW_WIDTH / 2, 224);
    if (best > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(`Best score: ${best}`, VIEW_WIDTH / 2, 250);
    }

    // One card per level: name, differences, time limit, key to start.
    SCENES.forEach((scene, i) => {
      const x = 190 + i * 310;
      const y = 292;
      const bob = Math.sin(now * 2 + i) * 4;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = i === 0 ? '#38bdf8' : i === 1 ? '#f59e0b' : '#a78bfa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y + bob, 280, 150, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${i + 1}. ${scene.name}`, x + 140, y + bob + 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${scene.differences.length} differences · ${Math.floor(scene.timeLimit / 60)}:${String(scene.timeLimit % 60).padStart(2, '0')}`, x + 140, y + bob + 72);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 15px sans-serif';
      ctx.fillText(scene.tagline, x + 140, y + bob + 100);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`Press ${i + 1} or click here`, x + 140, y + bob + 128);
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px sans-serif';
    ctx.fillText('Click a difference in either picture · wrong clicks cost 5 seconds · H for a hint · find fast for combo points', VIEW_WIDTH / 2, 500);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText('24 differences across 3 hand-drawn scenes · original art, drawn fresh for this game', VIEW_WIDTH / 2, 530);
    const pulse = 0.7 + 0.3 * Math.sin(now * 4);
    ctx.fillStyle = `rgba(251,191,36,${pulse})`;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press 1, 2 or 3 to play — or click a level card', VIEW_WIDTH / 2, 580);
  }

  function drawStars(cx, y, count) {
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < count ? '#fbbf24' : '#334155';
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', cx + (i - 1) * 44, y);
    }
  }

  function draw(state, screen, best, now, crosshair, hover) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    if (screen === SCREEN_TITLE) {
      drawTitle(state, best, now);
      return;
    }
    drawHud(state, best, now);
    drawPanels(state, now);
    drawBottom(state);
    drawCrosshair(crosshair, hover, screen);
    if (screen === SCREEN_PAUSED) {
      overlayCard('PAUSED', ['Take a breath — the clock is stopped.', 'P or Enter to keep hunting · Backspace for the title screen'], '#38bdf8');
    } else if (screen === SCREEN_LEVEL_WIN) {
      const scene = SCENES[state.level];
      const card = overlayCard(`${scene.name} — CLEARED!`, [
        `All ${scene.differences.length} differences found · level score ${state.levelScores[state.level]}`,
        `Total score ${state.score} · best combo x${state.bestCombo}`,
        'Enter for the next level · Backspace for the title screen',
      ], '#22c55e');
      drawStars(VIEW_WIDTH / 2, card.y + 210, 3);
    } else if (screen === SCREEN_GAME_WIN) {
      const card = overlayCard('YOU FOUND THEM ALL!', [
        `24 differences across 3 scenes · total score ${state.score}`,
        `Best combo x${state.bestCombo} · wrong clicks ${state.wrongClicks}`,
        'Enter to play again · Backspace for the title screen',
      ], '#fbbf24');
      drawStars(VIEW_WIDTH / 2, card.y + 210, 3);
    } else if (screen === SCREEN_LEVEL_LOSE) {
      const scene = SCENES[state.level];
      overlayCard("TIME'S UP!", [
        `${scene.name}: you found ${state.found.length} of ${scene.differences.length} differences.`,
        `Score ${state.score} — the unfound ones stay hidden.`,
        'Enter to retry this level · Backspace for the title screen',
      ], '#ef4444');
    }
  }

  return { draw };
}
