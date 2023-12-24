import { renderHook, act } from '@testing-library/react';
import { AudioControls } from '../../src/AudioController/AudioControls';

describe('AudioControls', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      AudioControls({ play: jest.fn(), pause: jest.fn() })
    );

    // Destructure the values from the result
    const { isPlaying, volume, isMuted } = result.current;

    // Assertions
    expect(isPlaying).toBe(false);
    expect(volume).toBe(1);
    expect(isMuted).toBe(false);
  });

  it('should play audio when playAudio is called', () => {
    const playMock = jest.fn();
    const { result } = renderHook(() =>
      AudioControls({ play: playMock, pause: jest.fn() })
    );

    // Trigger the playAudio function
    act(() => {
      result.current.playAudio();
    });

    // Assertion
    expect(result.current.isPlaying).toBe(true);
    expect(playMock).toHaveBeenCalled();
  });

  it('should pause audio when pauseAudio is called', () => {
    const pauseMock = jest.fn();
    const { result } = renderHook(() =>
      AudioControls({ play: jest.fn(), pause: pauseMock })
    );

    // Set initial state to playing
    act(() => {
      result.current.setIsPlaying(true);
    });

    // Trigger the pauseAudio function
    act(() => {
      result.current.pauseAudio();
    });

    // Assertion
    expect(result.current.isPlaying).toBe(false);
    expect(pauseMock).toHaveBeenCalled();
  });

  it('should change volume when changeVolume is called', () => {
    const mockCurrentSong = { play: jest.fn(), pause: jest.fn() };
    const { result } = renderHook(() => AudioControls(mockCurrentSong));

    // Trigger the changeVolume function
    act(() => {
      result.current.changeVolume(0.5); // set volume to 50%
    });

    // Assertions
    expect(result.current.volume).toBe(0.5);

    // Assuming currentSong is an object with a volume property
    // Adjust this assertion based on your actual implementation
    expect(mockCurrentSong.volume).toBe(0.5);
  });

  it('should toggle mute and adjust volume accordingly', () => {
    const mockCurrentSong = { play: jest.fn(), pause: jest.fn() };
    const { result } = renderHook(() => AudioControls(mockCurrentSong));

    // Verify initial state
    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(1);

    // Toggle mute
    act(() => {
      result.current.toggleMute();
    });

    // Verify state after muting
    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0);

    // Toggle unmute
    act(() => {
      result.current.toggleMute();
    });

    // Verify state after unmuting
    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(1);
  });
});
