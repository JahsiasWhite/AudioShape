import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RightClickMenu from '../../../src/components/SongList/RightClickMenu.js';
import AudioContext, {
  AudioProvider,
} from '../../../src/AudioController/AudioContext';

// Mock data and functions
const mockSetCurrentScreen = jest.fn();
jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    setCurrentScreen: mockSetCurrentScreen,
    handleSongSelect: jest.fn(),
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
  },
};

describe('<RightClickMenu />', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders RightClickMenu correctly', () => {
    const { container } = render(
      <AudioProvider>
        <RightClickMenu clickData={[]} handleSongEditClick={jest.fn()} />
      </AudioProvider>
    );

    expect(container).toBeDefined();
  });

  it('handles song edit click correctly', () => {
    const mockHandleSongEditClick = jest.fn();
    const songId = 'test-song-id';
    const clickPosition = [100, 100, { id: songId }];

    const { getByText } = render(
      <AudioProvider>
        <RightClickMenu
          clickData={clickPosition}
          handleSongEditClick={mockHandleSongEditClick}
        />
      </AudioProvider>
    );

    // Find and click the edit button in the context menu
    const editButton = getByText('Edit');
    fireEvent.click(editButton);

    // Check if handleSongEditClick was called with the correct song ID
    expect(mockHandleSongEditClick).toHaveBeenCalledWith(songId);
  });

  it('does not show context menu when clickData is empty', () => {
    const { container } = render(
      <AudioProvider>
        <RightClickMenu clickData={[]} handleSongEditClick={jest.fn()} />
      </AudioProvider>
    );

    // Context menu should not be present
    expect(container.firstChild).toBeNull();
  });

  it('shows context menu when valid clickData is provided', () => {
    const clickPosition = [100, 100, { id: 'test-song-id' }];

    const { container } = render(
      <AudioProvider>
        <RightClickMenu
          clickData={clickPosition}
          handleSongEditClick={jest.fn()}
        />
      </AudioProvider>
    );

    // Context menu should be present
    expect(container.firstChild).not.toBeNull();
  });
});
