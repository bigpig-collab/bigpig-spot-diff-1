// Twin Tides: the three scenes. Each scene is drawn twice — the left panel
// is the original, the right panel is the same drawing with every listed
// difference applied. A difference is a circle in scene space (600 x 520)
// with a short label that the game shows when the player finds it.
//
// All art is procedural canvas drawing: no image files, no copied art, and
// the two panels can only differ where a difference says so.

export const SCENE_WIDTH = 600;
export const SCENE_HEIGHT = 520;

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function cloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 22 * scale);
  circle(ctx, x + 24 * scale, y - 8 * scale, 26 * scale);
  circle(ctx, x + 52 * scale, y, 20 * scale);
  circle(ctx, x + 26 * scale, y + 8 * scale, 24 * scale);
}

function gull(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 5, y - 9, x, y);
  ctx.quadraticCurveTo(x + 5, y - 9, x + 12, y);
  ctx.stroke();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- harbour
function drawHarbour(ctx, right) {
  // Dawn sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#7ec8e3');
  sky.addColorStop(0.55, '#ffd9a0');
  sky.addColorStop(1, '#ffb37a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 340);
  const sea = ctx.createLinearGradient(0, 340, 0, 520);
  sea.addColorStop(0, '#2f7ea8');
  sea.addColorStop(1, '#174a6b');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 340, 600, 180);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 5; i += 1) ctx.fillRect(30 + i * 110, 372 + i * 26, 90, 4);

  // Sun (difference 0: gone on the right, hidden behind a cloud).
  if (!right) {
    ctx.fillStyle = '#ffdf6b';
    circle(ctx, 110, 92, 34);
    ctx.fillStyle = 'rgba(255,223,107,0.35)';
    circle(ctx, 110, 92, 48);
  } else {
    cloud(ctx, 78, 84, 1.5, '#fff3d6');
  }
  cloud(ctx, 300, 70, 1.1, 'rgba(255,255,255,0.9)');
  cloud(ctx, 470, 120, 0.9, 'rgba(255,255,255,0.8)');

  // Seagulls (difference 5: the middle gull is missing on the right).
  gull(ctx, 250, 84, '#334155');
  if (!right) gull(ctx, 330, 66, '#334155');
  gull(ctx, 410, 92, '#334155');

  // Hillside houses on the left.
  ctx.fillStyle = '#e07856';
  roundRect(ctx, 30, 250, 74, 62, 6);
  ctx.fillStyle = '#8b4a3c';
  ctx.beginPath();
  ctx.moveTo(24, 252);
  ctx.lineTo(67, 214);
  ctx.lineTo(110, 252);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4a259';
  roundRect(ctx, 116, 262, 64, 50, 6);
  ctx.fillStyle = '#7a3b2e';
  ctx.beginPath();
  ctx.moveTo(110, 264);
  ctx.lineTo(148, 232);
  ctx.lineTo(186, 264);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(52, 272, 14, 14);
  ctx.fillRect(138, 280, 12, 12);

  // Lighthouse on the right (difference 2: its lamp is dark on the right).
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(508, 150, 44, 190);
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(508, 190, 44, 22);
  ctx.fillRect(508, 250, 44, 22);
  ctx.fillStyle = '#334155';
  ctx.fillRect(502, 132, 56, 20);
  ctx.fillStyle = right ? '#475569' : '#ffd166';
  circle(ctx, 530, 142, 10);
  if (!right) {
    ctx.fillStyle = 'rgba(255,209,102,0.35)';
    circle(ctx, 530, 142, 24);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(502, 132);
  ctx.lineTo(530, 108);
  ctx.lineTo(558, 132);
  ctx.closePath();
  ctx.fill();

  // Wooden pier across the sea.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 400, 600, 26);
  ctx.fillStyle = '#6b4423';
  for (let i = 0; i < 8; i += 1) ctx.fillRect(40 + i * 72, 426, 12, 44);
  ctx.fillStyle = '#a06a3b';
  for (let i = 0; i < 12; i += 1) ctx.fillRect(8 + i * 50, 402, 3, 22);

  // The cat on the pier (difference 3: no cat on the right).
  if (!right) {
    ctx.fillStyle = '#1f2937';
    ellipse(ctx, 182, 392, 20, 12);
    circle(ctx, 200, 380, 10);
    ctx.beginPath();
    ctx.moveTo(193, 372);
    ctx.lineTo(196, 360);
    ctx.lineTo(200, 371);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(203, 371);
    ctx.lineTo(207, 360);
    ctx.lineTo(209, 372);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(164, 392);
    ctx.quadraticCurveTo(148, 384, 152, 368);
    ctx.stroke();
  }

  // Sailboat (differences 1 and 4: sail colour and mast flag).
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.moveTo(280, 360);
  ctx.lineTo(380, 360);
  ctx.lineTo(360, 388);
  ctx.lineTo(300, 388);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b2110';
  ctx.fillRect(326, 268, 6, 94);
  ctx.fillStyle = right ? '#0e7490' : '#dc2626';
  ctx.beginPath();
  ctx.moveTo(332, 272);
  ctx.lineTo(332, 352);
  ctx.lineTo(392, 352);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = right ? '#2563eb' : '#ef4444';
  ctx.beginPath();
  ctx.moveTo(332, 268);
  ctx.lineTo(362, 276);
  ctx.lineTo(332, 284);
  ctx.closePath();
  ctx.fill();

  // Buoy (difference 6: red on the left, green on the right).
  ctx.fillStyle = right ? '#16a34a' : '#dc2626';
  ctx.beginPath();
  ctx.moveTo(84, 448);
  ctx.lineTo(104, 448);
  ctx.lineTo(110, 472);
  ctx.lineTo(78, 472);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(80, 458, 28, 6);
  ctx.fillStyle = '#fbbf24';
  circle(ctx, 94, 442, 5);
}

