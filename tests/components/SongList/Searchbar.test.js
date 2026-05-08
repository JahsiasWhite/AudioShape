import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Searchbar, {
  normalizeSearchTerm,
  doesSongMatchSearch,
} from '../../../src/components/SongList/Searchbar';

const songs = {
  1: {
    title: 'Stronger',
    artist: 'Kanye West',
    album: 'Graduation',
    file: 'stronger.mp3',
  },
  2: {
    title: 'N95',
    artist: 'Kendrick Lamar',
    album: 'Mr. Morale & The Big Steppers',
    file: 'n95.mp3',
  },
  3: {
    title: 'Heartless',
    artist: 'Kanye West',
    album: '808s & Heartbreak',
    file: 'heartless.mp4',
  },
};

jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    visibleSongs: songs,
    currentSongId: null,
    currentSong: null,
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

describe('Searchbar', () => {
  it('normalizes !"..."" syntax to quoted negation syntax', () => {
    expect(normalizeSearchTerm('!"kanye west"')).toBe('"!kanye west"');
    expect(normalizeSearchTerm('"!kanye west"')).toBe('"!kanye west"');
  });

  it('matches negated exact quoted searches', () => {
    expect(doesSongMatchSearch(songs[1], '"!kanye west"')).toBe(false);
    expect(doesSongMatchSearch(songs[2], '"!kanye west"')).toBe(true);
  });

  it('matches negated quoted partial searches', () => {
    expect(doesSongMatchSearch(songs[1], '"!kanye"')).toBe(false);
    expect(doesSongMatchSearch(songs[3], '"!kanye"')).toBe(false);
    expect(doesSongMatchSearch(songs[2], '"!kanye"')).toBe(true);
  });

  it('treats !term without quotes as normal fuzzy text', () => {
    expect(doesSongMatchSearch(songs[1], '!kanye')).toBe(false);
    expect(doesSongMatchSearch(songs[2], '!kanye')).toBe(false);
  });

  it('supports negated quoted exact search with "!" syntax first', () => {
    const setFilteredSongs = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar setFilteredSongs={setFilteredSongs} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '!"kanye west"' },
    });

    const filtered = setFilteredSongs.mock.calls[0][0];
    expect(Object.values(filtered)).toHaveLength(1);
    expect(Object.values(filtered)[0].artist).toBe('Kendrick Lamar');
  });

  it('supports negated quoted exact search with "!" inside quotes', () => {
    const setFilteredSongs = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar setFilteredSongs={setFilteredSongs} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '"!kanye west"' },
    });

    const filtered = setFilteredSongs.mock.calls[0][0];
    expect(Object.values(filtered)).toHaveLength(1);
    expect(Object.values(filtered)[0].artist).toBe('Kendrick Lamar');
  });

  it('applies negation after intermediate typing events', () => {
    const setFilteredSongs = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar setFilteredSongs={setFilteredSongs} />
    );

    const input = getByPlaceholderText('Search...');

    fireEvent.change(input, { target: { value: '!' } });
    fireEvent.change(input, { target: { value: '!"' } });
    fireEvent.change(input, { target: { value: '!"kanye west"' } });

    const lastCall = setFilteredSongs.mock.calls[setFilteredSongs.mock.calls.length - 1][0];
    expect(Object.values(lastCall)).toHaveLength(1);
    expect(Object.values(lastCall)[0].artist).toBe('Kendrick Lamar');
  });

  it('filters by file extension (.ext, *.ext, ext, or *ext)', () => {
    expect(doesSongMatchSearch(songs[1], '.mp3')).toBe(true);
    expect(doesSongMatchSearch(songs[1], '*.mp3')).toBe(true);
    expect(doesSongMatchSearch(songs[1], 'mp3')).toBe(true);
    expect(doesSongMatchSearch(songs[1], '*mp3')).toBe(true);
    expect(doesSongMatchSearch(songs[3], 'mp3')).toBe(false); // heartless.mp4
    expect(doesSongMatchSearch(songs[1], '.mp4')).toBe(false);
  });

  it('uses fuzzy match for multi-token queries instead of treating them as extensions', () => {
    const wavButTitleMp3 = {
      title: 'Best mp3 ever',
      artist: 'Someone',
      album: 'album',
      file: 'song.wav',
    };
    expect(doesSongMatchSearch(wavButTitleMp3, 'mp3')).toBe(false); // extension mode: .wav
    expect(doesSongMatchSearch(wavButTitleMp3, 'best mp3')).toBe(true); // fuzzy on title
  });

  it('does not treat !term as negation without quotes', () => {
    const setFilteredSongs = jest.fn();
    const { getByPlaceholderText } = render(<Searchbar setFilteredSongs={setFilteredSongs} />);

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '!kanye' },
    });

    const filtered = setFilteredSongs.mock.calls[0][0];
    expect(Object.values(filtered)).toHaveLength(0);
  });

  it('filters with quoted negation when using partial term', () => {
    const setFilteredSongs = jest.fn();
    const { getByPlaceholderText } = render(<Searchbar setFilteredSongs={setFilteredSongs} />);

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '"!kanye"' },
    });

    const filtered = setFilteredSongs.mock.calls[0][0];
    expect(Object.values(filtered)).toHaveLength(1);
    expect(Object.values(filtered)[0].artist).toBe('Kendrick Lamar');
  });
});
