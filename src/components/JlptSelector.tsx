import React from "react";
import { JLPTLevel } from "../types";

interface JlptSelectorProps {
  selectedLevel: JLPTLevel;
  onLevelChange: (level: JLPTLevel) => void;
}

const JlptSelector: React.FC<JlptSelectorProps> = ({
  selectedLevel,
  onLevelChange,
}) => {
  return (
    <div>
      <label
        htmlFor="jlpt-level"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Your JLPT Level
      </label>
      <div className="mt-1 grid grid-cols-5 gap-2">
        {Object.values(JLPTLevel).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              selectedLevel === level
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JlptSelector;
