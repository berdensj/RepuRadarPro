import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "./input";

export function TimePickerDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="time"
        className="w-full"
        defaultValue="09:00"
      />
    </div>
  );
}