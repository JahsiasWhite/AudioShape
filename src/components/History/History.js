import React from 'react';
import { useAudioPlayer } from '../../AudioController/AudioContext';
import './History.css';

function formatPlayedAt(isoDate) {
  const timestamp = new Date(isoDate);
  if (Number.isNaN(timestamp.getTime())) return 'Unknown time';

  return timestamp.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function History({ handleSongEdit }) {
  const {
    listeningHistory,
    loadedSongs,
    handleSongSelect,
    currentSongId,
    clearListeningHistory,
  } = useAudioPlayer();

  const historyWithSongData = listeningHistory
    .map((entry) => ({
      ...entry,
      song: loadedSongs[entry.songId] || {
        title: entry.title || 'Unknown Title',
        artist: entry.artist || 'Unknown Artist',
        album: entry.album || 'Unknown Album',
        albumImage: entry.albumImage || null,
      },
    }))
    .filter((entry) => entry.song && entry.song.title);

  return (
    <div className="history-container">
      <div className="history-header-row">
        <h2 className="history-title">Listening History</h2>
        {historyWithSongData.length !== 0 ? (
          <button
            className="history-clear-button"
            onClick={clearListeningHistory}
            disabled={historyWithSongData.length === 0}
          >
            Clear
          </button>
        ) : null}
      </div>

      {historyWithSongData.length === 0 ? (
        <div className="history-empty-message">
          Songs you play will show up here.
        </div>
      ) : (
        <ul className="history-list">
          {historyWithSongData.map((entry, index) => (
            <li
              key={`${entry.songId}-${entry.playedAt}-${index}`}
              className={`history-item ${
                currentSongId === entry.songId ? 'history-item-active' : ''
              }`}
              onDoubleClick={() => handleSongSelect(entry.songId)}
            >
              <div className="history-item-main">
                <div className="history-song-title">{entry.song.title}</div>
                <div className="history-song-subtitle">
                  {entry.song.artist} - {entry.song.album}
                </div>
              </div>
              <div className="history-item-actions">
                <span className="history-time">{formatPlayedAt(entry.playedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
