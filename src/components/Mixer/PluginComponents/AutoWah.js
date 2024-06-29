import React, { useState, useImperativeHandle, useEffect } from 'react';

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

  useImperativeHandle(ref, () => ({
    resetAutoWah,
  }));

  return (
    <div className="module-container">
      <div className="header">AutoWah</div>
      <div className="speed-body">
        <Knob
          customProps={autoWahKnobStyles}
          onChange={(val) => mapValueToAutoWah(val)}
        />
        <p>FREQ: {autoWahKnobStyles.value}</p>
      </div>
    </div>
  );
});

export default AutoWah;
