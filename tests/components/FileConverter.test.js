import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import FileConverter from '../../src/components/FileConverter/FileConverter';

const mockAddSong = jest.fn();

jest.mock('../../src/AudioController/AudioContext', () => ({
  useAudioPlayer: () => ({
    addSong: mockAddSong,
  }),
}));

describe('<FileConverter />', () => {
  beforeEach(() => {
    mockAddSong.mockClear();

    window.electron = {
      ipcRenderer: {
        invoke: jest.fn((channel) => {
          if (channel === 'SELECT_CONVERTER_INPUT') {
            return Promise.resolve(['C:\\Music\\source.wav']);
          }

          if (channel === 'CONVERT_SONG_FILE') {
            return Promise.resolve({
              success: true,
              outputPath: 'C:\\Music\\source-converted.mp3',
              song: {
                id: 'C:\\Music\\source-converted.mp3',
                file: 'C:\\Music\\source-converted.mp3',
                title: 'source-converted',
                artist: 'Unknown Artist',
                album: 'Unknown Album',
                albumImage: 'data:image/jpeg;base64,cover',
              },
            });
          }

          return Promise.resolve(null);
        }),
      },
    };
  });

  it('adds the converted song to the song list after a successful conversion', async () => {
    const { getByRole, getByText } = render(<FileConverter />);

    fireEvent.click(getByRole('button', { name: /Browse/i }));

    await waitFor(() => {
      expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        'SELECT_CONVERTER_INPUT',
      );
    });

    fireEvent.click(getByRole('button', { name: /^Convert$/i }));

    await waitFor(() => {
      expect(mockAddSong).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'C:\\Music\\source-converted.mp3',
          file: 'C:\\Music\\source-converted.mp3',
          albumImage: 'data:image/jpeg;base64,cover',
        }),
      );
    });

    expect(getByText(/Converted to MP3/i)).toBeDefined();
  });
});
