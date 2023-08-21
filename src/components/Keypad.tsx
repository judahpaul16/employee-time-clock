import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onClockIn: (value: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onClockIn }) => {
  return (
    <div className="keypad-container">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((key) => (
        <button className="keypad-button" key={key} onClick={() => onKeyPress(key)}>
          {key}
        </button>
      ))}
      <button className="keypad-button"></button>
      <button className="keypad-button" onClick={() => onClockIn(getTime())}>Clock In</button>
    </div>
  );
};

function getTime() {
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return time;
}

export default Keypad;
