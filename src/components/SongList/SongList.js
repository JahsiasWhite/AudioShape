// react-app/src/components/Playbar.js
import React, { useState, useEffect } from 'react';
import './songList.css';

import FolderSelection from '../FolderSelection/FolderSelection';
import PlaylistMenu from '../PlaylistMenu/PlaylistMenu';
import Searchbar from './Searchbar';
import SongListItems from './SongListItems';
import RightClickMenu from './RightClickMenu';

import { useAudioPlayer } from '../../AudioController/AudioContext';

let sortToggle = false;

const filters = ['Title', 'Duration'];
var index = 0;

function SongList({ handleSongEdit }) {
  const { visibleSongs, currentScreen, setCurrentScreen } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Once songs are loaded in, we know we are done loading
   */
  useEffect(() => {
    // TODO: Do I need to show loading?
    if (Object.keys(visibleSongs).length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    setFilteredSongs(visibleSongs);
  }, [visibleSongs]);

  const [playlistMenuIndex, setPlaylistMenuOpen] = useState(-1);

  const closePlaylistMenu = () => {
    // Close the playlist menu
    setPlaylistMenuOpen(-1);
  };

  const changeFilter = () => {
    index = (index + 1) % filters.length;
    const filter = filters[index % filters.length];

    console.error(filter);
    sortSongs(filter.toLowerCase());
  };

  function sortSongs() {
    const sortBy = filters[index % filters.length].toLowerCase();

    sortToggle = !sortToggle;

    // 1. Convert object to an array of key-value pairs
    const songEntries = Object.entries(filteredSongs);

    // 2. Sort the entries based on the song property
    if (sortBy === 'duration') {
      console.error(sortToggle);
      songEntries.sort((a, b) => {
        const comparison = sortToggle
          ? a[1]['duration'] > b[1]['duration']
          : a[1]['duration'] < b[1]['duration'];

        return comparison ? 1 : -1;
      });
    } else {
      songEntries.sort((a, b) => {
        const comparison = a[1][sortBy].localeCompare(b[1][sortBy]);
        return sortToggle ? comparison : -comparison;
      });
    }
    console.error(sortBy, songEntries);

    // 3. Convert the sorted entries back to an object
    const sortedSongs = Object.fromEntries(songEntries);

    setFilteredSongs(sortedSongs);
  }

  const [filteredSongs, setFilteredSongs] = useState(visibleSongs);

  const [clicked, setClicked] = useState({});
  function toggleRightClickMenu(clientX, clientY, songData) {
    setClicked([clientX, clientY, songData]);
  }

  return (
    <div className="song-list-container">
      <div className="song-list-header">{currentScreen}</div>
      <Searchbar setFilteredSongs={setFilteredSongs} />
      {isLoading ? (
        <p>Loading...</p>
      ) : visibleSongs.length === 0 ? (
        <div className="empty-message">
          <p>No songs found! Make sure the file path is correct, or reset it</p>
          <FolderSelection />
        </div>
      ) : (
        <div>
          <div className="playlist-header-2-container">
            <div className="num-songs">
              {Object.keys(filteredSongs).length} songs
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
                  {filters[index]}
                </div>
              </div>
              {/* <div className="filter">Filter</div> */}
            </div>
          </div>
          <ul className="song-list">
            <SongListItems
              filteredSongs={filteredSongs}
              setFilteredSongs={setFilteredSongs}
              toggleRightClickMenu={toggleRightClickMenu}
              setPlaylistMenuOpen={setPlaylistMenuOpen}
            />
          </ul>
          <RightClickMenu clickData={clicked} />
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
