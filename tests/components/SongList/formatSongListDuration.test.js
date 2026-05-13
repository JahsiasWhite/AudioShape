import { formatSongListDuration } from '../../../src/components/SongList/SongListItems.js';

describe('formatSongListDuration', () => {
  it('formats duration in seconds as m:ss', () => {
    expect(formatSongListDuration(125)).toBe('2:05');
    expect(formatSongListDuration(0)).toBe('0:00');
  });

  it('shows an em dash when duration is missing or non-finite (e.g. bad .ogg tags)', () => {
    expect(formatSongListDuration(undefined)).toBe('—');
    expect(formatSongListDuration(null)).toBe('—');
    expect(formatSongListDuration(NaN)).toBe('—');
  });
});
