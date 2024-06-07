import React, { useEffect } from 'react';

import './AudioSpectrum.css';

/**
 * SHOUTOUT https://codepen.io/nfj525/pen/rVBaab
 */
var context, src, analyser;

/**
 *
 * @returns
 */
const AudioSpectrum = ({ song, loading }) => {
  useEffect(() => {
    // Create an audio context. Only have to do this once
    if (context === undefined) {
      context = new AudioContext();
      src = context.createMediaElementSource(song);
      analyser = context.createAnalyser();
      src.connect(analyser);
      analyser.connect(context.destination);
      analyser.fftSize = 256;
    }

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

      ctx.fillStyle = 'rgb(13 14 18)'; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height); // (x, y, width, height)

      let lastBarHeights = [];
      const smoothnessFactor = 0.2;

      for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i];
        barHeight *= 4;

        // Calculate the new smoothed bar height
        if (lastBarHeights[i] === undefined) {
          lastBarHeights[i] = 0;
        }

        // TODO: Is this really smoothing anything? It still looks a little choppy
        // Apply smoothing to the current bar height
        // const smoothedBarHeight = (barHeight + lastBarHeights[i]) * 0.5;
        const smoothedBarHeight =
          lastBarHeights[i] * (1 - smoothnessFactor) +
          barHeight * smoothnessFactor;

        // Store the smoothed height as the previous height for the next frame
        lastBarHeights[i] = smoothedBarHeight;

        // TODO: Add option for colors?
        const r = barHeight / 2 + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        // ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillStyle = '#FFFFFF';

        ctx.fillRect(
          x,
          canvas.height - smoothedBarHeight,
          barWidth,
          smoothedBarHeight
        );

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
    <div className={`${loading ? 'hidden' : ''}`} id="canvas-container">
      {/* <div id="content">
        <input type="file" id="thefile" accept="audio/*" />
        <canvas id="canvas"></canvas>
        <audio id="audio" controls></audio>
      </div> */}
    </div>
  );
};

export default AudioSpectrum;
