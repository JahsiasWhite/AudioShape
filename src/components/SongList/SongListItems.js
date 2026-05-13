/**
 * The body of the song list. The actual list of songs :|
 */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';
import { List, useListRef } from 'react-window';

import PlusButtonSVG from './add-svgrepo-com.svg';
import MixerSVG from '../LayoutBar/MixerButton/mixer.svg';

import { useAudioPlayer } from '../../AudioController/AudioContext';

export const thumbnailCache = {};

if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

function formatDuration(decimalDuration) {
  if (!Number.isFinite(decimalDuration)) return '—';
  const minutes = Math.floor(decimalDuration);
  const seconds = Math.round((decimalDuration - minutes) * 60);
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${formattedSeconds}`;
}

/** Seconds from song metadata; list column uses the same mm:ss style as before. */
export function formatSongListDuration(durationSeconds) {
  if (durationSeconds == null || !Number.isFinite(Number(durationSeconds))) {
    return '—';
  }
  return formatDuration(Number(durationSeconds) / 60);
}

function readSongRowHeightPx() {
  if (typeof document === 'undefined') return 72;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--row-image-size',
  );
  const imagePx = parseInt(raw, 10);
  const base = Number.isFinite(imagePx) ? imagePx : 50;
  return Math.max(base + 16, 64);
}

const extractThumbnail = (videoSrc) => {
  if (thumbnailCache[videoSrc]) {
    return Promise.resolve(thumbnailCache[videoSrc]);
  }
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const cleanup = (dataUrl) => {
      video.src = '';
      resolve(dataUrl);
    };

    video.addEventListener(
      'seeked',
      () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        thumbnailCache[videoSrc] = dataUrl;
        cleanup(dataUrl);
      },
      { once: true },
    );

    video.addEventListener(
      'loadedmetadata',
      () => {
        video.currentTime = Math.min(1, video.duration || 1);
      },
      { once: true },
    );

    video.addEventListener('error', () => cleanup(null), { once: true });

    video.preload = 'metadata';
    video.src = videoSrc;
  });
};

const SongListRow = memo(function SongListRow({
  ariaAttributes,
  index,
  style,
  orderedKeys,
  filteredSongs,
  visibleSongs,
  loadingQueue,
  currentSongId,
  toggleRightClickMenu,
  setPlaylistMenuOpen,
  handleSongEditClick,
  handleSongSelect,
  setCurrentScreen,
  goToArtistScreen,
  goToAlbumScreen,
}) {
  const rowKey = orderedKeys[index];
  const song =
    rowKey != null ? visibleSongs[rowKey] || filteredSongs[rowKey] : null;

  const [thumbUrl, setThumbUrl] = useState(null);

  useEffect(() => {
    if (!song || !song.isVideo || song.albumImage) {
      setThumbUrl(null);
      return;
    }
    const file = song.file;
    if (thumbnailCache[file]) {
      setThumbUrl(thumbnailCache[file]);
      return;
    }
    let cancelled = false;
    extractThumbnail(file).then((url) => {
      if (!cancelled && url) setThumbUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [song]);

  if (!song) return null;

  const handleContextMenu = (event) => {
    event.preventDefault();
    toggleRightClickMenu(event.clientX, event.clientY, song);
  };

  return (
    <div
      className={`song ${loadingQueue.length > 0 ? 'unclickable' : ''}`}
      style={style}
      id={song.id}
    >
      <li
        {...ariaAttributes}
        onDoubleClick={() => handleSongSelect(song.id)}
        onClick={() => {
          toggleRightClickMenu(false);
        }}
        onContextMenu={handleContextMenu}
        className={`list-item ${
          currentSongId === song.id ? 'highlighted' : ''
        }`}
      >
        {!filteredSongs[rowKey].albumImage ? (
          filteredSongs[rowKey].isVideo && thumbUrl ? (
            <img
              className="list-image"
              src={thumbUrl}
              alt={`${filteredSongs[rowKey].album} cover`}
            />
          ) : (
            <></>
          )
        ) : (
          <img
            className="list-image"
            src={filteredSongs[rowKey].albumImage}
            alt={`${filteredSongs[rowKey].album} cover`}
          />
        )}
        <div className="song-details">
          <div
            className={`song-title ${
              currentSongId === song.id ? '' : 'header-color'
            }`}
          >
            {song.title}
          </div>
          <div>
            <span
              role="presentation"
              onClick={() => goToArtistScreen(rowKey)}
            >
              {song.artist}
            </span>
          </div>
          <div>
            <span
              role="presentation"
              onClick={() => goToAlbumScreen(rowKey)}
            >
              {song.album}
            </span>
          </div>
        </div>
        <div className="song-duration">
          {formatSongListDuration(song.duration)}
        </div>
        <div className="right-side">
          <img
            className="plus-sign"
            data-testid="plus-sign"
            src={PlusButtonSVG}
            alt=""
            onClick={() => setPlaylistMenuOpen(song.id)}
          />
          <img
            className="dropdown-button"
            data-testid="dropdown-button"
            src={MixerSVG}
            alt=""
            onClick={() => {
              handleSongEditClick(song.id);
              setCurrentScreen('mixer');
            }}
          />
        </div>
      </li>
    </div>
  );
});

export default function SongListItems({
  filteredSongs,
  setFilteredSongs,
  toggleRightClickMenu,
  setPlaylistMenuOpen,
  handleSongEditClick,
}) {
  const {
    handleSongSelect,
    visibleSongs,
    currentSongId,
    loadingQueue,
    loadedSongs,
    setVisibleSongs,
    setCurrentScreen,
    songListScrollToCurrentToken,
  } = useAudioPlayer();

  const listRef = useListRef();

  const orderedKeys = useMemo(
    () => Object.keys(filteredSongs ?? {}),
    [filteredSongs],
  );

  const goToArtistScreen = useCallback(
    (key) => {
      const songsByArtist = {};
      const artist = loadedSongs[key].artist;

      Object.keys(loadedSongs).forEach((id) => {
        const song = loadedSongs[id];
        if (artist !== song.artist) return;
        songsByArtist[id] = song;
      });

      setVisibleSongs(songsByArtist);
      setCurrentScreen(artist);
      setFilteredSongs(songsByArtist);
    },
    [loadedSongs, setFilteredSongs, setVisibleSongs, setCurrentScreen],
  );

  const goToAlbumScreen = useCallback(
    (key) => {
      const songsByAlbum = {};
      const album = loadedSongs[key].album;

      Object.keys(loadedSongs).forEach((id) => {
        const song = loadedSongs[id];
        if (album !== song.album) return;
        songsByAlbum[id] = song;
      });

      setVisibleSongs(songsByAlbum);
      setCurrentScreen(album);
      setFilteredSongs(songsByAlbum);
    },
    [loadedSongs, setFilteredSongs, setVisibleSongs, setCurrentScreen],
  );

  const rowHeight = readSongRowHeightPx();

  const rowProps = useMemo(
    () => ({
      orderedKeys,
      filteredSongs,
      visibleSongs,
      loadingQueue,
      currentSongId,
      toggleRightClickMenu,
      setPlaylistMenuOpen,
      handleSongEditClick,
      handleSongSelect,
      setCurrentScreen,
      goToArtistScreen,
      goToAlbumScreen,
    }),
    [
      orderedKeys,
      filteredSongs,
      visibleSongs,
      loadingQueue,
      currentSongId,
      toggleRightClickMenu,
      setPlaylistMenuOpen,
      handleSongEditClick,
      handleSongSelect,
      setCurrentScreen,
      goToArtistScreen,
      goToAlbumScreen,
    ],
  );

  useEffect(() => {
    if (currentSongId == null || orderedKeys.length === 0) return;
    const api = listRef.current;
    if (!api) return;
    const idx = orderedKeys.findIndex(
      (k) => String(filteredSongs[k]?.id) === String(currentSongId),
    );
    if (idx === -1) return;
    try {
      api.scrollToRow({
        align: 'auto',
        behavior: 'smooth',
        index: idx,
      });
    } catch (_) {}
  }, [currentSongId, orderedKeys, filteredSongs, songListScrollToCurrentToken]);

  if (orderedKeys.length === 0) return null;

  return (
    <List
      className="song-list-scrollbar"
      listRef={listRef}
      rowCount={orderedKeys.length}
      rowHeight={rowHeight}
      rowComponent={SongListRow}
      rowProps={rowProps}
      overscanCount={10}
      defaultHeight={400}
      style={{ height: '100%', width: '100%', overflowY: 'overlay' }}
    />
  );
}
