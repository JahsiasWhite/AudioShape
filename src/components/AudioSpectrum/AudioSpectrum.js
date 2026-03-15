import React, { useEffect } from 'react';

import './AudioSpectrum.css';

/**
 * SHOUTOUT https://codepen.io/nfj525/pen/rVBaab
 *
 * Uses the AnalyserNode that is tapped off the live effects chain in LiveEffectsChain.js.
 * We cannot create a second MediaElementAudioSourceNode from the same <audio> element
 * (the browser throws InvalidStateError), so we share the one created in the live chain.
 */
const AudioSpectrum = ({ song, loading }) => {
  useEffect(() => {
    // The live effects chain stores a shared AnalyserNode on window after the first song plays.
    const analyser = window.__toneEffectsState?.analyser;
    if (!analyser) return; // chain not set up yet (no song played) — bail silently

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

    const computedStyle = getComputedStyle(document.documentElement);
    const colorMain = computedStyle.getPropertyValue('--color-main').trim();
    const colorText = computedStyle.getPropertyValue('--color-text').trim();

    let frameId;
    function renderFrame() {
      frameId = requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      // Create background
      ctx.fillStyle = colorMain;
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

        const smoothedBarHeight =
          lastBarHeights[i] * (1 - smoothnessFactor) +
          barHeight * smoothnessFactor;

        // Store the smoothed height as the previous height for the next frame
        lastBarHeights[i] = smoothedBarHeight;

        ctx.fillStyle = colorText;

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
      cancelAnimationFrame(frameId);
      canvas.remove();
    };
  }, [song]);

  return (
    <div className={`${loading ? 'hidden' : ''}`} id="canvas-container">
    </div>
  );
};

export default AudioSpectrum;
