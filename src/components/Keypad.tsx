import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="keypad-container">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
        <button className="keypad-button" key={key} onClick={() => onKeyPress(key)}>
          {key}
        </button>
      ))}
      <div className="keypad-button-spacer"></div>
      <button className="keypad-button" key="0" onClick={() => onKeyPress('0')}>
        0
      </button>
      <div className="keypad-button-spacer"></div>
    </div>
  );
};

export default Keypad;
