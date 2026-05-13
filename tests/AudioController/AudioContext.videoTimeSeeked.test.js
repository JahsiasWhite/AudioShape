import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

/** Filled in before each render so `AudioObject` returns a stable mock element. */
const mockAudioState = { el: null };

jest.mock('../../src/AudioController/AudioObject', () => ({
  AudioObject: () => ({ currentSong: mockAudioState.el }),
}));

import { AudioProvider, useAudioPlayer } from '../../src/AudioController/AudioContext';

function createMockAudioElement() {
  const listeners = {};
  const el = {
    currentTime: 0,
    volume: 1,
    paused: true,
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    src: '',
    duration: NaN,
    playbackRate: 1,
    defaultPlaybackRate: 1,
    addEventListener: jest.fn((type, handler) => {
      (listeners[type] = listeners[type] || []).push(handler);
    }),
    removeEventListener: jest.fn((type, handler) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((h) => h !== handler);
    }),
    __emitSeeked() {
      (listeners.seeked || []).forEach((h) => h());
    },
    __seekedListenerCount() {
      return (listeners.seeked || []).length;
    },
  };
  mockAudioState.el = el;
  return el;
}

function VideoTimeProbe() {
  const { videoTime } = useAudioPlayer();
  return <span data-testid="fullscreen-video-time">{String(videoTime)}</span>;
}

describe('AudioProvider videoTime + audio seek', () => {
  beforeAll(() => {
    window.electron = {
      ipcRenderer: {
        on: jest.fn(() => jest.fn()),
        once: jest.fn(),
        sendMessage: jest.fn(),
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createMockAudioElement();
  });

  it('registers seeked on the audio element and updates videoTime when seek completes', async () => {
    render(
      <AudioProvider>
        <VideoTimeProbe />
      </AudioProvider>,
    );

    const audio = mockAudioState.el;
    expect(audio.__seekedListenerCount()).toBeGreaterThanOrEqual(1);

    expect(screen.getByTestId('fullscreen-video-time').textContent).toBe('0');

    audio.currentTime = 88;
    audio.__emitSeeked();

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-video-time').textContent).toBe('88');
    });
  });
});
