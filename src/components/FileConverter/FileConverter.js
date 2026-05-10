import React, { useMemo, useState } from 'react';
import './FileConverter.css';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useAudioPlayer } from '../../AudioController/AudioContext';

const OUTPUT_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];

function FileConverter() {
  const { addSong } = useAudioPlayer();

  const [sourcePath, setSourcePath] = useState('');
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [status, setStatus] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedPath, setConvertedPath] = useState('');

  const sourceFileName = useMemo(() => {
    if (!sourcePath) return '';
    return sourcePath.split(/[\\/]/).pop();
  }, [sourcePath]);

  const chooseSourceFile = async () => {
    setStatus('');
    setConvertedPath('');

    const selectedPath = await window.electron.ipcRenderer.invoke(
      'SELECT_CONVERTER_INPUT',
    );

    if (selectedPath) {
      setSourcePath(selectedPath);
    }
  };

  const convertFile = async () => {
    if (!sourcePath || isConverting) return;

    setIsConverting(true);
    setStatus('Converting...');
    setConvertedPath('');

    try {
      const result = await window.electron.ipcRenderer.invoke(
        'CONVERT_SONG_FILE',
        {
          inputPath: sourcePath,
          outputFormat,
        },
      );

      if (result.success) {
        if (result.song) addSong(result.song);
        setConvertedPath(result.outputPath);
        setStatus(`Converted to ${outputFormat.toUpperCase()}.`);
      } else {
        setStatus(result.error || 'Conversion failed.');
      }
    } catch (error) {
      setStatus(error.message || 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="file-converter">
      <div className="file-converter-container">
        <h2 className="file-converter-title">File Converter</h2>
        <p className="file-converter-description">
          Convert a song file into another audio format. The converted file is
          saved next to the original.
        </p>

        <div className="file-converter-field">
          <label htmlFor="converter-source">Source file</label>
          <div className="file-converter-input-row">
            <input
              id="converter-source"
              className="file-converter-source"
              type="text"
              value={sourceFileName || sourcePath}
              placeholder="Choose a song file"
              readOnly
            />
            <button
              className="file-converter-button"
              type="button"
              onClick={chooseSourceFile}
              disabled={isConverting}
            >
              Browse
            </button>
          </div>
        </div>

        <div className="file-converter-field">
          <label htmlFor="converter-format">Convert to</label>
          <select
            id="converter-format"
            className="file-converter-select"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            disabled={isConverting}
          >
            {OUTPUT_FORMATS.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button
          className="file-converter-button file-converter-convert"
          type="button"
          onClick={convertFile}
          disabled={!sourcePath || isConverting}
        >
          Convert
        </button>

        {isConverting ? (
          <div className="file-converter-status">
            <LoadingSpinner />
          </div>
        ) : (
          status && <p className="file-converter-status">{status}</p>
        )}

        {convertedPath && (
          <p className="file-converter-output">
            <strong>Output:</strong> {convertedPath}
          </p>
        )}
      </div>
    </div>
  );
}

export default FileConverter;
