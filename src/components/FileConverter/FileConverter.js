import React, { useMemo, useState } from 'react';
import './FileConverter.css';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useAudioPlayer } from '../../AudioController/AudioContext';

const OUTPUT_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];

/** Extensions commonly used for lossy-compressed audio */
const LOSSY_SOURCE_EXTENSIONS = new Set(['mp3', 'ogg', 'aac', 'm4a']);

const LOSSLESS_OUTPUT_FORMATS = new Set(['wav', 'flac']);

function baseName(filePath) {
  if (!filePath) return '';
  return filePath.split(/[\\/]/).pop() || '';
}

function extensionOf(filePath) {
  const name = baseName(filePath);
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function FileConverter() {
  const { addSong } = useAudioPlayer();

  const [sourcePaths, setSourcePaths] = useState([]);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [status, setStatus] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedPaths, setConvertedPaths] = useState([]);
  const [convertProgress, setConvertProgress] = useState(null);
  const [conversionErrors, setConversionErrors] = useState([]);

  const lossyToLosslessWarning = useMemo(() => {
    if (!LOSSLESS_OUTPUT_FORMATS.has(outputFormat)) return false;
    return sourcePaths.some((p) =>
      LOSSY_SOURCE_EXTENSIONS.has(extensionOf(p)),
    );
  }, [sourcePaths, outputFormat]);

  const chooseSourceFiles = async () => {
    setStatus('');
    setConvertedPaths([]);
    setConversionErrors([]);

    const selectedPaths = await window.electron.ipcRenderer.invoke(
      'SELECT_CONVERTER_INPUT',
    );

    if (selectedPaths?.length) {
      setSourcePaths(selectedPaths);
    }
  };

  const removeSourceAt = (index) => {
    setSourcePaths((prev) => prev.filter((_, i) => i !== index));
    setConvertedPaths([]);
    setConversionErrors([]);
    setStatus('');
  };

  const convertFiles = async () => {
    if (!sourcePaths.length || isConverting) return;

    setIsConverting(true);
    setStatus('');
    setConvertedPaths([]);
    setConversionErrors([]);
    setConvertProgress({ current: 0, total: sourcePaths.length });

    const outputs = [];
    const errors = [];

    try {
      for (let i = 0; i < sourcePaths.length; i += 1) {
        const inputPath = sourcePaths[i];
        setConvertProgress({ current: i + 1, total: sourcePaths.length });

        try {
          const result = await window.electron.ipcRenderer.invoke(
            'CONVERT_SONG_FILE',
            {
              inputPath,
              outputFormat,
            },
          );

          if (result.success) {
            if (result.song) addSong(result.song);
            outputs.push(result.outputPath);
          } else {
            errors.push({
              file: baseName(inputPath),
              message: result.error || 'Conversion failed.',
            });
          }
        } catch (error) {
          errors.push({
            file: baseName(inputPath),
            message: error.message || 'Conversion failed.',
          });
        }
      }

      setConvertedPaths(outputs);
      setConversionErrors(errors);

      if (errors.length === 0) {
        const label = outputFormat.toUpperCase();
        setStatus(
          sourcePaths.length === 1
            ? `Converted to ${label}.`
            : `Converted ${sourcePaths.length} files to ${label}.`,
        );
      } else if (outputs.length === 0) {
        setStatus(
          errors.length === 1
            ? `${errors[0].file}: ${errors[0].message}`
            : 'All conversions failed.',
        );
      } else {
        setStatus(
          `Converted ${outputs.length} of ${sourcePaths.length} files. ${errors.length} failed.`,
        );
      }
    } finally {
      setConvertProgress(null);
      setIsConverting(false);
    }
  };

  return (
    <div className="file-converter">
      <div className="file-converter-container">
        <h2 className="file-converter-title">File Converter</h2>
        <p className="file-converter-description">
          Convert one or more song files into another audio format. Converted
          files are saved next to the originals.
        </p>

        <div className="file-converter-field">
          <label htmlFor="converter-source">Source files</label>
          <div className="file-converter-input-row">
            <input
              id="converter-source"
              className="file-converter-source"
              type="text"
              value={
                sourcePaths.length === 0
                  ? ''
                  : sourcePaths.length === 1
                  ? baseName(sourcePaths[0])
                  : `${sourcePaths.length} files selected`
              }
              placeholder="Choose one or more song files"
              readOnly
            />
            <button
              className="file-converter-button"
              type="button"
              onClick={chooseSourceFiles}
              disabled={isConverting}
            >
              Browse
            </button>
          </div>
          {sourcePaths.length > 1 && (
            <ul className="file-converter-file-list">
              {sourcePaths.map((p, index) => (
                <li key={`${p}-${index}`} className="file-converter-file-item">
                  <span className="file-converter-file-name">{baseName(p)}</span>
                  <button
                    type="button"
                    className="file-converter-remove"
                    onClick={() => removeSourceAt(index)}
                    disabled={isConverting}
                    aria-label={`Remove ${baseName(p)}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
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

        {lossyToLosslessWarning && (
          <div
            className="file-converter-notice file-converter-notice--warning"
            role="status"
          >
            <strong>Lossy to lossless:</strong> You are targeting a lossless
            format (WAV/FLAC), but at least one source file is a lossy type
            (e.g. MP3, AAC). That does not recover detail removed by earlier
            compression; files will usually get larger without sounding better.
            Use this when you need an uncompressed file for editing or
            compatibility, not to &quot;enhance&quot; MP3s.
          </div>
        )}

        <button
          className="file-converter-button file-converter-convert"
          type="button"
          onClick={convertFiles}
          disabled={!sourcePaths.length || isConverting}
        >
          Convert
        </button>

        {isConverting ? (
          <div className="file-converter-status">
            <LoadingSpinner />
            {convertProgress && (
              <p className="file-converter-progress">
                Converting {convertProgress.current} of {convertProgress.total}
                …
              </p>
            )}
          </div>
        ) : (
          status && <p className="file-converter-status">{status}</p>
        )}

        {conversionErrors.length > 0 &&
          (conversionErrors.length > 1 || convertedPaths.length > 0) && (
            <ul className="file-converter-error-list">
              {conversionErrors.map((err) => (
                <li key={err.file}>
                  <span className="file-converter-error-file">{err.file}</span>
                  {': '}
                  {err.message}
                </li>
              ))}
            </ul>
          )}

        {convertedPaths.length > 0 && (
          <div className="file-converter-output-block">
            <strong className="file-converter-output-label">
              {convertedPaths.length === 1 ? 'Output:' : 'Outputs:'}
            </strong>
            <ul className="file-converter-output-list">
              {convertedPaths.map((p) => (
                <li key={p} className="file-converter-output-path">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileConverter;
