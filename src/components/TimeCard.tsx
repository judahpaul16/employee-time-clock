import React from 'react';

interface Record {
  id: number;
  pin: string;
  action: string;
  time: string;
}

interface TimeCardProps {
  records: Record[];
}

const TimeCard: React.FC<TimeCardProps> = ({ records }) => {
  // Group the records by PIN
  const groupedRecords: { [pin: string]: Record[] } = {};
  records.forEach((record) => {
    if (!groupedRecords[record.pin]) {
      groupedRecords[record.pin] = [];
    }
    groupedRecords[record.pin].push(record);
  });

  return (
    <div className="time-card">
      <h2>Today's Time Cards</h2>
      {Object.keys(groupedRecords).map((pin, index) => (
        <div key={index}>
          <h3>PIN: {pin}</h3>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {groupedRecords[pin].map((record, idx) => (
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
