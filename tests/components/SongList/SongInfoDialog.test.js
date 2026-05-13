import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';

import SongInfoDialog from '../../../src/components/SongList/SongInfoDialog';
import { useAudioPlayer } from '../../../src/AudioController/AudioContext';

jest.mock('../../../src/AudioController/AudioContext', () => {
  const actual = jest.requireActual('../../../src/AudioController/AudioContext');
  return {
    ...actual,
    useAudioPlayer: jest.fn(),
  };
});

describe('<SongInfoDialog />', () => {
  const baseSong = {
    id: 'song-1',
    title: 'Song Title',
    artist: 'Song Artist',
    album: 'Song Album',
    file: 'C:\\music\\song.mp3',
    albumImage: 'previous-album-image',
    duration: 125.4,
    container: 'audio',
    codec: 'mp3',
    bitrate: 320000,
    sampleRate: 44100,
    numberOfChannels: 2,
    lossless: false,
    fileSizeBytes: 1048576,
  };

  let sendMessageMock;
  let onceMock;
  let onceCallback;
  let onCloseMock;

  beforeEach(() => {
    onceCallback = undefined;
    sendMessageMock = jest.fn();
    onceMock = jest.fn((channel, cb) => {
      // Capture the handler so the test can simulate the async IPC response.
      onceCallback = cb;
    });
    onCloseMock = jest.fn();

    window.electron = {
      ipcRenderer: {
        on: jest.fn(),
        once: onceMock,
        sendMessage: sendMessageMock,
      },
    };
  });

  function renderDialog({ song = baseSong, currentSongId = 'different' } = {}) {
    useAudioPlayer.mockReturnValue({
      currentSongId,
    });

    return render(<SongInfoDialog song={song} onClose={onCloseMock} />);
  }

  it('renders null when song is null/undefined', () => {
    const { container } = renderDialog({ song: null });
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose on Escape key', () => {
    renderDialog();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the backdrop, but not when clicking inside the panel', () => {
    const { container } = renderDialog();

    const backdrop = container.querySelector('.song-info-backdrop');
    const panel = container.querySelector('.song-info-panel');
    expect(backdrop).not.toBeNull();
    expect(panel).not.toBeNull();

    fireEvent.click(panel);
    expect(onCloseMock).toHaveBeenCalledTimes(0);

    fireEvent.click(backdrop);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renders key formatted rows', () => {
    renderDialog();

    expect(screen.getByText('Song Title')).toBeTruthy();
    expect(screen.getByText('Song Artist')).toBeTruthy();
    expect(screen.getByText('Song Album')).toBeTruthy();

    // formatDurationSeconds(125.4) => 2:05
    expect(screen.getByText('2:05')).toBeTruthy();
    expect(screen.getByText('.mp3')).toBeTruthy();

    // formatBitrate(320000) => 320 kbps
    expect(screen.getByText('320 kbps')).toBeTruthy();

    // formatSampleRate(44100) => 44.1 kHz
    expect(screen.getByText('44.1 kHz')).toBeTruthy();

    expect(screen.getByText('2 (stereo)')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();

    // formatFileSize(1048576) => "1.0 MB"
    expect(screen.getByText('1.0 MB')).toBeTruthy();
  });

  it('lets you enter and exit edit mode for Title', () => {
    renderDialog();

    const editTitleBtn = screen.getByLabelText('Edit Title');
    fireEvent.click(editTitleBtn);

    expect(screen.getByDisplayValue(baseSong.title)).toBeTruthy();
    expect(screen.getByText('Save tags')).toBeTruthy();

    const stopEditingBtn = screen.getByLabelText('Stop editing Title');
    fireEvent.click(stopEditingBtn);

    expect(screen.queryByText('Save tags')).toBeNull();
    expect(screen.getByLabelText('Edit Title')).toBeTruthy();
  });

  it('sends IPC and handles success response by exiting edit mode', async () => {
    renderDialog({ currentSongId: 'not-playing' });

    fireEvent.click(screen.getByLabelText('Edit Title'));
    const titleInput = document.querySelector('#song-info-edit-title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save tags' }));

    expect(onceMock).toHaveBeenCalledWith('UPDATE_SONG_TAGS_RESULT', expect.any(Function));
    expect(sendMessageMock).toHaveBeenCalledWith('UPDATE_SONG_TAGS', {
      filePath: baseSong.file,
      title: 'New Title',
      artist: baseSong.artist,
      album: baseSong.album,
      previousAlbumImage: baseSong.albumImage,
    });

    expect(onceCallback).toBeDefined();

    await act(async () => {
      onceCallback({ success: true });
    });

    await waitFor(() => {
      expect(screen.queryByText('Save tags')).toBeNull();
      expect(screen.getByLabelText('Edit Title')).toBeTruthy();
    });
  });

  it('shows IPC error message when tag save fails', async () => {
    renderDialog({ currentSongId: 'not-playing' });

    fireEvent.click(screen.getByLabelText('Edit Title'));
    const titleInput = document.querySelector('#song-info-edit-title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save tags' }));

    await act(async () => {
      onceCallback({ success: false, error: 'bad things' });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('bad things');
    });
  });
});

