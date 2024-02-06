import { renderHook, act } from '@testing-library/react';
import { PlaylistsManager } from '../../src/AudioController/PlaylistsManager';

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
    once: jest.fn(),
  },
};

describe('PlaylistsManager', () => {
  it('should create a playlist and update playlists state', () => {
    const { result } = renderHook(() => PlaylistsManager());

    // Initial state
    expect(result.current.playlists).toEqual([]);

    // Create a playlist
    const playlistName = 'Test Playlist';
    act(() => {
      result.current.createPlaylist(playlistName);
    });

    // Assertions
    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenCalledWith(
      'CREATE_PLAYLIST',
      playlistName
    );

    // Simulate the callback from the server
    const newPlaylists = ['Playlist 1', 'Playlist 2'];
    act(() => {
      // Assuming 'CREATE_PLAYLIST' is the first and only registered once callback
      window.electron.ipcRenderer.once.mock.calls[0][1](newPlaylists);
    });

    // Verify that playlists state has been updated
    expect(result.current.playlists).toEqual(newPlaylists);
  });
});
