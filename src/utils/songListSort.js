/**
 * Sort song entries for the All Songs list (title or duration).
 * @param {Array<[string, object]>} entries - Object.entries from filtered songs
 * @param {'title' | 'duration'} sortBy
 * @param {boolean} ascending
 * @returns {Array<[string, object]>}
 */
export function sortSongEntries(entries, sortBy, ascending) {
  const songEntries = [...entries];
  if (sortBy === 'duration') {
    songEntries.sort((a, b) => {
      const aDuration = Number(a[1].duration) || 0;
      const bDuration = Number(b[1].duration) || 0;
      const comparison = aDuration - bDuration;
      return ascending ? comparison : -comparison;
    });
  } else {
    songEntries.sort((a, b) => {
      const aValue = (a[1][sortBy] ?? '').toString();
      const bValue = (b[1][sortBy] ?? '').toString();
      const comparison = aValue.localeCompare(bValue);
      return ascending ? comparison : -comparison;
    });
  }
  return songEntries;
}

/**
 * @param {Record<string, object>} baseSongs
 * @param {'title' | 'duration'} sortBy
 * @param {boolean} ascending
 */
export function sortedSongsRecord(baseSongs, sortBy, ascending) {
  const entries = sortSongEntries(
    Object.entries(baseSongs || {}),
    sortBy,
    ascending,
  );
  return Object.fromEntries(entries);
}
