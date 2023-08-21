import React, { useState, useEffect } from 'react';
import Keypad from './components/Keypad';

const App: React.FC = () => {
  const [pin, setPin] = useState('');
  const [action, setAction] = useState<'clockIn' | 'clockOut' | 'startBreak' | 'endBreak'>('clockIn');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer); // Clear the interval when the component unmounts
  }, []);

  const handleKeyPress = (key: string) => {
    setPin(pin + key);
  };

  const handleAction = (time: string) => {
    switch (action) {
      case 'clockIn':
        console.log(`Employee clocked in at ${time}`);
        break;
      case 'clockOut':
        console.log(`Employee clocked out at ${time}`);
        break;
      case 'startBreak':
        console.log(`Employee started break at ${time}`);
        break;
      case 'endBreak':
        console.log(`Employee ended break at ${time}`);
        break;
    }
    setPin('');
  };

  return (
    <div className="time-clock-container">
      <h1>Employee Time Clock</h1>
      <div id="currentTime">Current Time: {currentTime}</div>
      <div id="currentPin">Enter Your PIN: {pin}</div>
      <div className="main-container">
        <Keypad onKeyPress={handleKeyPress} />
      </div>
      <div className="action-buttons">
        <button onClick={() => setAction('clockIn')}>Clock In</button>
        <button onClick={() => setAction('clockOut')}>Clock Out</button>
        <button onClick={() => setAction('startBreak')}>Start Break</button>
        <button onClick={() => setAction('endBreak')}>End Break</button>
      </div>
    </div>
  );
};

export default App;
