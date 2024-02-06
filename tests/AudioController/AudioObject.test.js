import { renderHook } from '@testing-library/react';
import { AudioObject } from '../../src/AudioController/AudioObject';

// we will need this mock on our next test
global.fetch = jest.fn();

describe('AudioObject', () => {
  it('should return the initial values for data, error and loading', async () => {
    const { result } = renderHook(() => AudioObject());
    const { currentSong } = result.current;

    expect(currentSong).toBeDefined();
  });
});
