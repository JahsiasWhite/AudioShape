import { renderHook, act } from '@testing-library/react';
import { DownloadManager } from '../../src/AudioController/DownloadManager';

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
  },
};

const currentSongMock = {
  src: 'sample-file',
};

describe('DownloadManager', () => {
  it('should handle song export and download audio', async () => {
    // Mock getCurrentAudioBuffer function
    const testObj = {
      length: 10,
      src: 'sample-file',
    };
    const getCurrentAudioBufferMock = jest.fn().mockResolvedValue({
      getChannelData: jest.fn(() => {
        return testObj;
      }),
      numberOfChannels: 2,
      sampleRate: 44100,
    });

    // Mock finishLoading, initCurrentSong, and downloadAudio functions
    const finishLoadingMock = jest.fn();
    const initCurrentSongMock = jest.fn();

    // Render the hook with the provided mock functions
    const { result } = renderHook(() =>
      DownloadManager(
        currentSongMock,
        finishLoadingMock,
        initCurrentSongMock,
        getCurrentAudioBufferMock
      )
    );

    // Act: Call handleSongExport
    await act(async () => {
      await result.current.handleSongExport();
    });

    // Assert: Ensure that ipcRenderer.sendMessage has been called with the expected arguments
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'SAVE_SONG',
      expect.any(Uint8Array)
    );
  });

  it('should handle temp song saved', async () => {
    // Mock finishLoading, initCurrentSong, and getCurrentAudioBuffer functions
    const finishLoadingMock = jest.fn();
    const initCurrentSongMock = jest.fn();
    const getCurrentAudioBufferMock = jest.fn().mockResolvedValue({
      getChannelData: jest.fn(),
      numberOfChannels: 2,
      sampleRate: 44100,
    });

    // Render the hook with the provided mock functions
    const { result } = renderHook(() =>
      DownloadManager(
        currentSongMock,
        finishLoadingMock,
        initCurrentSongMock,
        getCurrentAudioBufferMock
      )
    );

    // Act: Call handleTempSongSaved
    await act(async () => {
      await result.current.handleTempSongSaved('output-path', 0, 0);
    });

    // Assert: Ensure that ipcRenderer.sendMessage has been called with the expected arguments
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'DELETE_TEMP_SONG'
    );
  });

  it('should download audio', async () => {
    // Mock finishLoading, initCurrentSong, and getCurrentAudioBuffer functions
    const finishLoadingMock = jest.fn();
    const initCurrentSongMock = jest.fn();
    const testObj = {
      length: 10,
      src: 'sample-file',
    };
    const getCurrentAudioBufferMock = jest.fn().mockResolvedValue({
      getChannelData: jest.fn(() => {
        return testObj;
      }),
      numberOfChannels: 2,
      sampleRate: 44100,
    });

    // Render the hook with the provided mock functions
    const { result } = renderHook(() =>
      DownloadManager(
        currentSongMock,
        finishLoadingMock,
        initCurrentSongMock,
        getCurrentAudioBufferMock
      )
    );

    // Act: Call handleTempSongSaved
    await act(async () => {
      await result.current.downloadAudio(
        await getCurrentAudioBufferMock(currentSongMock.src)
      );
    });

    // Assert: Ensure that ipcRenderer.sendMessage has been called with the expected arguments
    // expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
    //   'SAVE_TEMP_SONG'
    // );
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'SAVE_TEMP_SONG',
      // expect.arrayContaining([expect.anything()]) // Contains at least one element
      expect.anything()
    );
  });
});
