import React, { useState } from 'react';

interface CreateAdminProps {
  onCreateSuccess: () => void;
  onCloseOverlay: () => void;
}

const CreateAdmin: React.FC<CreateAdminProps> = ({ onCreateSuccess, onCloseOverlay }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation password state
  const [error, setError] = useState('');

  const MIN_USERNAME_LENGTH = 5; // Minimum required username length
  const MIN_PASSWORD_LENGTH = 8; // Minimum required password length

  const handleCreateAdmin = async () => {
    if (username.length < MIN_USERNAME_LENGTH) {
      setError(`Username must be at least ${MIN_USERNAME_LENGTH} characters long`);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    if (password !== confirmPassword) { // Check if password and confirmPassword match
      setError('Passwords do not match');
      return;
    }

    fetch('/add-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, isAdmin: true })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) { // Check if ID is returned, which means user creation was successful
          onCreateSuccess();
        } else {
          setError('Error creating admin: ' + data.error); // Assuming error is returned as an 'error' property
        }
      })
      .catch((error) => setError('Error creating admin: ' + error));
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <button className="close-btn" onClick={onCloseOverlay}>X</button>
        <h1 id="createAcc">Create an Admin Account</h1>
        <small>This app requires an admin account.</small>
        <div id="username">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Set confirmPassword state
          />
        </div>
        {error && <div className="login-error">{error}</div>}
        <button id="createAdmin" onClick={handleCreateAdmin}>Create Admin</button>
      </div>
    </div>
  );
};

export default CreateAdmin;
