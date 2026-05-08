import React, { useEffect } from 'react';

import './SongInfoDialog.css';

function formatDurationSeconds(sec) {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatBitrate(bps) {
  if (bps == null || !Number.isFinite(bps)) return '—';
  return `${Math.round(bps / 1000)} kbps`;
}

function formatFileSize(bytes) {
  if (bytes == null || !Number.isFinite(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = n < 10 && i > 0 ? 1 : 0;
  return `${n.toFixed(digits)} ${units[i]}`;
}

function formatSampleRate(hz) {
  if (hz == null || !Number.isFinite(hz)) return '—';
  if (hz >= 1000) {
    const k = hz / 1000;
    const rounded = Number.isInteger(k) ? k : k.toFixed(1);
    return `${rounded} kHz`;
  }
  return `${hz} Hz`;
}

function Row({ label, value }) {
  const display =
    value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className="song-info-row">
      <dt className="song-info-label">{label}</dt>
      <dd className="song-info-value" title={display === '—' ? undefined : display}>
        {display}
      </dd>
    </div>
  );
}

export default function SongInfoDialog({ song, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!song) return null;

  const ext =
    typeof song.file === 'string' && song.file.includes('.')
      ? song.file.slice(song.file.lastIndexOf('.'))
      : '—';

  const channels =
    song.numberOfChannels != null && Number.isFinite(song.numberOfChannels)
      ? song.numberOfChannels === 1
        ? '1 (mono)'
        : song.numberOfChannels === 2
          ? '2 (stereo)'
          : String(song.numberOfChannels)
      : undefined;

  const lossless =
    song.lossless === true ? 'Yes' : song.lossless === false ? 'No' : undefined;

  return (
    <div
      className="song-info-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="song-info-panel"
        role="dialog"
        aria-labelledby="song-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="song-info-header">
          <h2 id="song-info-title" className="song-info-heading">
            Song info
          </h2>
          <button
            type="button"
            className="song-info-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <dl className="song-info-list">
          <Row label="Title" value={song.title} />
          <Row label="Artist" value={song.artist} />
          <Row label="Album" value={song.album} />
          <Row label="Duration" value={formatDurationSeconds(song.duration)} />
          <Row label="File path" value={song.file} />
          <Row label="Type" value={ext} />
          <Row label="Container" value={song.container} />
          <Row label="Codec" value={song.codec} />
          <Row label="Bitrate" value={formatBitrate(song.bitrate)} />
          <Row label="Sample rate" value={formatSampleRate(song.sampleRate)} />
          <Row label="Channels" value={channels} />
          <Row label="Lossless" value={lossless} />
          <Row label="File size" value={formatFileSize(song.fileSizeBytes)} />
        </dl>
      </div>
    </div>
  );
}
