import React from 'react';

interface TimeCardProps {
  records: { pin: string; records: { action: string; time: string }[] }[];
}

const TimeCard: React.FC<TimeCardProps> = ({ records }) => {
  return (
    <div className="time-card">
      <h2>Time Cards</h2>
      {records.map((recordGroup, index) => (
        <div key={index}>
          <h3>PIN: {recordGroup.pin}</h3>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recordGroup.records.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.action}</td>
                  <td>{record.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TimeCard;
