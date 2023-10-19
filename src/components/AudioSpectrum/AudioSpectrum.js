import React, { useEffect } from 'react';

import './AudioSpectrum.css';

/**
 * SHOUTOUT https://codepen.io/nfj525/pen/rVBaab
 */

/**
 *
 * @returns
 */
const AudioSpectrum = ({ song }) => {
  useEffect(() => {
    // Create an audio context
    // ! TODO To fix this, just add this section to the custom context
    const context = new AudioContext();
    const src = context.createMediaElementSource(song);

    const analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Create a canvas element and get its rendering context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const parent = document.getElementsByClassName('fullscreen-view')[0];
    canvas.width = parent.clientWidth * 0.7;
    canvas.height = parent.clientHeight * 0.5;

    const barWidth = (canvas.width / bufferLength) * 1;
    let x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      console.error(bufferLength);
      for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i];
        barHeight *= 1;

        // TODO: Add option for colors?
        const r = barHeight / 2 + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        // ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillStyle = '#FFFFFF';

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 5;
      }
    }

    renderFrame();

    // Append the canvas to your component
    const container = document.getElementById('canvas-container');
    container.appendChild(canvas);

    return () => {
      // Cleanup audio nodes and context
      // if (context) {
      //   analyser.disconnect();
      //   context.close().catch((e) => {
      //     console.error('Error closing AudioContext:', e);
      //   });
      // }
      // // Remove canvas
      // if (canvas) {
      //   canvas.remove();
      // }
    };
  }, [song]);

  return (
    <div id="canvas-container">
      {/* <div id="content">
        <input type="file" id="thefile" accept="audio/*" />
        <canvas id="canvas"></canvas>
        <audio id="audio" controls></audio>
      </div> */}
    </div>
  );
};

export default AudioSpectrum;
