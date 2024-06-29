# AudioShape

## Project Status

<table class="no-border">
  <tr>
    <td><a href="https://github.com/JahsiasWhite/AudioShape/actions/workflows/tests.yml" alt="tests"><img src="https://github.com/JahsiasWhite/AudioShape/actions/workflows/tests.yml/badge.svg" alt="tests"/></a></td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/OS-windows-blue?style=flat&labelColor=363D44" alt="Operating systems"/></td>
  </tr>
</table>

## Introduction

Experience music like never before with a real-time streaming and editing music player.

The most exciting feature is the song editing! Seamlessly edit the song you are listening to and keep the settings saved for all future songs. For example, are you a big fan of listening to sped up songs? Simply use the preset (or create your own preset) to have the currently plaing song become its sped-up version. If you're just listening to your playlist, the next song will also be sped up! Like how the song sounds? Export it to keep it saved forever.

<p align="center">
  <img src="images/edit-screen.png" alt="main screen" width="650">
</p

Don't have any local songs? No problem! AudioShape also includes the ability to download songs directly from Youtube by providing the song's url.
<br>Have a Spotify account? Download your songs or playlists from your account!

AudioShape also has an extensive full-screen mode. Sit back and watch the audio spectrum of the current song. Listening to an MP4? Full-screen mode even lets you watch the accompanied music video!

! Warning, this is currently in beta version 0.26. Errors and glitches likely to occur !

## Build and Run

#### Install dependencies

`npm install --production`<br>
`npm install webpack-cli`<br>

#### Run webpack

`npm run watch` <br>
This will create a new folder titled 'build'

#### Build App

`npm run electron-build`
This will create a new folder titled 'dist'. Inside is where the installer.exe is

- If you can't build, make sure react-scripts is not installed

#### Run the app :)

In /dist, run setup.exe <br>

## Launching

`npm install`
`npm i react-scripts`
`npm run all`

## Testing

To run the tests
`npm test`

To see the coverage
`npx jest --coverage`

## BUGS

1. Fixup all of the addEffect, runEffect stuff
2. Queue display gets out of sync
3. Cant download two spotify mp4s at the same time... before testing, remove the console logs of "FFmpegProgress" and "Data"
4. In fullscreen view, the name changes before the song is loaded when using effects

## TODO

1. Change song key to something unique... not duration
2. Loading screens/indicators on everything. (Applying current effect combo, changing songs, etc.)
3. Remove console logs on production build
4. When on song edit screen, the effects get reset when the next song starts. They should stay and be applied to the next song
5. Watch the library directory for file changes so we don't need a manual refresh
6. Themes
7. Using remotely - server & remote
8. Caching?
9. Easy support for creating own themes
10. Addon support
    - Lyrics
    - Themes?
    - Youtube?
    - Audio edit plugins
11. Add ability to add image ! WILL WRITE TO THAT FILE THEN
12. lazy loading - 'react-window'
13. Need to export to mp3, rn, exporting to WAV is creating audio files x10 as big as their original
14. Start creating the new song before the current ends on auto play so the user doesnt have to wait for it to render
15. Add tailwindCSS, it should reduce a lot of the duplicate CSS. Or not tailwindCSS but just cleanup the CSS.
16. Videos tab. Just another songList but showing only mp4 files... or maybe just filter on songlist screen?
17. Fix how Spotify songs are saved. Right now its doing extra stuff to get the artist. I should send data somehow of the song data (title, artist, album) to be used when its finished downloading from youtube. Maybe just use a callback?
18. On spotify -> display if song/playlist is already downloaded
19. What quality are the mp4s being downloaded at from youtube
20. Remove the data-testid tags from the production builds: https://github.com/coderas/babel-plugin-jsx-remove-data-test-id
21. Add a cleanup when the app first starts. To see if there were any songs that weren't somehow deleted

999 Easy file/song sharing

#### EFFECTS TO ADD

Filter (Tone.Filter): You can use filters to remove or emphasize certain frequencies in your audio. Tone.js offers various filter types, including lowpass, highpass, bandpass, and more.
const filter = new Tone.Filter(200, 'lowpass').toDestination();

Compressor (Tone.Compressor): Compressors are used to control the dynamic range of audio signals, making loud sounds quieter and quiet sounds louder.
const compressor = new Tone.Compressor(-30, 3).toDestination();

Distortion (Tone.Distortion): Distortion effects add harmonics and alter the timbre of an audio signal. You can control parameters like distortion type and amount.
const distortion = new Tone.Distortion(0.4).toDestination();

Chorus (Tone.Chorus): Chorus effects create a thicker and richer sound by modulating the pitch of the audio signal.
const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
