// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import PlaylistMenu from '../PlaylistMenu/PlaylistMenu';
import Searchbar, { doesSongMatchSearch, normalizeSearchTerm } from './Searchbar';
import SongListItems from './SongListItems';
import RightClickMenu from './RightClickMenu';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import { useAudioPlayer } from '../../AudioController/AudioContext';

const filters = ['Title', 'Duration'];

function SongList({ handleSongEdit }) {
  const {
    visibleSongs,
    currentScreen,
    setCurrentScreen,
    initSongsLoading,
    startSongsLoading,
  } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(visibleSongs);
  const [sortFilterIndex, setSortFilterIndex] = useState(0);
  const [sortAscending, setSortAscending] = useState(false);

  const getFilteredSongs = (songs, rawSearchTerm) => {
    const normalizedSearchTerm = normalizeSearchTerm(rawSearchTerm);
    return Object.fromEntries(
      Object.entries(songs || {}).filter(([_, value]) =>
        doesSongMatchSearch(value, normalizedSearchTerm),
      ),
    );
  };

  /**
   * Once songs are loaded in, we know we are done loading
   */
  useEffect(() => {
    // TODO: Do I need to show loading?
    // if (Object.keys(visibleSongs).length > 0) {
    //   setIsLoading(false);
    // } else {
    //   setIsLoading(true);
    // }
    if (initSongsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    setFilteredSongs(getFilteredSongs(visibleSongs, searchTerm));
  }, [visibleSongs, initSongsLoading, searchTerm]);

  const [playlistMenuIndex, setPlaylistMenuOpen] = useState(-1);

  const closePlaylistMenu = () => {
    // Close the playlist menu
    setPlaylistMenuOpen(-1);
  };

  // Changes what we are filtering by
  // 1. Title 2. Duration
  const changeFilter = () => {
    const nextFilterIndex = (sortFilterIndex + 1) % filters.length;
    setSortFilterIndex(nextFilterIndex);
    const filter = filters[nextFilterIndex];

    console.error(filter);
    sortSongs(filter.toLowerCase());
  };

  // Toggles between showing songs from A-Z to Z-A, etc... depending on filter
  function sortSongs(overrideSortBy) {
    const sortBy = (overrideSortBy ?? filters[sortFilterIndex]).toLowerCase();
    const nextSortAscending = !sortAscending;
    setSortAscending(nextSortAscending);

    // 1. Convert object to an array of key-value pairs
    const songEntries = Object.entries(filteredSongs);

    // 2. Sort the entries based on the song property
    if (sortBy === 'duration') {
      console.error(nextSortAscending);
      songEntries.sort((a, b) => {
        const aDuration = Number(a[1]['duration']) || 0;
        const bDuration = Number(b[1]['duration']) || 0;
        const comparison = aDuration - bDuration;
        return nextSortAscending ? comparison : -comparison;
      });
    } else {
      songEntries.sort((a, b) => {
        const aValue = (a[1][sortBy] ?? '').toString();
        const bValue = (b[1][sortBy] ?? '').toString();
        const comparison = aValue.localeCompare(bValue);
        return nextSortAscending ? comparison : -comparison;
      });
    }
    console.log('Filter: ', sortBy);
    console.log('Filtered logs: ', songEntries);

    // 3. Convert the sorted entries back to an object
    const sortedSongs = Object.fromEntries(songEntries);
    // const sortedSongs = songEntries.reduce((acc, [_, song], index) => {
    //   acc[index] = song;
    //   return acc;
    // }, {});
    console.log('Sorted songs: ', sortedSongs);

    setFilteredSongs(sortedSongs);
  }

  const [clicked, setClicked] = useState({});
  function toggleRightClickMenu(clientX, clientY, songData) {
    setClicked([clientX, clientY, songData]);
  }

  // Use the first song to set the image
  // TODO: Make this better
  let firstKey = filteredSongs ? Object.keys(filteredSongs)[0] : undefined;

  console.error('TEST: ', filteredSongs);

  return (
    <div className="song-list-container">
      <div className="song-list-header">
        {filteredSongs &&
          filteredSongs[firstKey] &&
          filteredSongs[firstKey].albumImage && (
            <img
              className="list-image-header"
              src={filteredSongs[firstKey].albumImage}
              alt={`${filteredSongs[firstKey].album} cover`}
            />
          )}
        {currentScreen}
      </div>
      <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {isLoading && Object.keys(visibleSongs || {}).length === 0 ? (
        <div className="num-songs">
          Loading...{' '}
          {isLoading && <LoadingSpinner className="loading-spinner-sm" />}
        </div>
      ) : !isLoading && Object.keys(visibleSongs || {}).length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection onLoadingStart={startSongsLoading} />
        </div>
      ) : (
        <div>
          <div className="playlist-header-2-container">
            <div className="num-songs">
              {Object.keys(filteredSongs).length} songs
              {isLoading && <LoadingSpinner className="loading-spinner-sm" />}
            </div>
            <div className="right-side">
              <div className="sort">
                <div
                  className="sortByField"
                  onClick={() => {
                    sortSongs();
                  }}
                >
                  Sort by
                </div>
                <div
                  className="sortByFilterField"
                  onClick={() => {
                    changeFilter();
                  }}
                >
                  {filters[sortFilterIndex]}
                </div>
              </div>
              {/* <div className="filter">Filter</div> */}
            </div>
          </div>
          {/* <div className="song-details-header">
            <div>Song</div>
            <div>Album</div>
            <div>Duration</div>
          </div> */}
          <ul className="song-list">
            <SongListItems
              filteredSongs={filteredSongs}
              setFilteredSongs={setFilteredSongs}
              toggleRightClickMenu={toggleRightClickMenu}
              setPlaylistMenuOpen={setPlaylistMenuOpen}
              handleSongEditClick={handleSongEdit}
            />
          </ul>
          <RightClickMenu
            clickData={clicked}
            handleSongEditClick={handleSongEdit}
          />
          {/* Render the PlaylistMenu when playlistMenuIndex has a real index */}
          {playlistMenuIndex != -1 && (
            <PlaylistMenu
              song={visibleSongs[playlistMenuIndex]}
              closePlaylistMenu={closePlaylistMenu}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SongList;
