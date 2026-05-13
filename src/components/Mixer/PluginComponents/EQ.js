import React, { useState, useImperativeHandle } from 'react';

import Knob from '../Knob';

const EQ = React.forwardRef(({ interpolateValue, addEffect }, ref) => {
  const [eqValues, setEqValues] = useState([0, 0, 0]);
  const [eqKnobStyles, setEqKnobStyles] = useState({
    degrees: 260,
    color: true,
    size: 75,
    numTicks: 6,
    min: -23,
    max: 24,
    value: 10,
    eq: { low: 0, mid: 0, high: 0 },
    initialEqValues: { low: 0, mid: 0, high: 0 },
  });

  const updateEqValue = (effectName, newValue) => {
    const eqRange = [-30, 30];
    const mappedValue = interpolateValue(eqRange, newValue, eqKnobStyles);

    console.log('Updating eq value: ', newValue, +' ' + mappedValue);
    setEqKnobStyles((prevKnobs) => ({
      ...prevKnobs,
      eq: {
        ...prevKnobs.eq,
        [effectName]: newValue,
      },
    }));

    if (effectName === 'low') {
      eqValues[0] = mappedValue;
    } else if (effectName === 'mid') {
      eqValues[1] = mappedValue;
    } else if (effectName === 'high') {
      eqValues[2] = mappedValue;
    }
    setEqValues(eqValues);

    addEffect(effectName, eqValues);
  };

  const resetEq = () => {
    setEqValues([1, 1, 1]);
    setEqKnobStyles((prevEqKnobStyles) => ({
      ...prevEqKnobStyles,
      eq: eqKnobStyles.initialEqValues,
    }));
  };

  /** Inverse of updateEqValue mapping: stored dB → knob position (-23…24). */
  const applySavedEq = ([lowDb, midDb, highDb]) => {
    const [dbMin, dbMax] = [-30, 30];
    const knobMin = -23;
    const knobMax = 24;
    const dbToKnob = (db) =>
      ((db - dbMin) / (dbMax - dbMin)) * (knobMax - knobMin) + knobMin;

    const low = dbToKnob(lowDb);
    const mid = dbToKnob(midDb);
    const high = dbToKnob(highDb);

    setEqValues([lowDb, midDb, highDb]);
    setEqKnobStyles((prev) => ({
      ...prev,
      eq: { low, mid, high },
    }));
  };

  useImperativeHandle(ref, () => ({
    resetEq,
    applySavedEq,
  }));

  const eqLabel = (v) => Math.round(Number(v));

  return (
    <div className="module-container" style={{ gridRow: 'span 2' }}>
      <div className="header">EQ</div>
      <div className="speed-body">
        <Knob
          customProps={{ ...eqKnobStyles, value: eqKnobStyles.eq.low }}
          knobValue={eqKnobStyles.eq.low}
          onChange={(val) => updateEqValue('low', val)}
        />
        <p>LOW: {eqLabel(eqKnobStyles.eq.low)}</p>

        <Knob
          customProps={{ ...eqKnobStyles, value: eqKnobStyles.eq.mid }}
          knobValue={eqKnobStyles.eq.mid}
          onChange={(val) => updateEqValue('mid', val)}
        />
        <p>MID: {eqLabel(eqKnobStyles.eq.mid)}</p>

        <Knob
          customProps={{ ...eqKnobStyles, value: eqKnobStyles.eq.high }}
          knobValue={eqKnobStyles.eq.high}
          onChange={(val) => updateEqValue('high', val)}
        />
        <p>HIGH: {eqLabel(eqKnobStyles.eq.high)}</p>
      </div>
    </div>
  );
});

export default EQ;
