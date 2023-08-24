
import React, { useState } from 'react';

interface AddEmployeeProps {
    onAddSuccess: () => void;
    onCloseOverlay: () => void;
  }
  
  const AddEmployee: React.FC<AddEmployeeProps> = ({ onAddSuccess, onCloseOverlay }) => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
  
    const MIN_NAME_LENGTH = 2; 
    const PIN_LENGTH = 4;
  
    const handleAddEmployee = async () => {
      if (name.length < MIN_NAME_LENGTH) {
        setError(`Name must be at least ${MIN_NAME_LENGTH} characters long`);
        return;
      }
      if (pin.length !== PIN_LENGTH) {
        setError(`PIN must be exactly ${PIN_LENGTH} digits long`);
        return;
      }
  
      fetch('/add-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id) {
            onAddSuccess();
          } else {
            setError('Error adding employee: ' + data.error);
          }
        })
        .catch((error) => setError('Error adding employee: ' + error));
    };
  
    return (
      <div className="employee-overlay">
        <div className="employee-container">
            <button className="close-btn" onClick={onCloseOverlay}>X</button>
          <h1>Add an Employee</h1>
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="PIN (4 digits)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={PIN_LENGTH}
            />
          </div>
          {error && <div className="employee-error">{error}</div>}
          <button onClick={handleAddEmployee}>Add Employee</button>
        </div>
      </div>
    );
  };
  
  export default AddEmployee;
  