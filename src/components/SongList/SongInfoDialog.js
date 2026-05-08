import React, { useEffect, useState } from 'react';

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

function EditableTagRow({
  inputId,
  label,
  value,
  editing,
  onStartEditing,
  onStopEditing,
  onChange,
  disabled,
}) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value);

  if (!editing) {
    return (
      <div className="song-info-row">
        <dt className="song-info-label">{label}</dt>
        <dd
          className="song-info-value song-info-value-with-button"
          title={display === '—' ? undefined : display}
        >
          <span className="song-info-value-text">{display}</span>
          <button
            type="button"
            className="song-info-pencil"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing();
            }}
            disabled={disabled}
            aria-label={`Edit ${label}`}
            title={`Edit ${label}`}
          >
            ✎
          </button>
        </dd>
      </div>
    );
  }

  return (
    <div className="song-info-row song-info-row-edit">
      <dt className="song-info-label">{label}</dt>
      <dd className="song-info-value song-info-value-with-input">
        <input
          id={inputId}
          className="song-info-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="button"
          className="song-info-pencil song-info-pencil-cancel"
          onClick={(e) => {
            e.stopPropagation();
            onStopEditing();
          }}
          disabled={disabled}
          aria-label={`Stop editing ${label}`}
          title="Stop editing"
        >
          ×
        </button>
      </dd>
    </div>
  );
}

export default function SongInfoDialog({ song, onClose }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingFields, setEditingFields] = useState({
    title: false,
    artist: false,
    album: false,
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!song) return;
    setTitle((song.title ?? '').toString());
    setArtist((song.artist ?? '').toString());
    setAlbum((song.album ?? '').toString());
    setFormError('');
    setEditingFields({ title: false, artist: false, album: false });
  }, [song]);

  const initialTitle = ((song?.title ?? '') || '').toString().trim();
  const initialArtist = ((song?.artist ?? '') || '').toString().trim();
  const initialAlbum = ((song?.album ?? '') || '').toString().trim();

  const dirty =
    song &&
    (title.trim() !== initialTitle ||
      artist.trim() !== initialArtist ||
      album.trim() !== initialAlbum);

  const saveTags = () => {
    if (!song?.file || !dirty || saving) return;
    setSaving(true);
    setFormError('');

    const handleResult = (result) => {
      setSaving(false);
      if (result?.success) {
        setEditingFields({ title: false, artist: false, album: false });
        return;
      }
      setFormError(result?.error ?? 'Could not save tags.');
    };

    window.electron.ipcRenderer.once('UPDATE_SONG_TAGS_RESULT', handleResult);
    window.electron.ipcRenderer.sendMessage('UPDATE_SONG_TAGS', {
      filePath: song.file,
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      previousAlbumImage: song.albumImage,
    });
  };

  if (!song) return null;

  const isEditingAnyField = editingFields.title || editingFields.artist || editingFields.album;

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
          <EditableTagRow
            inputId="song-info-edit-title"
            label="Title"
            value={title}
            editing={editingFields.title}
            disabled={saving}
            onStartEditing={() => setEditingFields((p) => ({ ...p, title: true }))}
            onStopEditing={() => setEditingFields((p) => ({ ...p, title: false }))}
            onChange={setTitle}
          />
          <EditableTagRow
            inputId="song-info-edit-artist"
            label="Artist"
            value={artist}
            editing={editingFields.artist}
            disabled={saving}
            onStartEditing={() => setEditingFields((p) => ({ ...p, artist: true }))}
            onStopEditing={() => setEditingFields((p) => ({ ...p, artist: false }))}
            onChange={setArtist}
          />
          <EditableTagRow
            inputId="song-info-edit-album"
            label="Album"
            value={album}
            editing={editingFields.album}
            disabled={saving}
            onStartEditing={() => setEditingFields((p) => ({ ...p, album: true }))}
            onStopEditing={() => setEditingFields((p) => ({ ...p, album: false }))}
            onChange={setAlbum}
          />

          {isEditingAnyField ? (
            <div className="song-info-actions">
              <button
                type="button"
                className="song-info-save"
                disabled={!dirty || saving}
                onClick={saveTags}
              >
                {saving ? 'Saving…' : 'Save tags'}
              </button>
            </div>
          ) : null}
          {formError ? <p className="song-info-error">{formError}</p> : null}

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
