<h1 align="center">
  AudioShape
</h1>

<div align="center">

  <h4>
    A music player with built-in audio editing tools
  </h4>

  <p>
      <img src="https://img.shields.io/badge/version-0.2.7-green.svg" alt="version"/>
      <img src="https://img.shields.io/badge/OS-windows-blue?style=flat&labelColor=363D44" alt="Operating systems"/>
      <a href="https://github.com/JahsiasWhite/AudioShape/actions/workflows/tests.yml" alt="tests"><img src="https://github.com/JahsiasWhite/AudioShape/actions/workflows/tests.yml/badge.svg" alt="tests"/></a>
  </p>

</div>

<p align="center">
  <img src="images/edit-screen1.png" alt="main screen" width="650">
</p

### Core Features

- 🎚️ Live audio editing (speed, EQ, effects)
- 🔄 Edits are persistent. No need to reapply when a new song plays
- 💾 Save/Export custom tracks and presets
- 🎥 Built in downloader for YouTube and Spotify
- 🎬 Full-screen mode that supports video formats
- 🎨 Customizable themes

> ⚠️ **Note:** This project is still under active development. Bugs and errors may occur. Feel free to submit a PR or issue on GitHub if you encounter any problems!

## Install

Go to [releases](https://github.com/JahsiasWhite/AudioShape/releases) and download the **`.zip`** of the newest release. Once downloaded, unzip the folder and run the **`.exe`** inside

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
