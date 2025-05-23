import React, { useState, useEffect } from 'react';
import './Searchbar.css';

import { useAudioPlayer } from '../../AudioController/AudioContext';

function SearchBar({ setFilteredSongs }) {
  const { visibleSongs, currentSongId, currentSong } = useAudioPlayer();
  // const [searchTerm, setSearchTerm] = useState('');

  //   const searchInput = (e) => {
  // var lowerCase = e.target.value.toLowerCase();
  var searchTerm = '';

  const filterSongs = (e) => {
    searchTerm += e.target.value.toLowerCase();
    let filteredSongs = Object.entries(visibleSongs).filter(([key, value]) => {
      if (searchTerm === '') {
        return true; // Include all entries if no input
      }

      if (value.duration === undefined) {
        // This is a rare one, but sometimes when downloading songs, their duration isn't set correctly
        // TODO This is only like this while I use duration as a key, once I use actual keys, I can remove this
        return false;
      }

      if (searchTerm === '.mp4') {
        if (visibleSongs[key].file.endsWith('.mp4')) {
          return true;
        } else {
          return false;
        }
      }
      if (searchTerm === '.mp3') {
        if (visibleSongs[key].file.endsWith('.mp3')) {
          return true;
        } else {
          return false;
        }
      }

      // If the search is enclosed in quotations, make an exact search on the words
      if (searchTerm.startsWith('"') && searchTerm.endsWith('"')) {
        const exactMatch = searchTerm.slice(1, -1); // Extract the exact match value
        const negate = exactMatch.startsWith('!'); // If the search starts with a '!', we negate the search

        const comparisonValue = negate ? exactMatch.slice(1) : exactMatch; // Remove '!' if negated
        const matches =
          value.title.toLowerCase() === comparisonValue ||
          value.artist.toLowerCase() === comparisonValue ||
          value.album.toLowerCase() === comparisonValue;

        return negate ? !matches : matches; // Negate the result if required
      }

      // Regex with single quotes :)
      if (searchTerm.startsWith("'") && searchTerm.endsWith("'")) {
        const regexPattern = searchTerm.slice(1, -1); // Extract pattern between quotes

        try {
          const regex = new RegExp(regexPattern, 'i'); // Create case-insensitive regex

          return (
            regex.test(value.title) ||
            regex.test(value.artist) ||
            regex.test(value.album)
          );
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
    });

    console.log('Filtered songs: ', filteredSongs);
    return Object.fromEntries(filteredSongs);
  };

  // useEffect(() => {
  //   setFilteredSongs(filterSongs());
  // }, [searchTerm]);

  //     setFilteredSongs(fs);

  //     // console.error('HMMMM, ', filteredSongs);
  //   };
  //   console.error('DOC: ', document);

  //   return (
  //     <div className="search-bar">
  //       <input
  //         id="outlined-basic"
  //         onChange={searchInput}
  //         variant="outlined"
  //         fullWidth
  //         label="Search"
  //         placeholder="Search..."
  //       />
  //     </div>
  //   );

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     console.error(visibleSongs);
  //     if (Object.keys(visibleSongs).length === 0) return;

  //     if (event.target.tagName.toLowerCase() !== 'input') {
  //       // Ignore input fields
  //       const lowerCase = event.key.toLowerCase();
  //       if (lowerCase === 'backspace') {
  //         // Handle Backspace by removing the last character
  //         setSearchTerm((prevSearchTerm) => prevSearchTerm.slice(0, -1)); // Slice removes last char
  //       } else {
  //         setSearchTerm((prevSearchTerm) => prevSearchTerm + lowerCase);
  //       }

  //       // Call search function and update filtered data (replace with your actual logic)
  //       const filteredSongs = filterSongs();
  //       console.error(filteredSongs);
  //       setFilteredSongs(filteredSongs);
  //     }
  //   };

  //   document.addEventListener('keydown', handleKeyDown); // Add event listener

  //   return () => document.removeEventListener('keydown', handleKeyDown); // Cleanup on unmount
  // }, [visibleSongs]); // Empty dependency array to run effect once

  //   return null; // No visible element for this component
  return (
    <div className="search-bar">
      <input
        id="outlined-basic"
        variant="outlined"
        label="Search"
        placeholder="Search..."
        onChange={(text) => setFilteredSongs(filterSongs(text))}
      />
      {/* <div className="search-term">{searchTerm}</div> */}
    </div>
  );
}

export default SearchBar;
