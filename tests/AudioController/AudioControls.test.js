import { renderHook, act } from '@testing-library/react';
import { AudioControls } from '../../src/AudioController/AudioControls';

let ipcListeners = {};
window.electron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
    on: jest.fn().mockImplementation((event, callback) => {
      ipcListeners[event] = callback;
      return jest.fn(); // returns remove-listener fn
    }),
  },
};

const simulateIpc = (event, ...args) => {
  if (ipcListeners[event]) ipcListeners[event](...args);
};

const makeSong = () => ({ play: jest.fn(), pause: jest.fn() });

describe('AudioControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ipcListeners = {};
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => AudioControls(makeSong()));
    const { isPlaying, volume, isMuted } = result.current;

    expect(isPlaying).toBe(false);
    expect(volume).toBe(1);
    expect(isMuted).toBe(false);
  });

  it('should request volume from settings on mount', () => {
    renderHook(() => AudioControls(makeSong()));

    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith('GET_VOLUME');
  });

  it('should apply saved volume when RETURN_VOLUME fires', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      simulateIpc('RETURN_VOLUME', 75);
    });

    expect(result.current.volume).toBe(0.75);
    expect(song.volume).toBe(0.75);
  });

  it('should handle saved volume of 100 (full volume)', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      simulateIpc('RETURN_VOLUME', 100);
    });

    expect(result.current.volume).toBe(1);
    expect(song.volume).toBe(1);
  });

  it('should handle saved volume of 0', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      simulateIpc('RETURN_VOLUME', 0);
    });

    expect(result.current.volume).toBe(0);
    expect(song.volume).toBe(0);
  });

  it('should save volume to settings when changeVolume is called', () => {
    const { result } = renderHook(() => AudioControls(makeSong()));

    act(() => {
      result.current.changeVolume(0.5);
    });

    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'SAVE_SETTINGS',
      { volume: 50 }
    );
  });

  it('should not save volume to settings when muting (volume = 0)', () => {
    const { result } = renderHook(() => AudioControls(makeSong()));

    jest.clearAllMocks();

    act(() => {
      result.current.changeVolume(0);
    });

    expect(window.electron.ipcRenderer.sendMessage).not.toHaveBeenCalledWith(
      'SAVE_SETTINGS',
      expect.anything()
    );
  });

  it('should round volume to nearest integer when saving', () => {
    const { result } = renderHook(() => AudioControls(makeSong()));

    act(() => {
      result.current.changeVolume(0.556);
    });

    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'SAVE_SETTINGS',
      { volume: 56 }
    );
  });

  it('should play audio when playAudio is called', () => {
    const currentSong = { duration: 45, play: jest.fn(), pause: jest.fn() };
    const { result } = renderHook(() => AudioControls(currentSong));

    act(() => {
      result.current.playAudio();
    });

    expect(result.current.isPlaying).toBe(true);
    expect(currentSong.play).toHaveBeenCalled();
  });

  it('should not play if the current song is not loaded', () => {
    const song = { play: jest.fn(), pause: jest.fn() };
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      result.current.playAudio();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should pause audio when pauseAudio is called', () => {
    const song = { play: jest.fn(), pause: jest.fn() };
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      result.current.setIsPlaying(true);
    });

    act(() => {
      result.current.pauseAudio();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(song.pause).toHaveBeenCalled();
  });

  it('should change volume when changeVolume is called', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      result.current.changeVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
    expect(song.volume).toBe(0.5);
  });

  it('should toggle mute and adjust volume accordingly', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    act(() => {
      result.current.changeVolume(1);
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(1);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(1);
  });

  it('should restore loaded volume after unmuting', () => {
    const song = makeSong();
    const { result } = renderHook(() => AudioControls(song));

    // Simulate saved volume of 60% loaded on startup
    act(() => {
      simulateIpc('RETURN_VOLUME', 60);
    });

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.volume).toBe(0);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.volume).toBe(0.6);
  });
});
