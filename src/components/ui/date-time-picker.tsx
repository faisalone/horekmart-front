"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({ 
  date, 
  onDateChange, 
  placeholder = "MM/DD/YYYY hh:mm aa", 
  className,
  disabled 
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = date ? new Date(date) : new Date();
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      onDateChange?.(newDate);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      const now = new Date();
      const isToday = newDate.toDateString() === now.toDateString();
      
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? (currentHours % 12) + 12 : (currentHours % 12)
        );
      }
      
      // If selecting today's date, ensure the time is at least 30 minutes from now
      if (isToday) {
        const minimumTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
        if (newDate < minimumTime) {
          // Set to minimum allowed time
          onDateChange?.(minimumTime);
          return;
        }
      }
      
      onDateChange?.(newDate);
    }
  };

  // Helper function to check if hour/minute/ampm should be disabled
  const isTimeDisabled = (type: "hour" | "minute" | "ampm", value: string | number) => {
    if (!date) return false;
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (!isToday) return false;
    
    const minimumTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    const testDate = new Date(date);
    
    if (type === "hour") {
      const hour = parseInt(value.toString());
      testDate.setHours((hour % 12) + (testDate.getHours() >= 12 ? 12 : 0));
    } else if (type === "minute") {
      testDate.setMinutes(parseInt(value.toString()));
    } else if (type === "ampm") {
      const currentHours = testDate.getHours();
      testDate.setHours(
        value === "PM" ? (currentHours % 12) + 12 : (currentHours % 12)
      );
    }
    
    return testDate < minimumTime;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white",
              date ? "pr-10" : "pr-4",
              !date && "text-gray-300",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-300 flex-shrink-0" />
            <span className={cn("flex-1 truncate", date ? "pr-3" : "")}>
              {date ? (
                format(date, "MM/dd/yyyy hh:mm aa")
              ) : (
                placeholder
              )}
            </span>
          </Button>
          {date && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDateChange?.(undefined);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-gray-700/50 z-10"
              title="Clear schedule"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
        <div className="sm:flex bg-gray-800">
          <div className="p-3 bg-gray-800 border-r border-gray-600">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="bg-gray-800"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x divide-gray-600 bg-gray-800">
            <ScrollArea className="w-64 sm:w-auto bg-gray-800">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => {
                  const isDisabled = isTimeDisabled("hour", hour);
                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() % 12 === hour % 12
                          ? "default"
                          : "ghost"
                      }
                      disabled={isDisabled}
                      className={cn(
                        "sm:w-full shrink-0 aspect-square text-white hover:bg-gray-700 hover:text-white",
                        date && date.getHours() % 12 === hour % 12
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-700",
                        isDisabled && "opacity-30 cursor-not-allowed hover:bg-gray-800"
                      )}
                      onClick={() => !isDisabled && handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto bg-gray-800">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  const isDisabled = isTimeDisabled("minute", minute);
                  return (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      disabled={isDisabled}
                      className={cn(
                        "sm:w-full shrink-0 aspect-square text-white hover:bg-gray-700 hover:text-white",
                        date && date.getMinutes() === minute
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-700",
                        isDisabled && "opacity-30 cursor-not-allowed hover:bg-gray-800"
                      )}
                      onClick={() =>
                        !isDisabled && handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="bg-gray-800">
              <div className="flex sm:flex-col p-2">
                {["AM", "PM"].map((ampm) => {
                  const isDisabled = isTimeDisabled("ampm", ampm);
                  return (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      disabled={isDisabled}
                      className={cn(
                        "sm:w-full shrink-0 aspect-square text-white hover:bg-gray-700 hover:text-white",
                        date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-700",
                        isDisabled && "opacity-30 cursor-not-allowed hover:bg-gray-800"
                      )}
                      onClick={() => !isDisabled && handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
