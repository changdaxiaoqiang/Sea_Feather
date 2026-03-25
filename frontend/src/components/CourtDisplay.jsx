import React from 'react';

const CourtDisplay = ({ courts = [], allCourts = [1, 2, 3, 5, 6], size = 'normal' }) => {
  const isOccupied = (court) => courts.includes(court);

  return (
    <div className="flex flex-wrap gap-3">
      {allCourts.map((courtNum) => (
        <div
          key={courtNum}
          className={`court-badge ${isOccupied(courtNum) ? 'occupied' : 'vacant'}`}
        >
          <span className="relative z-10">{courtNum}号</span>
          {isOccupied(courtNum) && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/80 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};

export default CourtDisplay;