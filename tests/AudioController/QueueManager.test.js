import { renderHook, act } from '@testing-library/react';
import { QueueManager } from '../../src/AudioController/QueueManager';

describe('QueueManager', () => {
  it('should handle song selection and update current song state', () => {
    const mockCurrentSong = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(mockCurrentSong, mockVisibleSongs)
    );

    // Trigger a song selection
    act(() => {
      result.current.handleSongSelect('song2');
    });

    // Assertions
    expect(result.current.currentSongId).toBe('song2');
    expect(result.current.currentSongIndex).toBe(1); // Assuming 'song2' is at index 1 in mockVisibleSongs
  });

  it('should add a song to the queue', () => {
    const { result } = renderHook(() => QueueManager(null, null));

    // Trigger adding a song to the queue
    act(() => {
      result.current.addToQueue('song1');
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song1']);
  });

  it('should add multiple songs to the queue', () => {
    const { result } = renderHook(() => QueueManager(null, null));

    // Trigger adding a song to the queue
    act(() => {
      result.current.addToQueue('song1');
      result.current.addToQueue('song2');
      result.current.addToQueue('song3');
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song1', 'song2', 'song3']);
  });

  it('should remove song from the queue and update queue state', () => {
    const { result } = renderHook(() => QueueManager(null, null));

    // Set initial queue
    act(() => {
      result.current.addToQueue('song1');
      result.current.addToQueue('song2');
      result.current.addToQueue('song3');
    });

    // Trigger removing a song from the queue
    act(() => {
      result.current.removeFromQueue(1); // Remove 'song2'
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song1', 'song3']);
  });

  it('should rearrange the queue and update queue state', () => {
    const { result } = renderHook(() => QueueManager(null, null));

    // Set initial queue
    act(() => {
      result.current.addToQueue('song1');
      result.current.addToQueue('song2');
      result.current.addToQueue('song3');
    });

    // Trigger rearranging the queue (moving 'song2' to the beginning)
    act(() => {
      result.current.rearrangeQueue(1, 0);
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song2', 'song1', 'song3']);
  });

  it('should play the next song and update state', () => {
    const mockCurrentSong = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(mockCurrentSong, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song1');
      result.current.addToQueue('song2');
      result.current.addToQueue('song3');
    });

    // Trigger playing the next song
    act(() => {
      result.current.playNextSong();
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song2', 'song3']);
    expect(result.current.currentSongId).toBe('song2');
    expect(result.current.currentSongIndex).toBe(1); // Assuming 'song2' is at index 1 in mockVisibleSongs
  });

  it('should play the next song when there is no queue', () => {
    const mockCurrentSong = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(mockCurrentSong, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song1');
    });

    // Trigger playing the next song
    act(() => {
      result.current.playNextSong();
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song2']);
    expect(result.current.currentSongId).toBe('song2');
    expect(result.current.currentSongIndex).toBe(1); // Assuming 'song2' is at index 1 in mockVisibleSongs
  });

  it('should play the next song when there is no current song', () => {
    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(undefined, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song1');
    });

    // Trigger playing the next song
    act(() => {
      result.current.playNextSong();
    });

    // Assertions
    // expect(result.current.songQueue).toEqual(['song2', 'song3']);
    expect(result.current.currentSongId).toBe('song2');
    expect(result.current.currentSongIndex).toBe(1); // Assuming 'song2' is at index 1 in mockVisibleSongs
  });

  it('should play the previous song and update state', () => {
    const mockCurrentSong = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(mockCurrentSong, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song2');
    });

    // Trigger playing the previous song by simulating events/actions
    act(() => {
      result.current.playPreviousSong();
    });

    // Assertions
    // expect(result.current.songQueue).toEqual(['song1', 'song2', 'song3']); // No changes to the queue
    expect(result.current.currentSongId).toBe('song1'); // 'song1' should be the previous song
    expect(result.current.currentSongIndex).toBe(0); // 'song1' index in mockVisibleSongs
  });

  it('should play the previous song when there is no current song and update state', () => {
    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(undefined, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song2');
    });

    // Trigger playing the next song
    act(() => {
      result.current.playPreviousSong();
    });

    // Assertions
    // expect(result.current.songQueue).toEqual(['song2', 'song3']);
    expect(result.current.currentSongId).toBe('song1');
    expect(result.current.currentSongIndex).toBe(0);
  });

  it('should play the next song when the current song ends', () => {
    const mockCurrentSong = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    const mockVisibleSongs = {
      song1: { id: 'song1', title: 'Song 1' },
      song2: { id: 'song2', title: 'Song 2' },
      song3: { id: 'song3', title: 'Song 3' },
    };

    const { result } = renderHook(() =>
      QueueManager(mockCurrentSong, mockVisibleSongs)
    );

    // Set initial state
    act(() => {
      result.current.handleSongSelect('song1');
      result.current.addToQueue('song2');
      result.current.addToQueue('song3');
    });

    // Simulate the ended event by triggering onSongEnded
    act(() => {
      result.current.onSongEnded();
    });

    // Assertions
    expect(result.current.songQueue).toEqual(['song2', 'song3']);
    expect(result.current.currentSongId).toBe('song2');
    expect(result.current.currentSongIndex).toBe(1); // Assuming 'song2' is at index 1 in mockVisibleSongs
  });
});
