import React, { useState, useEffect, useRef } from 'react';
import Keypad from './components/Keypad';
import TimeCard from './components/TimeCard';
import CreateAdmin from './components/CreateAdmin';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timeClockContainerRef = useRef<HTMLDivElement>(null); // Ref to the timeClockContainer
  const [showLogin, setShowLogin] = useState(false); // State to control showing login
  const [showLoginButton, setShowLoginButton] = useState(false); // State to control showing login button
  const [showCreateAdmin, setShowCreateAdmin] = useState(false); // State to control showing createAdmin
  const [pin, setPin] = useState(''); // State to store the PIN
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString()); // State to store the current time
  // State to store the time card records
  const [timeCardRecords, setTimeCardRecords] = useState<{ id: number; name: string; pin: string; action: string; time: string }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
  
    return () => clearInterval(timer);
  }, []);
  
  // Effect to check if the user is logged in
  useEffect(() => {
    fetch('/is-logged-in')
      .then((response) => response.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn);
        if (!data.isLoggedIn) {
          fetch('/get-users?=' + currentTime)
            .then((response) => response.json())
            .then((users) => {
              if (users.length === 0) {
                setShowCreateAdmin(true);
              } else {
                fetch('/get-records?=' + currentTime)
                  .then((response) => response.json())
                  .then((records) => {
                    setShowLoginButton(true);
                    setTimeCardRecords(records);
                  })
                  .catch((error) => console.error('Error checking records:', error));
              }
            })
        }
      })
      .catch((error) => console.error('Error checking login status:', error));
  }, [setIsLoggedIn, setTimeCardRecords]);

  // State to track the last interaction time
  const [lastInteractionTime, setLastInteractionTime] = useState(new Date());

  // Handle user interactions
  const handleInteraction = () => {
    setLastInteractionTime(new Date());
  };

  // Use an effect to set up the inactivity timer and handle user interactions
  useEffect(() => {
    // Function to log the user out
    const logout = () => {
      fetch('/logout').then(() => {
        setShowLoginButton(true);
        window.location.reload(); // Reload the app to reflect changes
      });
    };

    // Set up a timer to log out after 30 minutes of inactivity
    const logoutTimer = setTimeout(() => {
      const now = new Date();
      const timeDiff = now.getTime() - lastInteractionTime.getTime(); // Time difference in milliseconds

      if (timeDiff >= 30 * 60 * 1000) { // 30 minutes in milliseconds
        logout();
      }
    }, 30 * 60 * 1000);

    // Set up event listeners for user interactions
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [lastInteractionTime]); // Re-run the effect when the last interaction time changes

  const handleKeyPress = (key: string) => {
    setPin(pin + key);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if the key is a number
    if (!isNaN(Number(e.key))) {
      handleKeyPress(e.key);
    }
    // Check if the key is backspace or delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      handleBackspace();
    }
  };
  const handleBackspace = () => {
    setPin(pin.slice(0, -1)); // Remove the last character from the PIN
  };
  const handleClear = () => {
    setPin(''); // Clear the entire PIN
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
    fetch('/add-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, action: record.action, time: record.time })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => Promise.reject(error));
        }
        return response.json();
      })
      .then((data) => {
        setTimeCardRecords([...timeCardRecords, { id: data.id, name: data.name, pin, action: record.action, time: record.time }]);
      })
      .catch((error) => {
        console.error('Error adding record:', error.error);
        showMessageToUser('Error adding record: ' + error.error);
    });
  };

  function showMessageToUser(message: string) {
    const messageContainer = document.getElementById('message-container');
    const errorMessage = document.createElement('p');
    errorMessage.id = 'error-message';
    errorMessage.textContent = message;
    messageContainer?.appendChild(errorMessage);
  
    // Add the "show" class to make the message appear
    errorMessage.classList.add('show');
  
    // Remove the message after 3 seconds
    setTimeout(() => {
      errorMessage.classList.add('hide');
      setTimeout(() => { messageContainer?.removeChild(errorMessage); }, 1000);
    }, 3000);
  }  

  const onLoginSuccess = () => {
    setShowLogin(false);
    setShowLoginButton(false);
    setIsLoggedIn(true);
  };

  const onCreateAdminSuccess = () => {
    setShowCreateAdmin(false);
    setShowLoginButton(false);
    setIsLoggedIn(true);
  };

  { !showCreateAdmin && !showLogin && timeClockContainerRef.current?.focus(); }

  // Return the JSX
  return (
    <div className="time-clock-container" ref={timeClockContainerRef} onKeyDown={handleKeyDown} tabIndex={0}>
      <Login showLogin={showLogin} onLoginSuccess={onLoginSuccess} />
      {showCreateAdmin && !isLoggedIn && <CreateAdmin onCreateSuccess={onCreateAdminSuccess} />}
      <h1>Employee Time Clock</h1>
      <div id="currentTime">Current Time: {currentTime}</div>
      <div className="pin-entry">
        <div id="currentPin">Enter Your PIN: {pin}</div>
        <button className="clear-button" onClick={handleClear}>Clear</button>
      </div>
      <div id="message-container"></div>
      <div className="main-container">
        <Keypad onKeyPress={handleKeyPress} />
      </div>
      <div className="action-buttons">
        <button onClick={() => handleActionClick('clockIn')}>Clock In</button>
        <button onClick={() => handleActionClick('clockOut')}>Clock Out</button>
        <button onClick={() => handleActionClick('startBreak')}>Start Break</button>
        <button onClick={() => handleActionClick('endBreak')}>End Break</button>
      </div>
      {showLoginButton && !isLoggedIn && <button id="loginButton" onClick={() => setShowLogin(true)}>
        Login as an administrator to see and download time cards</button>}
      {isLoggedIn && <hr></hr>}
      {isLoggedIn && <TimeCard records={timeCardRecords} />}
      {isLoggedIn && <button id="logoutButton" onClick={() => { setShowLoginButton(true); setIsLoggedIn(false); }}>Logout</button>}
    </div>
  );
};

export default App;