// ------------------------------------------------------------- night market
function drawMarket(ctx, right) {
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#0f172a');
  sky.addColorStop(1, '#312e81');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);
  star(ctx, 80, 60, 7, '#fde68a');
  star(ctx, 180, 40, 5, '#ffffff');
  star(ctx, 420, 44, 5, '#ffffff');
  star(ctx, 250, 90, 4, '#c7d2fe');

  // Moon (difference 0: full on the left, crescent on the right).
  ctx.fillStyle = '#fef3c7';
  circle(ctx, 505, 72, 30);
  if (right) {
    ctx.fillStyle = '#312e81';
    circle(ctx, 518, 64, 26);
  }

  // String lights (difference 7: one bulb missing on the right).
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(300, 150, 600, 96);
  ctx.stroke();
  const bulbs = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
  for (let i = 0; i < 9; i += 1) {
    const x = 40 + i * 65;
    const y = 96 + Math.sin((i / 8) * Math.PI) * 34;
    if (right && i === 4) continue;
    ctx.fillStyle = bulbs[i % bulbs.length];
    circle(ctx, x, y + 8, 8);
  }

  // Paper lanterns (difference 1: the middle lantern is gold on the right).
  const lanternXs = [150, 300, 450];
  lanternXs.forEach((x, i) => {
    ctx.fillStyle = right && i === 1 ? '#fbbf24' : '#ef4444';
    ellipse(ctx, x, 150, 26, 32);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(x - 26, 142, 52, 5);
    ctx.fillRect(x - 26, 154, 52, 5);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x - 4, 116, 8, 8);
  });

  // Three stalls with striped awnings.
  const stalls = [
    { x: 30, color: '#f97316', sign: 'TEA' },
    { x: 220, color: '#059669', sign: 'BUNS' },
    { x: 410, color: '#7c3aed', sign: 'TOYS' },
  ];
  stalls.forEach((stall, i) => {
    const awning = right && i === 1 ? '#16a34a' : stall.color;
    for (let s = 0; s < 6; s += 1) {
      ctx.fillStyle = s % 2 === 0 ? awning : '#fff7ed';
      ctx.fillRect(stall.x + s * 26, 220, 26, 30);
    }
    ctx.fillStyle = '#78350f';
    ctx.fillRect(stall.x, 250, 156, 10);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(stall.x + 8, 260, 140, 110);
    ctx.fillStyle = '#fef3c7';
    roundRect(ctx, stall.x + 40, 280, 76, 34, 6);
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    // Difference 7: the tea stall's sign gains an exclamation on the right.
    ctx.fillText(right && i === 0 ? 'TEA!' : stall.sign, stall.x + 78, 304);
    ctx.fillStyle = '#fbbf24';
    circle(ctx, stall.x + 30, 330, 8);
    circle(ctx, stall.x + 78, 330, 8);
    circle(ctx, stall.x + 126, 330, 8);
  });

  // The vendor (difference 4: straw hat on the left, red cap on the right).
  ctx.fillStyle = '#fde68a';
  circle(ctx, 430, 420, 18);
  ctx.fillStyle = '#0ea5e9';
  roundRect(ctx, 408, 438, 44, 52, 10);
  if (!right) {
    ctx.fillStyle = '#facc15';
    ellipse(ctx, 430, 406, 30, 10);
    ctx.fillStyle = '#eab308';
    ellipse(ctx, 430, 400, 16, 10);
  } else {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(430, 408, 18, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(430, 404, 26, 8);
  }

  // Crate stack (difference 5: three crates on the left, two on the right).
  ctx.fillStyle = '#b45309';
  ctx.fillRect(520, 430, 56, 40);
  ctx.fillRect(528, 390, 40, 40);
  if (!right) ctx.fillRect(536, 350, 28, 40);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.strokeRect(520, 430, 56, 40);

  // The cat on a crate (difference 6: no cat on the right).
  if (!right) {
    ctx.fillStyle = '#f97316';
    ellipse(ctx, 150, 448, 20, 12);
    circle(ctx, 168, 436, 10);
    ctx.beginPath();
    ctx.moveTo(161, 428);
    ctx.lineTo(164, 416);
    ctx.lineTo(168, 427);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(171, 427);
    ctx.lineTo(175, 416);
    ctx.lineTo(177, 428);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 470, 600, 50);
  ctx.fillStyle = 'rgba(251,191,36,0.5)';
  ctx.fillRect(0, 470, 600, 4);
}

