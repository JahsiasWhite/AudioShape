// import { render, screen } from '@testing-library/react';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

import React from 'react';
import { render } from '@testing-library/react';
import App from '../src/App';

// Mock dependencies
// jest.mock('../../src/AudioController/AudioObject', () => ({
//   AudioObject: jest.fn(() => ({ currentSong: { volume: 1 } })),
// }));

// jest.mock('../../src/AudioController/AudioControls', () => ({
//   AudioControls: jest.fn(() => ({
//     playAudio: jest.fn(),
//     pauseAudio: jest.fn(),
//     changeVolume: jest.fn(),
//     toggleMute: jest.fn(),
//     isPlaying: false,
//     setIsPlaying: jest.fn(),
//     volume: 1,
//     isMuted: false,
//   })),
// }));

// Mock the ipcRenderer for testing
window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
    sendMessage: jest.fn(),
  },
};

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <App>
        <div>Test Component</div>
      </App>
    );

    expect(container).toBeDefined();
  });

  //   it('should initialize with default values', () => {
  //     const { result } = renderHook(() =>
  //       AudioControls({ play: jest.fn(), pause: jest.fn() })
  //     );

  //     // Destructure the values from the result
  //     const { isPlaying, volume, isMuted } = result.current;

  //     // Assertions
  //     expect(isPlaying).toBe(false);
  //     expect(volume).toBe(1);
  //     expect(isMuted).toBe(false);
  //   });
});
