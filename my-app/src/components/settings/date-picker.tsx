"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const selectedDate = value ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(parseISO(value), "PPP") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date:Date|undefined) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"))
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
