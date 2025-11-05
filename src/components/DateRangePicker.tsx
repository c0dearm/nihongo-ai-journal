import React from "react";
import { CalendarIcon } from "./Icons";

const DateRangePicker = React.forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <div className="relative w-full cursor-pointer" onClick={onClick} ref={ref}>
    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="text"
      className="w-full pl-12 pr-8 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
      value={value}
      readOnly
      placeholder="Select a date range"
    />
  </div>
));

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
