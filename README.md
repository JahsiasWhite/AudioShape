# Music Player

! Warning, this is currently in beta version 0.2. Errors and glitches likely to occur !

Traditional music player with additional customizations and song editing.

The most exciting feature is the song editing! Seamlessly edit the song you are listening to and keep the settings saved for all future songs. For example, are you a big fan of listening to sped up songs? Simply use the preset (or create your own preset) to have the currently plaing song become its sped-up version. If you're just listening to your playlist, the next song will also be sped up! Like how the song sounds? Export it to keep it saved forever.

Don't have any local songs? No problem! Music Player also includes the ability to download songs directly from Youtube by providing the song's url.
<br>SOON: Have a Spotify account? Download your songs or playlists or even stream directly from your account!

Music Player also has an extensive full-screen mode. Sit back and watch the audio spectrum of the current song. Listening to an MP4? Full-screen mode even lets you watch the video along with it!

WIP

TODO:

1. I think there's some over lap of 'npm i'. Pretty sure react-scripts is in both, probably much more
2. cleanup react-app, lots of unused stuff
3. implement testing
4. Watch the library directory for file changes so we don't need a manual refresh
5. Themes
6. Using remotely - server & remote
7. Caching?
8. Easy support for creating own themes
9. Addon support
   - Lyrics
   - Themes?
   - Youtube?
   - Audio edit plugins
10. Add ability to add image ! WILL WRITE TO THAT FILE THEN
11. lazy loading
12. Add a queue system
13. Cleanup packages, I know wave-encoder is not used
14. Need to export to mp3, rn, exporting to WAV is creating audio files x10 as big as their original
15. Shuffle
16. Resturcture styles, does creating all of these extra folders take up a lot of storage??
17. Add gif support for fullscreen mode
18. Start creating the new song before the current ends on auto play so the user doesnt have to wait for it to render
19. Add tailwindCSS, it should reduce a lot of the duplicate CSS

999 Easy file/song sharing

BUGS:

1.  Playlists with 0 songs show all songs
2.  Can't enter fullscreen multiple times

## Launching

npm run all

#### EFFECTS TO ADD

Equalizer (Tone.EQ3): Tone.js provides an EQ3 module that allows you to control the low, mid, and high-frequency bands of an audio signal. This can be used to shape the tonal balance of your audio.
const eq = new Tone.EQ3(-12, -6, -3).toDestination();

Filter (Tone.Filter): You can use filters to remove or emphasize certain frequencies in your audio. Tone.js offers various filter types, including lowpass, highpass, bandpass, and more.
const filter = new Tone.Filter(200, 'lowpass').toDestination();

Delay (Tone.FeedbackDelay): Delay effects create echoes or repeats of the audio signal. You can adjust parameters like delay time and feedback to control the delay effect.
const delay = new Tone.FeedbackDelay('8n', 0.5).toDestination();

Compressor (Tone.Compressor): Compressors are used to control the dynamic range of audio signals, making loud sounds quieter and quiet sounds louder.
const compressor = new Tone.Compressor(-30, 3).toDestination();

Distortion (Tone.Distortion): Distortion effects add harmonics and alter the timbre of an audio signal. You can control parameters like distortion type and amount.
const distortion = new Tone.Distortion(0.4).toDestination();

Chorus (Tone.Chorus): Chorus effects create a thicker and richer sound by modulating the pitch of the audio signal.
const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();

Bitcrusher (Tone.BitCrusher): Bitcrushing is a lo-fi effect that reduces the bit depth of an audio signal.
const bitcrusher = new Tone.BitCrusher(4).toDestination();

// COMBOS ?????

Reverb + Delay: Combine reverb and delay effects to create lush, atmospheric soundscapes. Reverb adds space and depth to your audio, while delay introduces echoes and repeats.

Distortion + Filter: Apply distortion to your audio source to add grit and harmonic richness, and then use a filter to shape the tone by emphasizing or attenuating specific frequency ranges.

Phaser + Flanger: Phaser and flanger effects modulate the phase of the audio signal to create sweeping, swirling, and jet-like sounds. These effects are great for adding motion and character to your audio.

Chorus + Tremolo: Chorus adds depth and thickness to your sound by creating multiple slightly detuned copies of the original audio. Pair it with tremolo for rhythmic volume modulation, adding a pulsating or "wobbly" quality to your audio.

Bit Crusher + Sample Rate Reducer: Create lo-fi and retro effects by reducing the bit depth and sample rate of your audio. These effects can make your audio sound like it's coming from old video games or vintage equipment.

Pitch Shift + Time Stretch: Pitch shift allows you to change the pitch of your audio, while time stretch alters the playback speed while maintaining pitch. Combining these effects can create surreal and otherworldly sounds.

Compressor + Limiter: Use a compressor to control dynamic range and even out the volume of your audio, and then add a limiter to prevent clipping and ensure a consistent output level.

Auto-Pan + Auto-Wah: Auto-pan automatically pans the audio between the left and right channels, creating a stereo motion effect. Auto-wah adds dynamic filtering based on the audio's amplitude, creating expressive "wah-wah" effects.

Ring Modulator + Frequency Shifter: These effects can introduce dissonance and unusual harmonic content to your audio. They are often used for experimental and avant-garde sound design.

Granular Synthesis + Modulation: Explore granular synthesis to break audio into tiny grains and manipulate them in various ways. Combine it with modulation effects like LFOs to create evolving and evolving textures.
