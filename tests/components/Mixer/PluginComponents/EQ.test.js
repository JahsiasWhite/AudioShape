import React, { useRef } from 'react';
import { render, act } from '@testing-library/react';

import EQ from '../../../../src/components/Mixer/PluginComponents/EQ';

describe('EQ applySavedEq', () => {
  const addEffect = jest.fn();
  const interpolateValue = (range, value) => value;

  it('maps stored dB bands to knob positions for the UI', () => {
    let ref;
    function Harness() {
      ref = useRef();
      return (
        <EQ
          ref={ref}
          interpolateValue={interpolateValue}
          addEffect={addEffect}
        />
      );
    }
    render(<Harness />);
    act(() => {
      ref.current.applySavedEq([-30, 0, 30]);
    });
    expect(document.body.textContent).toMatch(/LOW: -23/);
    expect(document.body.textContent).toMatch(/MID: 1/);
    expect(document.body.textContent).toMatch(/HIGH: 24/);
  });
});
