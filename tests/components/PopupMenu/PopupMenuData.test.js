import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PopupMenuData from '../../../src/components/PopupMenu/PopupMenuData.js';

const mockApplySavedEffects = jest.fn();
const mockDeleteEffectCombo = jest.fn();

jest.mock('../../../src/AudioController/AudioContext', () => {
  const useAudioPlayer = jest.fn();
  useAudioPlayer.mockReturnValue({
    savedEffects: {},
    applySavedEffects: mockApplySavedEffects,
    currentEffectCombo: null,
    deleteEffectCombo: mockDeleteEffectCombo,
  });

  return {
    ...jest.requireActual('../../../src/AudioController/AudioContext'),
    useAudioPlayer,
  };
});

window.electron = {
  ipcRenderer: {
    on: jest.fn(),
    once: jest.fn(),
    sendMessage: jest.fn(),
  },
};

const { useAudioPlayer } = require('../../../src/AudioController/AudioContext');

describe('<PopupMenuData />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAudioPlayer.mockReturnValue({
      savedEffects: {},
      applySavedEffects: mockApplySavedEffects,
      currentEffectCombo: null,
      deleteEffectCombo: mockDeleteEffectCombo,
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<PopupMenuData setIsVisible={jest.fn()} />);
    expect(container).toBeDefined();
  });

  it('renders saved effect items', () => {
    useAudioPlayer.mockReturnValue({
      savedEffects: { 'Combo 1': { reverb: '0.5', delay: '0.3' } },
      applySavedEffects: mockApplySavedEffects,
      currentEffectCombo: null,
      deleteEffectCombo: mockDeleteEffectCombo,
    });

    const { getByText } = render(<PopupMenuData setIsVisible={jest.fn()} />);
    expect(getByText('Combo 1')).toBeDefined();
  });

  it('shows tooltip on hover with valid effects', () => {
    useAudioPlayer.mockReturnValue({
      savedEffects: { 'Combo 1': { reverb: '0.5' } },
      applySavedEffects: mockApplySavedEffects,
      currentEffectCombo: null,
      deleteEffectCombo: mockDeleteEffectCombo,
    });

    const { getByText, container } = render(
      <PopupMenuData setIsVisible={jest.fn()} />
    );

    fireEvent.mouseEnter(getByText('Combo 1').closest('.saved-effect-item'));
    expect(container.querySelector('.effect-tooltip')).not.toBeNull();
  });

  it('does not crash when hovering over an effect with undefined value', () => {
    useAudioPlayer.mockReturnValue({
      savedEffects: { 'Broken Combo': undefined },
      applySavedEffects: mockApplySavedEffects,
      currentEffectCombo: null,
      deleteEffectCombo: mockDeleteEffectCombo,
    });

    const { getByText, container } = render(
      <PopupMenuData setIsVisible={jest.fn()} />
    );

    expect(() => {
      fireEvent.mouseEnter(getByText('Broken Combo').closest('.saved-effect-item'));
    }).not.toThrow();

    expect(container.querySelector('.effect-tooltip')).toBeNull();
  });

  it('calls setIsVisible(false) when close button is clicked', () => {
    const mockSetIsVisible = jest.fn();
    const { getByText } = render(<PopupMenuData setIsVisible={mockSetIsVisible} />);

    fireEvent.click(getByText('X'));
    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
  });

  it('calls applySavedEffects and closes on item click', () => {
    const mockSetIsVisible = jest.fn();
    useAudioPlayer.mockReturnValue({
      savedEffects: { 'Combo 1': { reverb: '0.5' } },
      applySavedEffects: mockApplySavedEffects,
      currentEffectCombo: null,
      deleteEffectCombo: mockDeleteEffectCombo,
    });

    const { getByText } = render(<PopupMenuData setIsVisible={mockSetIsVisible} />);

    fireEvent.click(getByText('Combo 1').closest('.saved-effect-item'));
    expect(mockApplySavedEffects).toHaveBeenCalledWith('Combo 1');
    expect(mockSetIsVisible).toHaveBeenCalledWith(false);
  });
});
