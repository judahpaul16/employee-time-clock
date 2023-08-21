import React, { useState } from 'react';
import Keypad from './components/Keypad';

const App: React.FC = () => {
  const [time, setTime] = useState('');

  const handleKeyPress = (key: string) => {
    setTime(time + key);
  };

  const handleClockIn = () => {
    console.log(`Employee clocked in at ${time}`);
    setTime('');
  };

  return (
    <div>
      <h1>Employee Time Clock</h1>
      <div>Time: {time}</div>
      <Keypad onKeyPress={handleKeyPress} />
      <button onClick={handleClockIn}>Clock In</button>
    </div>
  );
};

export default App;
