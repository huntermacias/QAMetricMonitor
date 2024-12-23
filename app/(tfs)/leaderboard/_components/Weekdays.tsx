import { FC } from 'react';

export const Weekdays: FC = () => {
  const days = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="flex flex-col space-y-5 mr-2 mt-6">
      {days.map((day, index) => (
        <div key={index} className="text-xs text-gray-500 h-4">
          {day}
        </div>
      ))}
    </div>
  );
};
