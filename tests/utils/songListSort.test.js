import {
  sortSongEntries,
  sortedSongsRecord,
} from '../../src/utils/songListSort.js';

describe('songListSort', () => {
  it('sorts by title ascending', () => {
    const entries = [
      ['c', { title: 'Gamma' }],
      ['a', { title: 'Alpha' }],
      ['b', { title: 'Beta' }],
    ];
    const sorted = sortSongEntries(entries, 'title', true);
    expect(sorted.map(([k]) => k)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by duration descending', () => {
    const entries = [
      ['x', { duration: 10 }],
      ['y', { duration: 90 }],
      ['z', { duration: 30 }],
    ];
    const sorted = sortSongEntries(entries, 'duration', false);
    expect(sorted.map(([k]) => k)).toEqual(['y', 'z', 'x']);
  });

  it('sortedSongsRecord preserves key–object mapping order', () => {
    const base = {
      k1: { title: 'Z', duration: 1 },
      k2: { title: 'A', duration: 2 },
    };
    const rec = sortedSongsRecord(base, 'title', true);
    expect(Object.keys(rec)).toEqual(['k2', 'k1']);
  });
});
