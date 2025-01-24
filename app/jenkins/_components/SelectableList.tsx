import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectableListProps {
  items: string[];
  title: string;
}

const SelectableList: React.FC<SelectableListProps> = ({ items, title }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl text-white font-semibold mb-2">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={item + i} className="flex items-center space-x-3">
              <Checkbox id={`checkbox-${i}`} />
              <label
                htmlFor={`checkbox-${i}`}
                className="text-sm text-purple-300 hover:underline break-all cursor-pointer"
              >
                {item}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No {title} available.</p>
      )}
    </div>
  );
};

export default SelectableList;
