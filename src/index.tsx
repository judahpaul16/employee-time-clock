import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/css/styles.css';
import Keypad from './components/Keypad';
import TimeCard from './components/TimeCard';
import CreateAdmin from './components/CreateAdmin';
import AddEmployee from './components/AddEmployee';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const timeClockContainerRef = useRef<HTMLDivElement>(null); // Ref to the timeClockContainer
  const [showLogin, setShowLogin] = useState(false); // State to control showing login
  const [showLoginButton, setShowLoginButton] = useState(false); // State to control showing login button
  const [showCreateAdmin, setShowCreateAdmin] = useState(false); // State to control showing createAdmin
  const [pin, setPin] = useState(''); // State to store the PIN
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString()); // State to store the current time
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  // State to store the time card records
  const [timeCardRecords, setTimeCardRecords] = useState<{ id: number; name: string; pin: string; action: string; time: string; ip: string }[]>([]);
  const [employeeStatus, setEmployeeStatus] = useState<{ [pin: string]: string }>({});
  const isOverlayShowing = showCreateAdmin || showLogin || showAddEmployee;

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
    if (pin.length < 6 && key.trim() !== '' && !isNaN(Number(key))) {
      setPin(pin + key);
    }
  };  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if the key is a number
    if (!isNaN(Number(e.key)) && !isOverlayShowing) {
      handleKeyPress(e.key);
    }
    // Check if the key is backspace or delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      handleBackspace();
    }
    // Check if the key is Enter and an overlay is showing
    if (e.key === 'Enter' && isOverlayShowing) {
      if (showLogin) {
        let loginButton = document.getElementById('login');
        loginButton?.click();
      }
      if (showCreateAdmin) {
        let createAdminButton = document.getElementById('createAdmin');
        createAdminButton?.click();
      }
      if (showAddEmployee) {
        let addEmployeeButton = document.getElementById('addEmployee');
        addEmployeeButton?.click();
      }
    }
  };  

  const handleBackspace = () => {
    setPin(pin.slice(0, -1)); // Remove the last character from the PIN
  };

  const handleClear = () => {
    setPin(''); // Clear the entire PIN
  };
  

  const handleActionClick = async (selectedAction: 'clockIn' | 'clockOut' | 'startBreak' | 'endBreak') => {
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

    // Implementing the clock-in/clock-out logic
    const lastAction = employeeStatus[pin];
    if (
      (selectedAction === 'clockIn' && lastAction !== 'clockOut' && lastAction !== undefined) ||
      (selectedAction === 'clockOut' && lastAction !== 'clockIn') ||
      (selectedAction === 'startBreak' && lastAction !== 'clockIn') ||
      (selectedAction === 'endBreak' && lastAction !== 'startBreak')
    ) {
      let message = `Invalid action: ${selectedAction}, Last Action: ${lastAction}`;
      if (selectedAction === 'clockOut' && !lastAction) message = 'You must clock in before you can clock out';
      if (selectedAction === 'startBreak' && !lastAction) message = 'You must clock in before you can start a break';
      if (selectedAction === 'endBreak' && !lastAction) message = 'You must start a break before you can end it';
      showMessageToUser(message, 'error');
      return;
    }

    const record = { action: selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1), time: currentTime };

    let ipResponse = await fetch('https://api.ipify.org?format=json');
    let ipData = await ipResponse.json();
    let ip = ipData.ip;

    fetch('/add-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, action: record.action, time: record.time, ip: ip })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => Promise.reject(error));
        }
        return response.json();
      })
      .then((data) => {
        // Success, update the last action for this PIN
        setEmployeeStatus({
          ...employeeStatus,
          [pin]: selectedAction,
        });
        setTimeCardRecords([...timeCardRecords, { id: data.id, name: data.name, pin, action: record.action, time: record.time, ip: ip }]);
        setPin(''); // Clearing the PIN
        showMessageToUser('Time recorded successfully', 'success');
      })
      .catch((error) => {
        console.error('Error adding record:', error.error);
        showMessageToUser('Error adding record: ' + error.error, 'error');
      });      
  };

  function showMessageToUser(text: string, type: 'success' | 'error' | 'warning' | 'info') {
    const messageContainer = document.getElementById('message-container');
    const message = document.createElement('p');
    message.classList.add(`${type}-message`);
    message.textContent = text;
    messageContainer?.appendChild(message);
  
    // Add the "show" class to make the message appear
    message.classList.add('show');
  
    // Remove the message after 3 seconds
    setTimeout(() => {
      message.classList.add('hide');
      setTimeout(() => { messageContainer?.removeChild(message); }, 1000);
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

  const onAddEmployeeSuccess = () => {
    setShowAddEmployee(false);
    showMessageToUser('Employee added successfully', 'success');
  };

  const onCloseOverlay = () => {
    setShowLogin(false);
    setShowCreateAdmin(false);
    setShowAddEmployee(false);
  };

  // Focus on the time clock container when the app first loads
  useEffect(() => {
    if (!showCreateAdmin && !showLogin) {
      timeClockContainerRef.current?.focus();
    }
  }, [showCreateAdmin, showLogin]);
  

  // Return the JSX
  return (
    <div className="time-clock-container" ref={timeClockContainerRef} onKeyDown={handleKeyDown} tabIndex={0}>
      <Login showLogin={showLogin} onLoginSuccess={onLoginSuccess} onCloseOverlay={onCloseOverlay} />
      {showAddEmployee && isLoggedIn && <AddEmployee onAddSuccess={onAddEmployeeSuccess} onCloseOverlay={onCloseOverlay} />}
      {showCreateAdmin && !isLoggedIn && <CreateAdmin onCreateSuccess={onCreateAdminSuccess} onCloseOverlay={onCloseOverlay} />}
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
      {!isOverlayShowing && isLoggedIn && <button id="downloadButton" onClick={() => { window.open('/download-records'); }}>Download All Records</button>}
      {!isOverlayShowing && isLoggedIn && <button id="addEmployeeButton" onClick={() => { setShowAddEmployee(true) }}>Add New Employee</button>}
      {!isOverlayShowing && isLoggedIn && <button id="logoutButton" onClick={() => { setShowLoginButton(true); setIsLoggedIn(false); }}>Logout</button>}
    </div>
  );
};

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);

export default App;