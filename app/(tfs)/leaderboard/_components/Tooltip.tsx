import { FC } from 'react';
import { format, parseISO } from 'date-fns';

type TooltipProps = {
  date: string;
  count: number;
};

export const Tooltip: FC<TooltipProps> = ({ date, count }) => {
  return (
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
      <div>
        <strong>{count} contributions</strong>
      </div>
      <div>{format(parseISO(date), 'EEE, MMM d, yyyy')}</div>
    </div>
  );
};
