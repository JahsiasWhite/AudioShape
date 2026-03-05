import { useState, useEffect, useRef, useCallback } from 'react';
import './Knob.css';

let _uidCounter = 0;

const convertRange = (oldMin, oldMax, newMin, newMax, val) =>
  ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;

const Knob = ({ customProps, knobValue, onChange, live = true }) => {
  const {
    size = 75,
    degrees = 260,
    min = 0,
    max = 100,
    value: defaultValue = 0,
  } = customProps;

  const startAngle = (360 - degrees) / 2;
  const endAngle = startAngle + degrees;

  // Stable unique ID per instance for SVG gradient
  const [uid] = useState(() => `kg${++_uidCounter}`);

  const valueToDeg = useCallback(
    (val) => {
      const clamped = Math.min(Math.max(val, min), max);
      return convertRange(min, max, startAngle, endAngle, clamped);
    },
    [min, max, startAngle, endAngle]
  );

  const degToValue = useCallback(
    (deg) => Math.floor(convertRange(startAngle, endAngle, min, max, deg)),
    [min, max, startAngle, endAngle]
  );

  const initVal = knobValue !== undefined ? knobValue : defaultValue;
  const [currentDeg, setCurrentDeg] = useState(() => valueToDeg(initVal));
  const degRef = useRef(valueToDeg(initVal));

  useEffect(() => {
    if (knobValue !== undefined) {
      const d = valueToDeg(knobValue);
      degRef.current = d;
      setCurrentDeg(d);
    }
  }, [knobValue, valueToDeg]);

  const startDrag = useCallback(
    (e) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const ocx = rect.left + rect.width / 2;
      const ocy = rect.top + rect.height / 2;

      const getAngle = (mx, my) => {
        const dx = mx - ocx;
        const dy = my - ocy;
        // atan2(dx, -dy) gives clockwise angle from top (12 o'clock = 0°)
        let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
        if (a < 0) a += 360;
        return Math.min(Math.max(startAngle, a), endAngle);
      };

      const onMove = (ev) => {
        const newDeg = getAngle(ev.clientX, ev.clientY);
        degRef.current = newDeg;
        setCurrentDeg(newDeg);
        if (live) onChange(degToValue(newDeg));
      };

      const onUp = () => {
        onChange(degToValue(degRef.current));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [startAngle, endAngle, live, onChange, degToValue]
  );

  // ── SVG geometry ──────────────────────────────────────────────────────────
  const pad = 9;
  const svgSize = size + pad * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const arcR = size / 2 - 1;   // arc ring radius
  const knobR = size / 2 - 9;  // knob body radius

  // Convert clockwise-from-top degrees to SVG {x, y}
  const toXY = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
  };

  const arcPath = (from, to, r) => {
    const s = toXY(from, r);
    const e = toXY(to, r);
    const large = to - from > 180 ? 1 : 0;
    return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${large} 1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`;
  };

  const ind = toXY(currentDeg, knobR * 0.55);
  const hasActiveArc = currentDeg > startAngle + 0.5;

  return (
    <svg
      className="knob-svg"
      width={svgSize}
      height={svgSize}
      onMouseDown={startDrag}
    >
      <defs>
        <radialGradient id={uid} cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#52525e" />
          <stop offset="55%"  stopColor="#1e1e28" />
          <stop offset="100%" stopColor="#0c0c12" />
        </radialGradient>
      </defs>

      {/* Track arc */}
      <path
        d={arcPath(startAngle, endAngle, arcR)}
        fill="none"
        stroke="#1a1a24"
        strokeWidth={3.5}
        strokeLinecap="round"
      />

      {/* Active arc */}
      {hasActiveArc && (
        <path
          d={arcPath(startAngle, currentDeg, arcR)}
          fill="none"
          stroke="#00c8ff"
          strokeWidth={3.5}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0,200,255,0.55))' }}
        />
      )}

      {/* Knob body */}
      <circle
        cx={cx}
        cy={cy}
        r={knobR}
        fill={`url(#${uid})`}
        stroke="#090910"
        strokeWidth={1.5}
      />

      {/* Subtle inner highlight ring */}
      <circle
        cx={cx}
        cy={cy}
        r={knobR - 2}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
      />

      {/* Indicator dot */}
      <circle cx={ind.x} cy={ind.y} r={2.5} fill="rgba(255,255,255,0.85)" />
    </svg>
  );
};

export default Knob;
