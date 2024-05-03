# Music Player

! Warning, this is currently in beta version 0.2. Errors and glitches likely to occur !

Experience music like never before with a real-time streaming and editing music player.

The most exciting feature is the song editing! Seamlessly edit the song you are listening to and keep the settings saved for all future songs. For example, are you a big fan of listening to sped up songs? Simply use the preset (or create your own preset) to have the currently plaing song become its sped-up version. If you're just listening to your playlist, the next song will also be sped up! Like how the song sounds? Export it to keep it saved forever.

Don't have any local songs? No problem! Music Player also includes the ability to download songs directly from Youtube by providing the song's url.
<br>SOON: Have a Spotify account? Download your songs or playlists or even stream directly from your account!

Music Player also has an extensive full-screen mode. Sit back and watch the audio spectrum of the current song. Listening to an MP4? Full-screen mode even lets you watch the accompanied music video!

# IDEAS

- Move the effects off of the tab. make the main screen slide up and the effect controller screen slides up.

WIP

TODO:

1. Loading screens/indicators on everything. (Applying current effect combo, changing songs, etc.)
2. Watch the library directory for file changes so we don't need a manual refresh
3. Themes
4. Using remotely - server & remote
5. Caching?
6. Easy support for creating own themes
7. Addon support
   - Lyrics
   - Themes?
   - Youtube?
   - Audio edit plugins
8. Add ability to add image ! WILL WRITE TO THAT FILE THEN
9. lazy loading - 'react-window'
10. Need to export to mp3, rn, exporting to WAV is creating audio files x10 as big as their original
11. Start creating the new song before the current ends on auto play so the user doesnt have to wait for it to render
12. Add tailwindCSS, it should reduce a lot of the duplicate CSS. Or not tailwindCSS but just cleanup the CSS.
13. Videos tab. Just another songList but showing only mp4 files
14. Fix how Spotify songs are saved. Right now its doing extra stuff to get the artist. I should send data somehow of the song data (title, artist, album) to be used when its finished downloading from youtube. Maybe just use a callback?
15. On spotify -> display if song/playlist is already downloaded
16. What quality are the mp4s being downloaded at from youtube
17. Add a cleanup when the app first starts. To see if there were any songs that weren't somehow deleted

999 Easy file/song sharing

BUGS:

1. Fixup all of the addEffect, runEffect stuff
2. Queue display gets out of sync
3. Cant download two spotify mp4s at the same time... before testing, remove the console logs of "FFmpegProgress" and "Data"
4. When logging into spotify for the first time, you cant get past the login screen. You have to hard refresh and then youll be signed in

## Launching

`npm install`
`npm run all`

## Testing

To run the tests
`npm test`

To see the coverage
`npx jest --coverage`

## Build and Run

`npm install --production`

webpack
`npm run watch`

Build App
`npm run electron-build`

In /dist, run setup.exe
!!! If can't build, makesure react-scripts is NOT installed
// HAD -> "react-scripts": "^5.0.1",

#### EFFECTS TO ADD

Equalizer (Tone.EQ3): Tone.js provides an EQ3 module that allows you to control the low, mid, and high-frequency bands of an audio signal. This can be used to shape the tonal balance of your audio.
const eq = new Tone.EQ3(-12, -6, -3).toDestination();

Filter (Tone.Filter): You can use filters to remove or emphasize certain frequencies in your audio. Tone.js offers various filter types, including lowpass, highpass, bandpass, and more.
const filter = new Tone.Filter(200, 'lowpass').toDestination();

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
