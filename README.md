# Music Player

! Warning, this is currently in beta version 0.2. Errors and glitches likely to occur !

Traditional music player with additional customizations and song editing.

The most exciting feature is the song editing! Seamlessly edit the song you are listening to and keep the settings saved for all future songs. For example, are you a big fan of listening to sped up songs? Simply use the preset (or create your own preset) to have the currently plaing song become its sped-up version. If you're just listening to your playlist, the next song will also be sped up! Like how the song sounds? Export it to keep it saved forever.

Don't have any local songs? No problem! Music Player also includes the ability to download songs directly from Youtube by providing the song's url.
<br>SOON: Have a Spotify account? Download your songs or playlists or even stream directly from your account!

Music Player also has an extensive full-screen mode. Sit back and watch the audio spectrum of the current song. Listening to an MP4? Full-screen mode even lets you watch the video along with it!

WIP

Lots to fix up

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

999 Easy file/song sharing

BUGS:

1.  Playlists with 0 songs show all songs
2.  Can't enter fullscreen multiple times

## Launching

npm run all