// -------------------------------------------------------------- star garden
function drawGarden(ctx, right) {
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.6, '#3b0764');
  sky.addColorStop(1, '#0f172a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);
  star(ctx, 120, 50, 7, '#fde68a');
  star(ctx, 300, 36, 5, '#ffffff');
  star(ctx, 480, 58, 6, '#fde68a');
  star(ctx, 210, 90, 4, '#ffffff');
  star(ctx, 390, 100, 4, '#c7d2fe');
  // One bright star (difference 6: missing on the right).
  if (!right) star(ctx, 540, 130, 8, '#fef08a');

  // Big tree on the left, with the owl (difference 0: no owl on the right).
  ctx.fillStyle = '#451a03';
  ctx.fillRect(52, 180, 26, 180);
  ctx.fillStyle = '#14532d';
  circle(ctx, 66, 150, 62);
  circle(ctx, 20, 180, 40);
  circle(ctx, 112, 180, 40);
  ctx.fillStyle = '#166534';
  circle(ctx, 66, 130, 34);
  if (!right) {
    ctx.fillStyle = '#92400e';
    ellipse(ctx, 108, 210, 14, 20);
    ctx.fillStyle = '#fef3c7';
    circle(ctx, 102, 204, 5);
    circle(ctx, 114, 204, 5);
    ctx.fillStyle = '#1c1917';
    circle(ctx, 102, 204, 2);
    circle(ctx, 114, 204, 2);
  }

  // Stone arch with a lantern (difference 8: dark on the right).
  ctx.fillStyle = '#78716c';
  ctx.fillRect(230, 150, 24, 130);
  ctx.fillRect(346, 150, 24, 130);
  ctx.fillRect(230, 130, 140, 24);
  ctx.fillStyle = right ? '#57534e' : '#fbbf24';
  ellipse(ctx, 300, 168, 12, 16);
  if (!right) {
    ctx.fillStyle = 'rgba(251,191,36,0.3)';
    circle(ctx, 300, 168, 30);
  }

  // Fountain (difference 1: three jets on the left, two on the right).
  ctx.fillStyle = '#a8a29e';
  ellipse(ctx, 300, 420, 110, 26);
  ctx.fillStyle = '#38bdf8';
  ellipse(ctx, 300, 416, 96, 20);
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(300, 380);
  ctx.quadraticCurveTo(280, 330, 260, 320);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 380);
  ctx.quadraticCurveTo(300, 320, 300, 305);
  ctx.stroke();
  if (!right) {
    ctx.beginPath();
    ctx.moveTo(300, 380);
    ctx.quadraticCurveTo(320, 330, 340, 320);
    ctx.stroke();
  }
  ctx.fillStyle = '#d6d3d1';
  roundRect(ctx, 288, 372, 24, 44, 6);

  // Flower beds (difference 2: the big tulip is purple on the right).
  const flowers = [
    { x: 150, y: 440, color: '#f43f5e' },
    { x: 190, y: 460, color: '#f59e0b' },
    { x: 450, y: 450, color: '#ec4899' },
    { x: 490, y: 465, color: '#a78bfa' },
  ];
  flowers.forEach((flower, i) => {
    const color = right && i === 0 ? '#8b5cf6' : flower.color;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(flower.x, flower.y + 26);
    ctx.lineTo(flower.x, flower.y);
    ctx.stroke();
    ctx.fillStyle = color;
    circle(ctx, flower.x - 8, flower.y - 6, 8);
    circle(ctx, flower.x + 8, flower.y - 6, 8);
    circle(ctx, flower.x, flower.y - 12, 9);
  });

  // Mushrooms (difference 3: three on the left, two on the right).
  const mushrooms = [
    { x: 470, y: 470 },
    { x: 500, y: 478 },
    { x: 530, y: 468 },
  ];
  mushrooms.forEach((mushroom, i) => {
    if (right && i === 2) return;
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(mushroom.x - 4, mushroom.y, 8, 12);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(mushroom.x, mushroom.y, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    circle(ctx, mushroom.x - 5, mushroom.y - 6, 2);
    circle(ctx, mushroom.x + 5, mushroom.y - 8, 2);
  });

  // Bench with a cushion (difference 4: cushion is teal on the right).
  ctx.fillStyle = '#78350f';
  ctx.fillRect(380, 380, 110, 12);
  ctx.fillRect(388, 392, 8, 30);
  ctx.fillRect(474, 392, 8, 30);
  ctx.fillStyle = right ? '#0d9488' : '#e11d48';
  roundRect(ctx, 392, 368, 86, 14, 7);

  // Fireflies (difference 5: five on the left, four on the right).
  const flies = [
    [180, 300],
    [230, 260],
    [360, 290],
    [420, 250],
    [520, 300],
  ];
  flies.forEach((fly, i) => {
    if (right && i === 4) return;
    ctx.fillStyle = '#bef264';
    circle(ctx, fly[0], fly[1], 4);
    ctx.fillStyle = 'rgba(190,242,100,0.3)';
    circle(ctx, fly[0], fly[1], 10);
  });

  // Pond with lily pads (difference 7: three pads on the left, two on the right).
  ctx.fillStyle = '#0e7490';
  ellipse(ctx, 150, 500, 90, 14);
  const pads = [110, 150, 190];
  pads.forEach((x, i) => {
    if (right && i === 2) return;
    ctx.fillStyle = '#16a34a';
    ellipse(ctx, x, 498, 18, 7);
  });
  ctx.fillStyle = '#f472b6';
  circle(ctx, 150, 492, 6);
}

