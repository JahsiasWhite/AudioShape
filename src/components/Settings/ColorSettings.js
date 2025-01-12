import React, { useState, useEffect } from 'react';
import './ColorSettings.css';

const ColorSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState({
    // main: 'rgb(13 14 18)',
    // secondary: 'rgb(26, 25, 26)',
    // button: '#294973',
    // text: '#ffffff',
    // buttonSecondary: '#316baa',
  });

  // Convert RGB string to hex
  const rgbToHex = (rgb) => {
    // Check if already hex
    if (rgb.startsWith('#')) return rgb;

    // Parse RGB values
    const matches = rgb.match(/\d+/g);
    if (!matches) return '#000000';

    const [r, g, b] = matches.map(Number);
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  // Convert hex to RGB string
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgb(0 0 0)';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgb(${r} ${g} ${b})`;
  };

  // Initialize colors from CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    setColors({
      main: computedStyle.getPropertyValue('--color-main').trim(),
      secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
      tertiary: computedStyle.getPropertyValue('--color-tertiary').trim(),
      accent: computedStyle.getPropertyValue('--color-accent').trim(),
      button: computedStyle.getPropertyValue('--color-button').trim(),
      secondaryButton: computedStyle
        .getPropertyValue('--color-button-secondary')
        .trim(),
      text: computedStyle.getPropertyValue('--color-text').trim(),
      secondaryText: computedStyle
        .getPropertyValue('--color-text-secondary')
        .trim(),
      textInverse: computedStyle
        .getPropertyValue('--color-text-inverse')
        .trim(),
    });
  }, []);

  const handleColorChange = (colorKey, value) => {
    const root = document.documentElement;
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);

    // Update CSS variables
    if (colorKey === 'main' || colorKey === 'secondary') {
      root.style.setProperty(`--color-${colorKey}`, hexToRgb(value));
    } else {
      root.style.setProperty(
        `--color-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
        value
      );
    }

    // Save to electron settings if available
    // if (window.electron?.ipcRenderer) {
    //   window.electron.ipcRenderer.sendMessage('SAVE_COLOR_SETTINGS', newColors);
    // }
  };

  return (
    <div className="color-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'open' : ''}
      >
        <span>Colors</span>
        <span>▼</span>
      </button>
      {isOpen && (
        <div className="color-settings">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="setting-item">
              <label htmlFor={`color-${key}`}>
                <span style={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <div>
                  <input
                    type="color"
                    id={`color-${key}`}
                    value={rgbToHex(value)}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                  <span className="color-text">{rgbToHex(value)}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSettings;
