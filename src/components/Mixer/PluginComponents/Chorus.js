import React, { useState, useImperativeHandle, useEffect } from 'react';

import Knob from '../Knob';

const Chorus = React.forwardRef(({ interpolateValue, addEffect }, ref) => {
  const [chorusKnobStyles, setChorusKnobStyles] = useState({
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: -23,
    max: 24,
    value: 0,
    initialValue: 0,
  });

  const mapValueToChorus = (newValue) => {
    // Our desired range
    const freqRange = [0, -20];

    const mappedValue = interpolateValue(freqRange, newValue, chorusKnobStyles);

    console.error(newValue, mappedValue);

    setChorusKnobStyles((prevKnobs) => ({
      ...prevKnobs,
      ['value']: newValue,
    }));
    addEffect('chorus', mappedValue);
  };

  const resetChorus = () => {
    setChorusKnobStyles((prevKnobStyles) => ({
      ...prevKnobStyles,
      value: chorusKnobStyles.initialValue,
    }));
  };

  useImperativeHandle(ref, () => ({
    resetChorus,
  }));

  return (
    <div className="module-container">
      <div className="header">Chorus</div>
      <div className="speed-body">
        <Knob
          customProps={chorusKnobStyles}
          onChange={(val) => mapValueToChorus(val)}
        />
        <p>FREQ: {chorusKnobStyles.value}</p>
      </div>
    </div>
  );
});

export default Chorus;
