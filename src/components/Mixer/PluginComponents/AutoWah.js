import React, { useState, useImperativeHandle } from 'react';

import Knob from '../Knob';

const AutoWah = React.forwardRef(({ interpolateValue, addEffect }, ref) => {
  const [autoWahKnobStyles, setAutoWahKnobStyles] = useState({
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: -23,
    max: 24,
    value: 0,
    initialValue: 0,
  });

  const mapValueToAutoWah = (newValue) => {
    // Our desired range
    const delayRange = [0, 100];

    const mappedValue = interpolateValue(
      delayRange,
      newValue,
      autoWahKnobStyles
    );

    console.error(newValue, mappedValue);

    setAutoWahKnobStyles((prevKnobs) => ({
      ...prevKnobs,
      ['value']: newValue,
    }));
    addEffect('autowah', mappedValue);
  };

  const resetAutoWah = () => {
    setAutoWahKnobStyles((prevKnobStyles) => ({
      ...prevKnobStyles,
      value: autoWahKnobStyles.initialValue,
    }));
  };

  /** Inverse of mapValueToAutoWah: audio value in 0…100 → knob (-23…24). */
  const applySavedAutowah = (mappedValue) => {
    setAutoWahKnobStyles((prev) => {
      const [outMin, outMax] = [0, 100];
      const knob =
        ((mappedValue - outMin) / (outMax - outMin)) * (prev.max - prev.min) +
        prev.min;
      return { ...prev, value: knob };
    });
  };

  useImperativeHandle(ref, () => ({
    resetAutoWah,
    applySavedAutowah,
  }));

  return (
    <div className="module-container">
      <div className="header">AutoWah</div>
      <div className="speed-body">
        <Knob
          customProps={autoWahKnobStyles}
          knobValue={autoWahKnobStyles.value}
          onChange={(val) => mapValueToAutoWah(val)}
        />
        <p>FREQ: {autoWahKnobStyles.value}</p>
      </div>
    </div>
  );
});

export default AutoWah;
