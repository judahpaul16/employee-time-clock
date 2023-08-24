import { response } from 'express';
import React, { useState } from 'react';

interface CreateAdminProps {
  onCreateSuccess: () => void;
}

const CreateAdmin: React.FC<CreateAdminProps> = ({ onCreateSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

    fetch('/add-user', {
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
        <h1>Create Admin</h1>
        <div>
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
        {error && <div className="login-error">{error}</div>}
        <button onClick={handleCreateAdmin}>Create Admin</button>
      </div>
    </div>
  );
};

export default CreateAdmin;
