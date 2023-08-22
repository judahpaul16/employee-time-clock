import React, { useState, useEffect } from 'react';
import Keypad from './components/Keypad';
import TimeCard from './components/TimeCard';

const App: React.FC = () => {
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [timeCardRecords, setTimeCardRecords] = useState<{ id: number; name: string; pin: string; action: string; time: string }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    fetch('http://localhost:3001/records')
      .then((response) => response.json())
      .then((data) => setTimeCardRecords(data))
      .catch((error) => console.error('Error fetching records:', error));

    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (key: string) => {
    setPin(pin + key);
  };

  const handleActionClick = (selectedAction: 'clockIn' | 'clockOut' | 'startBreak' | 'endBreak') => {
    // Flash red and exit early if no PIN is entered
    if (pin === '') {
      document.body.scrollTo(0, 0); // scroll up
      let currentPin = document.getElementById('currentPin');
      currentPin.style.borderColor = '#ff7866'; // red
      setTimeout(() => {currentPin.style.borderColor = 'gainsboro';}, 250); // grey
      setTimeout(() => {currentPin.style.borderColor = '#ff7866'; }, 500); // red
      setTimeout(() => {currentPin.style.borderColor = 'gainsboro'; }, 750); // grey
      return;
    }

    const record = { action: selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1), time: currentTime };
    fetch('http://localhost:3001/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, action: record.action, time: record.time })
    })
    .then((response) => response.json())
    .then((data) => {
      setTimeCardRecords([...timeCardRecords, { id: data.id, name: data.name, pin, action: record.action, time: record.time }]);
    })
    .catch((error) => console.error('Error adding record:', error));

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
        <button onClick={() => handleActionClick('clockIn')}>Clock In</button>
        <button onClick={() => handleActionClick('clockOut')}>Clock Out</button>
        <button onClick={() => handleActionClick('startBreak')}>Start Break</button>
        <button onClick={() => handleActionClick('endBreak')}>End Break</button>
      </div><hr></hr>
      <TimeCard records={timeCardRecords} />
    </div>
  );
};

export default App;
