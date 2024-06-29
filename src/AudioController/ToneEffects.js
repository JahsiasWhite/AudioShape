import * as Tone from 'tone';

export async function renderAudioWithEffect(
  audioBuffer,
  effectFunction,
  effectParams
) {
  switch (effectFunction) {
    case 'reverbIsActive':
    case 'reverbWetness':
      effectFunction = applyReverb;
      break;
    case 'delay':
      effectFunction = applyDelay;
      break;
    case 'bitCrusher':
      effectFunction = applyBitCrusher;
      break;
    case 'pitchShift':
      effectFunction = applyPitchShift;
      break;
    case 'high':
    case 'mid':
    case 'low':
      effectFunction = applyEQ;
      break;
    case 'autowah':
      effectFunction = applyAutoWah;
      break;
    case 'chorus':
      effectFunction = applyChorus;
      break;

    default:
      console.error(`Unknown effect: ${effect}`);
      return;
  }

  console.error('EFFECT PARAMS: ', effectParams);
  const duration = audioBuffer.duration;
  return await Tone.Offline(async ({ transport }) => {
    const source = effectFunction(audioBuffer, effectParams);
    source.start();
  }, duration);
}

export async function renderAudioWithSpeedChange(audioBuffer, speedChange) {
  const duration = audioBuffer.duration / speedChange;
  return await Tone.Offline(async ({ transport }) => {
    const source = applySpeedChange(audioBuffer, speedChange);
    source.start();
  }, duration);
}

function applySpeedChange(audioBuffer, speedChange) {
  const player = new Tone.Player(audioBuffer).toDestination();
  player.playbackRate = speedChange;
  return player;
}

function applyReverb(audioBuffer, wetValue) {
  // const reverb = new Tone.Reverb().toDestination();
  // const player = new Tone.Player(audioBuffer).connect(reverb);

  const reverb = new Tone.Freeverb().toDestination();

  // Defaults
  const WET_VALUE = 0.5; // 0-1, determines how much the original signal is mixed with the reverb signal. 1 === 100%, 0 === 0% meaning it will be the original audio
  const ROOM_SIZE = 0.5; // 0-1, how expansive the reverb sounds. 1 === large room/long decay time.
  const DAMPENING_VALUE = 8000; // 1000-10000, controls how quickly high-frequency content decays over time. The lower the value, the 'brighter' and more reflective it sounds. High values make the reverb sound darker and less reflective
  reverb.wet.value = WET_VALUE; // Also known as 'mix'
  reverb.roomSize.value = ROOM_SIZE;
  reverb.dampening = DAMPENING_VALUE; // Also known as 'Tone'

  if (wetValue) {
    reverb.wet.value = wetValue;
  }

  const player = new Tone.Player(audioBuffer).connect(reverb);

  return player;
}

/* DELAY EFFECT */
function applyDelay(audioBuffer, delayTime, feedback) {
  const delay = new Tone.FeedbackDelay({
    delayTime: delayTime, // Adjust this value to set the delay time (in seconds)
    feedback: 0.5, // Adjust this value to set the feedback amount (0 to 1). Determines how much is fedback, 1 indicates full feedback (infinitely recycled) and 0 meens no feedback (only original audio is heard)
  }).toDestination();

  const player = new Tone.Player(audioBuffer).connect(delay);

  return player;
}

/* BIT CRUSHER EFFECT */
function applyBitCrusher(audioBuffer, bits, frequency) {
  const bitCrusher = new Tone.BitCrusher({
    bits: bits, // Number of bits to reduce the audio to (e.g., 4 bits for a lo-fi effect) ! 16 is CD quality
    // frequency: 1000, // Sample rate reduction frequency (controls the downsampling effect) ! I THINK 44,100 is the typical frequency
  }).toDestination();

  const player = new Tone.Player(audioBuffer).connect(bitCrusher);

  return player;
}

/* PITCH SHIFT EFFECT */
function applyPitchShift(audioBuffer, pitch) {
  const pitchShift = new Tone.PitchShift().toDestination();
  pitchShift.pitch = pitch; // +12 === one octave up

  const player = new Tone.Player(audioBuffer).connect(pitchShift);

  return player;
}

/* Equalizer stuff */
// const eqValues = [1, 1, 1];
function applyEQ(audioBuffer, eqValues) {
  // [low, mid, high]
  const [low, mid, high] = eqValues;
  const eq = new Tone.EQ3(low, mid, high).toDestination();
  console.error('EQ: ', eqValues, eq);

  const player = new Tone.Player(audioBuffer).connect(eq);

  return player;
}

function applyAutoWah(audioBuffer, value) {
  const autoWah = new Tone.AutoWah(value, 6, 0).toDestination();

  const player = new Tone.Player(audioBuffer).connect(autoWah);

  return player;
}

function applyChorus(audioBuffer, value) {
  const autoWah = new Tone.Chorus(value, 2.5, 0.5).toDestination(); // 1.5, 3.5, 0.7

  const player = new Tone.Player(audioBuffer).connect(autoWah);

  return player;
}
