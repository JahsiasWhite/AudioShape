import React, { useState, useEffect } from 'react';
import './Searchbar.css';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export function normalizeSearchTerm(rawTerm = '') {
  let searchTerm = rawTerm.toLowerCase().trim();

  // Support both syntaxes: "!kanye" and !"kanye"
  if (searchTerm.startsWith('!"') && searchTerm.endsWith('"')) {
    searchTerm = `"!${searchTerm.slice(2, -1)}"`;
  }

  return searchTerm;
}

export function doesSongMatchSearch(value, searchTerm) {
  /*
   * How this search works (title, artist, and album are always checked):
   *
   * 1) No quotes -> fuzzy text contains
   *    Example: kanye
   *
   * 2) Double quotes -> exact phrase mode
   *    Example: "kanye west" must equal an entire title/artist/album value
   *
   * 3) Double quotes + leading ! -> exclude mode
   *    Example: "!kanye" removes rows where title/artist/album contains "kanye"
   *
   * 4) Single quotes -> REGEX mode (advanced)
   *    Example: 'kanye.*west' matches using RegExp rules
   *    Use this only when you intentionally want regex behavior.
   *
   * Important:
   * - Negation is NOT available in single-quote regex mode.
   * - So '!kanye' is treated as regex text, not "exclude kanye".
   * - Use "!kanye" for exclusion.
   */
  if (searchTerm === '') {
    return true; // Include all entries if no input
  }

  if (searchTerm === '.mp4' || searchTerm === '*.mp4') {
    return value.file.endsWith('.mp4');
  }
  if (searchTerm === '.mp3' || searchTerm === '*.mp3') {
    return value.file.endsWith('.mp3');
  }

  // If the search is enclosed in quotations, make an exact search on the words
  if (searchTerm.startsWith('"') && searchTerm.endsWith('"')) {
    const exactMatch = searchTerm.slice(1, -1); // Extract the exact match value
    const negate = exactMatch.startsWith('!'); // If the search starts with a '!', we negate the search

    const comparisonValue = negate ? exactMatch.slice(1) : exactMatch; // Remove '!' if negated
    const matches = negate
      ? value.title.toLowerCase().includes(comparisonValue) ||
        value.artist.toLowerCase().includes(comparisonValue) ||
        value.album.toLowerCase().includes(comparisonValue)
      : value.title.toLowerCase() === comparisonValue ||
        value.artist.toLowerCase() === comparisonValue ||
        value.album.toLowerCase() === comparisonValue;

    return negate ? !matches : matches; // Negate the result if required
  }

  // Regex with single quotes :)
  if (searchTerm.startsWith("'") && searchTerm.endsWith("'")) {
    const regexPattern = searchTerm.slice(1, -1); // Extract pattern between quotes

    try {
      const regex = new RegExp(regexPattern, 'i'); // Create case-insensitive regex

      return regex.test(value.title) || regex.test(value.artist) || regex.test(value.album);
    } catch (error) {
      console.error('Invalid regex pattern:', regexPattern, error);
      return false; // Gracefully handle invalid regex by returning false
    }
  }

  return (
    value.title.toLowerCase().includes(searchTerm) ||
    value.artist.toLowerCase().includes(searchTerm) ||
    value.album.toLowerCase().includes(searchTerm)
  );
}

function SearchBar({ setFilteredSongs }) {
  const { visibleSongs, currentSongId, currentSong } = useAudioPlayer();

  const filterSongs = (e) => {
    const searchTerm = normalizeSearchTerm(e.target.value);

    let filteredSongs = Object.entries(visibleSongs).filter(([_, value]) =>
      doesSongMatchSearch(value, searchTerm)
    );

    console.log('Filtered songs: ', filteredSongs);
    return Object.fromEntries(filteredSongs);
  };

  return (
    <div className="search-bar">
      <input
        id="outlined-basic"
        variant="outlined"
        label="Search"
        placeholder="Search..."
        onChange={(text) => setFilteredSongs(filterSongs(text))}
      />
    </div>
  );
}

export default SearchBar;
