// Twin Tides: every sound is synthesised with WebAudio — no audio files,
// no network. The context is created on the first user gesture, so the
// game stays silent until the player interacts with it.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, start, duration, type, volume) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  }

  function playFind() {
    tone(660, 0, 0.18, 'sine', 0.22);
    tone(880, 0.08, 0.22, 'sine', 0.22);
    tone(1320, 0.16, 0.3, 'triangle', 0.12);
  }

  function playMiss() {
    tone(160, 0, 0.22, 'sawtooth', 0.1);
    tone(110, 0.05, 0.25, 'sawtooth', 0.08);
  }

  function playHint() {
    tone(520, 0, 0.15, 'sine', 0.15);
    tone(780, 0.1, 0.2, 'sine', 0.15);
  }

  function playWin() {
    [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.12, 0.35, 'triangle', 0.2));
  }

  function playLose() {
    [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.16, 0.3, 'triangle', 0.16));
  }

  function playTick() {
    tone(980, 0, 0.06, 'square', 0.05);
  }

  function playClick() {
    tone(440, 0, 0.06, 'sine', 0.1);
  }

  return {
    unlock: ensure,
    playFind,
    playMiss,
    playHint,
    playWin,
    playLose,
    playTick,
    playClick,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
  };
}
