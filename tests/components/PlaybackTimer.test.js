import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the audio context hook
jest.mock('../../src/AudioController/AudioContext', () => ({
  useAudioPlayer: jest.fn(),
}));

import { useAudioPlayer } from '../../src/AudioController/AudioContext';
import PlaybackTimer from '../../src/components/Playbar/PlaybackTimer/PlaybackTimer';

const makeMockSong = (currentTime = 0, duration = 180) => ({
  currentTime,
  duration,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

describe('PlaybackTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes currentTime from currentSong.currentTime, not 0', () => {
    const mockSong = makeMockSong(90, 180); // paused at 1:30
    useAudioPlayer.mockReturnValue({
      currentSong: mockSong,
      changeVideoTime: jest.fn(),
    });

    render(<PlaybackTimer />);

    // The range input value should reflect the actual currentTime (90), not 0
    expect(screen.getByRole('slider').value).toBe('90');
  });

  it('shows 0 when currentTime is 0', () => {
    const mockSong = makeMockSong(0, 180);
    useAudioPlayer.mockReturnValue({
      currentSong: mockSong,
      changeVideoTime: jest.fn(),
    });

    render(<PlaybackTimer />);

    expect(screen.getByRole('slider').value).toBe('0');
  });

  it('preserves playback position after remount (fullscreen toggle while paused)', () => {
    const mockSong = makeMockSong(65, 200); // paused at 1:05
    useAudioPlayer.mockReturnValue({
      currentSong: mockSong,
      changeVideoTime: jest.fn(),
    });

    const { unmount } = render(<PlaybackTimer />);
    expect(screen.getByRole('slider').value).toBe('65');

    // Simulate fullscreen toggle: unmount then remount (no timeupdate fires while paused)
    unmount();
    render(<PlaybackTimer />);

    // After remount, position should still reflect the paused position, not reset to 0
    expect(screen.getByRole('slider').value).toBe('65');
  });
});
