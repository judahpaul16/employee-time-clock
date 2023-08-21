import React, { useState } from 'react';
import Keypad from './components/Keypad';

const App: React.FC = () => {
  const [pin, setPin] = useState('');

  const handleKeyPress = (key: string) => {
    setPin(pin + key);
  };

  const handleClockIn = (time: string) => {
    console.log(`Employee clocked in at ${time}`);
    setPin('');
  };

  return (
    <div>
      <h1>Employee Time Clock</h1>
      <div>Pin: {pin}</div>
      <div className="main-container">
        <Keypad onKeyPress={handleKeyPress} onClockIn={handleClockIn} type={"In"}/>
        <Keypad onKeyPress={handleKeyPress} onClockIn={handleClockIn} type={"Out"}/>
      </div>  
    </div>
  );
};

export default App;
