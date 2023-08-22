import React, { useState, useEffect } from 'react';
import Keypad from './components/Keypad';
import TimeCard from './components/TimeCard';

const App: React.FC = () => {
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [timeCardRecords, setTimeCardRecords] = useState<{ pin: string; records: { action: string; time: string }[] }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (key: string) => {
    setPin(pin + key);
  };

  const handleActionClick = (selectedAction: 'clockIn' | 'clockOut' | 'startBreak' | 'endBreak') => {
    // Flash Red and exit the function if the pin is empty
    if (pin === '') {
      let currentPin = document.getElementById('currentPin');
      currentPin.style.borderColor = '#ff7866'; // red
      setTimeout(() => {currentPin.style.borderColor = 'gainsboro';}, 250); // grey
      setTimeout(() => {currentPin.style.borderColor = '#ff7866'; }, 500); // red
      setTimeout(() => {currentPin.style.borderColor = 'gainsboro'; }, 750); // grey
      return;
    }
  
    const record = { action: selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1), time: currentTime };
    const existingRecord = timeCardRecords.find((rec) => rec.pin === pin);
    if (existingRecord) {
      existingRecord.records.push(record);
      setTimeCardRecords([...timeCardRecords]);
    } else {
      setTimeCardRecords([...timeCardRecords, { pin, records: [record] }]);
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
