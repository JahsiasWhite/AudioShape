import * as Tone from 'tone';
import { connect as toneConnect } from 'tone';

/**
 * Returns the persisted chain state, which survives HMR module reloads because
 * it lives on `window` rather than as a module-level variable.
 */
function getState() {
  return window.__toneEffectsState;
}

/**
 * Creates and wires the persistent live Tone.js effects chain to the audio element.
 * Safe to call multiple times — only runs once per page lifetime (including HMR reloads).
 * @param {HTMLAudioElement} audioElement
 * @returns {Promise<void>}
 */
export async function setupLiveEffectsChain(audioElement) {
  if (getState()) return; // Already initialized — survive HMR resets

  await Tone.start(); // Resume AudioContext (requires user gesture in browser; fine in Electron)

  const ctx = Tone.getContext().rawContext;
  const sourceNode = ctx.createMediaElementSource(audioElement);
  const nodes = {};

  // Tone.Reverb uses a native ConvolverNode — no AudioWorklets — which avoids the race
  // condition where Tone.Freeverb's 16 internal FeedbackCombFilter instances all race to
  // registerProcessor('feedback-comb-filter') concurrently, corrupting the AudioWorklet scope.
  nodes.reverb = new Tone.Reverb({ decay: 2, preDelay: 0.01, wet: 0 });
  await nodes.reverb.generate();
  nodes.delay      = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.5, wet: 0 });
  nodes.bitCrusher = new Tone.BitCrusher(16);
  nodes.bitCrusher.wet.value = 0;
  nodes.pitchShift = new Tone.PitchShift({ pitch: 0 });
  nodes.pitchShift.wet.value = 0;
  nodes.eq         = new Tone.EQ3(0, 0, 0);
  nodes.autoWah    = new Tone.AutoWah(100, 6, -20);
  nodes.autoWah.wet.value = 0;
  nodes.chorus     = new Tone.Chorus(1.5, 3.5, 0.7);
  nodes.chorus.wet.value = 0;
  nodes.chorus.start();

  // Wire the chain: source → reverb → delay → bitCrusher → pitchShift → eq → autoWah → chorus → out
  // toneConnect unwraps Tone node wrappers to native AudioNodes before calling native .connect()
  toneConnect(sourceNode, nodes.reverb);
  nodes.reverb.connect(nodes.delay);
  nodes.delay.connect(nodes.bitCrusher);
  nodes.bitCrusher.connect(nodes.pitchShift);
  nodes.pitchShift.connect(nodes.eq);
  nodes.eq.connect(nodes.autoWah);
  nodes.autoWah.connect(nodes.chorus);
  nodes.chorus.toDestination();

  // Tap the final output into a native AnalyserNode so AudioSpectrum can visualise it.
  // This avoids AudioSpectrum creating a second MediaElementAudioSourceNode (which the
  // browser disallows — an element can only be owned by one AudioContext at a time).
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  nodes.chorus.connect(analyser); // parallel tap — audio still goes to destination above

  // Persist on window so HMR module reloads don't try to re-create the chain
  window.__toneEffectsState = { sourceNode, nodes, reverbWetness: 0, analyser };
}

/**
 * Instantly updates a single live effect parameter — no file rendering needed.
 * @param {string} effectName
 * @param {*} value
 */
export function updateLiveEffect(effectName, value) {
  const state = getState();
  if (!state) return;
  const { nodes } = state;

  switch (effectName) {
    case 'reverbIsActive':
      nodes.reverb.wet.value = value ? (state.reverbWetness || 0.5) : 0;
      break;

    case 'reverbWetness':
      state.reverbWetness = value;
      nodes.reverb.wet.value = value;
      break;

    case 'delay':
      if (value > 0) {
        nodes.delay.delayTime.value = value;
        nodes.delay.wet.value = 0.5;
      } else {
        nodes.delay.wet.value = 0;
      }
      break;

    case 'bitCrusher':
      nodes.bitCrusher.bits.value = value;
      nodes.bitCrusher.wet.value = value < 16 ? 1 : 0;
      break;

    case 'pitchShift':
      nodes.pitchShift.pitch = value;
      nodes.pitchShift.wet.value = value !== 0 ? 1 : 0;
      break;

    case 'high':
    case 'mid':
    case 'low': {
      // value is always the full [low, mid, high] dB array
      const [low, mid, high] = value;
      nodes.eq.low.value  = low;
      nodes.eq.mid.value  = mid;
      nodes.eq.high.value = high;
      break;
    }

    case 'autowah':
      if (value > 0) {
        nodes.autoWah.baseFrequency = value; // plain number setter, not a Tone Param
        nodes.autoWah.wet.value = 0.8;
      } else {
        nodes.autoWah.wet.value = 0;
      }
      break;

    case 'chorus':
      if (value < 0) {
        nodes.chorus.frequency.value = Math.abs(value);
        nodes.chorus.wet.value = 0.7;
      } else {
        nodes.chorus.wet.value = 0;
      }
      break;

    default:
      break;
  }
}

/**
 * Resets all effect nodes to their neutral (bypassed) state.
 */
export function resetAllLiveEffects() {
  const state = getState();
  if (!state) return;
  const { nodes } = state;

  nodes.reverb.wet.value          = 0;
  nodes.delay.wet.value           = 0;
  nodes.bitCrusher.bits.value     = 16;
  nodes.bitCrusher.wet.value      = 0;
  nodes.pitchShift.pitch          = 0;
  nodes.pitchShift.wet.value      = 0;
  nodes.eq.low.value              = 0;
  nodes.eq.mid.value              = 0;
  nodes.eq.high.value             = 0;
  nodes.autoWah.wet.value         = 0;
  nodes.chorus.wet.value          = 0;
  state.reverbWetness             = 0;
}
