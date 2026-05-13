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
import { sortedSongsRecord } from '../../utils/songListSort';

const filters = ['Title', 'Duration'];

function SongList({ handleSongEdit }) {
  const {
    visibleSongs,
    currentScreen,
    setCurrentScreen,
    initSongsLoading,
    startSongsLoading,
    syncPlaybackOrder,
    songListSortFilterIndex,
    setSongListSortFilterIndex,
    songListSortAscending,
    setSongListSortAscending,
    songListHasCustomSort,
    setSongListHasCustomSort,
  } = useAudioPlayer();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(visibleSongs);
  const [sortFilterIndex, setSortFilterIndex] = useState(
    () => songListSortFilterIndex ?? 0,
  );
  const [sortAscending, setSortAscending] = useState(
    () => songListSortAscending ?? false,
  );
  const [hasCustomSort, setHasCustomSort] = useState(
    () => songListHasCustomSort ?? false,
  );

  const getFilteredSongs = (songs, rawSearchTerm) => {
    const normalizedSearchTerm = normalizeSearchTerm(rawSearchTerm);
    if (!normalizedSearchTerm) {
      return songs || {};
    }
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
    if (initSongsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    const base = getFilteredSongs(visibleSongs, searchTerm);
    if (!hasCustomSort) {
      setFilteredSongs(base);
      return;
    }
    const sortBy = filters[sortFilterIndex].toLowerCase();
    setFilteredSongs(sortedSongsRecord(base, sortBy, sortAscending));
  }, [
    visibleSongs,
    initSongsLoading,
    searchTerm,
    sortFilterIndex,
    sortAscending,
    hasCustomSort,
  ]);

  useEffect(() => {
    const keys = Object.keys(filteredSongs || {});
    if (keys.length === 0 || !syncPlaybackOrder) {
      return;
    }
    syncPlaybackOrder(keys);
  }, [filteredSongs, syncPlaybackOrder]);

  const [playlistMenuIndex, setPlaylistMenuOpen] = useState(-1);

  const closePlaylistMenu = () => {
    setPlaylistMenuOpen(-1);
  };

  const changeFilter = () => {
    const nextFilterIndex = (sortFilterIndex + 1) % filters.length;
    setSortFilterIndex(nextFilterIndex);
    setSongListSortFilterIndex?.(nextFilterIndex);
    setSortAscending((a) => {
      const n = !a;
      setSongListSortAscending?.(n);
      return n;
    });
    setHasCustomSort(true);
    setSongListHasCustomSort?.(true);
  };

  const [clicked, setClicked] = useState({});
  function toggleRightClickMenu(clientX, clientY, songData) {
    setClicked([clientX, clientY, songData]);
  }

  let firstKey = filteredSongs ? Object.keys(filteredSongs)[0] : undefined;

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
        <div className="song-list-body">
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
                    const next = !sortAscending;
                    setSortAscending(next);
                    setSongListSortAscending?.(next);
                    setHasCustomSort(true);
                    setSongListHasCustomSort?.(true);
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
            </div>
          </div>
          <div className="song-list song-list-virtual-root">
            <SongListItems
              filteredSongs={filteredSongs}
              setFilteredSongs={setFilteredSongs}
              toggleRightClickMenu={toggleRightClickMenu}
              setPlaylistMenuOpen={setPlaylistMenuOpen}
              handleSongEditClick={handleSongEdit}
            />
          </div>
          <RightClickMenu
            clickData={clicked}
            handleSongEditClick={handleSongEdit}
          />
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