export const SCENES = [
  {
    id: 'harbour',
    name: 'Harbour Dawn',
    tagline: 'A sleepy fishing harbour at first light.',
    timeLimit: 180,
    draw: drawHarbour,
    differences: [
      { x: 110, y: 92, r: 40, label: 'The sun vanished!' },
      { x: 360, y: 312, r: 42, label: 'The sail changed colour!' },
      { x: 530, y: 142, r: 26, label: 'The lighthouse lamp went dark!' },
      { x: 182, y: 384, r: 30, label: 'The pier cat slipped away!' },
      { x: 348, y: 276, r: 22, label: 'The mast flag changed colour!' },
      { x: 330, y: 66, r: 22, label: 'A seagull flew off!' },
      { x: 94, y: 458, r: 26, label: 'The buoy changed colour!' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, stalls and one sneaky cat.',
    timeLimit: 150,
    draw: drawMarket,
    differences: [
      { x: 505, y: 72, r: 36, label: 'The moon turned crescent!' },
      { x: 300, y: 150, r: 34, label: 'A lantern turned gold!' },
      { x: 298, y: 235, r: 34, label: 'The awning changed colour!' },
      { x: 430, y: 404, r: 30, label: 'The vendor changed hats!' },
      { x: 550, y: 370, r: 30, label: 'A crate went missing!' },
      { x: 150, y: 440, r: 30, label: 'The market cat slipped away!' },
      { x: 300, y: 122, r: 20, label: 'A string-light bulb went out!' },
      { x: 108, y: 297, r: 30, label: 'The tea stall sign changed!' },
    ],
  },
  {
    id: 'garden',
    name: 'Star Garden',
    tagline: 'Fireflies, a fountain and a watchful owl.',
    timeLimit: 120,
    draw: drawGarden,
    differences: [
      { x: 108, y: 210, r: 30, label: 'The owl flew away!' },
      { x: 340, y: 330, r: 30, label: 'A fountain jet stopped!' },
      { x: 150, y: 432, r: 26, label: 'The tulip changed colour!' },
      { x: 530, y: 462, r: 24, label: 'A mushroom vanished!' },
      { x: 435, y: 375, r: 30, label: 'The bench cushion changed colour!' },
      { x: 520, y: 300, r: 20, label: 'A firefly blinked out!' },
      { x: 540, y: 130, r: 22, label: 'A bright star faded!' },
      { x: 190, y: 498, r: 22, label: 'A lily pad drifted off!' },
      { x: 300, y: 168, r: 26, label: 'The arch lantern went dark!' },
    ],
  },
];

// Paint one scene into a panel. `right` picks the changed twin.
export function drawScene(ctx, sceneIndex, right) {
  const scene = SCENES[sceneIndex];
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  ctx.clip();
  scene.draw(ctx, right);
  ctx.restore();
}

// The difference whose circle holds a scene point, or -1.
export function differenceAt(sceneIndex, x, y) {
  const diffs = SCENES[sceneIndex].differences;
  for (let i = 0; i < diffs.length; i += 1) {
    const dx = x - diffs[i].x;
    const dy = y - diffs[i].y;
    if (dx * dx + dy * dy <= diffs[i].r * diffs[i].r) return i;
  }
  return -1;
}
