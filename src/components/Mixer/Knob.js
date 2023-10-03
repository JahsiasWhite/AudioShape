import React, { useState, useEffect } from 'react';

import './Knob.css';

const Knob = ({ customProps, onChange }) => {
  /**
   * This is required so we don't send back 100 inputs when the user drags the knob around. We only want to send the last one
   * @param {*} func
   * @param {*} delay
   * @returns
   */
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  const handleChange = debounce(onChange, 300);

  class Knob extends React.Component {
    constructor(props) {
      super(props);
      this.fullAngle = props.degrees;
      this.startAngle = (360 - props.degrees) / 2;
      this.endAngle = this.startAngle + props.degrees;
      this.margin = props.size * 0.15;
      this.currentDeg = Math.floor(
        this.convertRange(
          props.min,
          props.max,
          this.startAngle,
          this.endAngle,
          props.value
        )
      );
      this.state = { deg: this.currentDeg };
    }

    startDrag = (e) => {
      e.preventDefault();
      const knob = e.target.getBoundingClientRect();
      const pts = {
        x: knob.left + knob.width / 2,
        y: knob.top + knob.height / 2,
      };

      /* User is currently dragging */
      const moveHandler = (e) => {
        this.currentDeg = this.getDeg(e.clientX, e.clientY, pts);

        if (this.currentDeg === this.startAngle) this.currentDeg--;

        this.setState({ deg: this.currentDeg });
      };

      /* User has stopped dragging */
      const endHandler = () => {
        // Add a delay before triggering the change to account for a brief stop in dragging
        const newValue = Math.floor(
          this.convertRange(
            this.startAngle,
            this.endAngle,
            this.props.min,
            this.props.max,
            this.currentDeg
          )
        );
        handleChange(newValue);

        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', (e) => {
        document.removeEventListener('mousemove', moveHandler);
      });
      document.addEventListener('mouseup', endHandler);
    };

    getDeg = (cX, cY, pts) => {
      const x = cX - pts.x;
      const y = cY - pts.y;
      let deg = (Math.atan(y / x) * 180) / Math.PI;
      if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
        deg += 90;
      } else {
        deg += 270;
      }
      let finalDeg = Math.min(Math.max(this.startAngle, deg), this.endAngle);
      return finalDeg;
    };

    convertRange = (oldMin, oldMax, newMin, newMax, oldValue) => {
      return (
        ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
      );
    };

    renderTicks = () => {
      let ticks = [];
      const incr = this.fullAngle / this.props.numTicks;
      const size = this.margin + this.props.size / 2;
      for (let deg = this.startAngle; deg <= this.endAngle; deg += incr) {
        const tick = {
          deg: deg,
          tickStyle: {
            height: size + 10,
            left: size - 1,
            top: size + 2,
            transform: 'rotate(' + deg + 'deg)',
            transformOrigin: 'top',
          },
        };
        ticks.push(tick);
      }
      return ticks;
    };

    dcpy = (o) => {
      return JSON.parse(JSON.stringify(o));
    };

    render() {
      let kStyle = {
        width: this.props.size,
        height: this.props.size,
      };
      let iStyle = this.dcpy(kStyle);
      let oStyle = this.dcpy(kStyle);
      oStyle.margin = this.margin;
      if (this.props.color) {
        oStyle.backgroundImage =
          'radial-gradient(100% 70%,hsl(210, ' +
          this.currentDeg +
          '%, ' +
          this.currentDeg / 5 +
          '%),hsl(' +
          Math.random() * 100 +
          ',20%,' +
          this.currentDeg / 36 +
          '%))';
      }
      iStyle.transform = 'rotate(' + this.state.deg + 'deg)';

      return (
        <div className="knob" style={{ top: 5 + 'vh' }}>
          <div className="ticks">
            {this.props.numTicks
              ? this.renderTicks().map((tick, i) => (
                  <div
                    key={i}
                    className={
                      'tick' + (tick.deg <= this.currentDeg ? ' active' : '')
                    }
                    style={tick.tickStyle}
                  />
                ))
              : null}
          </div>
          <div
            className="knob outer"
            style={oStyle}
            onMouseDown={this.startDrag}
          >
            <div className="knob inner" style={iStyle}>
              <div className="grip" />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <Knob
      size={customProps.size}
      numTicks={customProps.numTicks}
      degrees={customProps.degrees}
      min={customProps.min}
      max={customProps.max}
      value={customProps.value}
      color={customProps.color}
    />
  );
};

export default Knob;
