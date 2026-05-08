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
    const setSearchTerm = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar searchTerm="" setSearchTerm={setSearchTerm} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '!"kanye west"' },
    });

    expect(setSearchTerm).toHaveBeenCalledWith('!"kanye west"');
  });

  it('supports negated quoted exact search with "!" inside quotes', () => {
    const setSearchTerm = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar searchTerm="" setSearchTerm={setSearchTerm} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '"!kanye west"' },
    });

    expect(setSearchTerm).toHaveBeenCalledWith('"!kanye west"');
  });

  it('applies negation after intermediate typing events', () => {
    const setSearchTerm = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar searchTerm="" setSearchTerm={setSearchTerm} />
    );

    const input = getByPlaceholderText('Search...');

    fireEvent.change(input, { target: { value: '!' } });
    fireEvent.change(input, { target: { value: '!"' } });
    fireEvent.change(input, { target: { value: '!"kanye west"' } });

    const lastCall = setSearchTerm.mock.calls[setSearchTerm.mock.calls.length - 1][0];
    expect(lastCall).toBe('!"kanye west"');
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
    const setSearchTerm = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar searchTerm="" setSearchTerm={setSearchTerm} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '!kanye' },
    });

    expect(setSearchTerm).toHaveBeenCalledWith('!kanye');
  });

  it('filters with quoted negation when using partial term', () => {
    const setSearchTerm = jest.fn();
    const { getByPlaceholderText } = render(
      <Searchbar searchTerm="" setSearchTerm={setSearchTerm} />
    );

    fireEvent.change(getByPlaceholderText('Search...'), {
      target: { value: '"!kanye"' },
    });

    expect(setSearchTerm).toHaveBeenCalledWith('"!kanye"');
  });

  it('does not throw when metadata fields are missing', () => {
    const malformedSong = {
      title: null,
      artist: undefined,
      album: undefined,
      file: null,
    };

    expect(() => doesSongMatchSearch(malformedSong, 'kanye')).not.toThrow();
    expect(() => doesSongMatchSearch(malformedSong, 'mp3')).not.toThrow();
  });
});
