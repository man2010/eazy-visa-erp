"use client"

import * as React from "react"
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"
import { fr } from "date-fns/locale"

import { cn } from "./utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const handleRangeSelect = (value: string) => {
        const now = new Date();
        let from: Date | undefined;
        let to: Date | undefined = now;

        switch (value) {
            case "today":
                from = startOfDay(now);
                to = endOfDay(now);
                break;
            case "yesterday":
                from = startOfDay(subDays(now, 1));
                to = endOfDay(subDays(now, 1));
                break;
            case "last7days":
                from = startOfDay(subDays(now, 6));
                break;
            case "last30days":
                from = startOfDay(subDays(now, 29));
                break;
            case "thisMonth":
                from = startOfMonth(now);
                break;
            case "lastMonth":
                from = startOfMonth(subMonths(now, 1));
                to = endOfMonth(subMonths(now, 1));
                break;
            case "thisYear":
                from = startOfYear(now);
                break;
            case "custom":
                return;
            default:
                break;
        }

        if (from) {
            setDate({ from, to });
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Select onValueChange={handleRangeSelect}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="yesterday">Hier</SelectItem>
                    <SelectItem value="last7days">7 derniers jours</SelectItem>
                    <SelectItem value="last30days">30 derniers jours</SelectItem>
                    <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
                    <SelectItem value="lastMonth">Mois dernier</SelectItem>
                    <SelectItem value="thisYear">Cette année</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y", { locale: fr })} -{" "}
                                    {format(date.to, "LLL dd, y", { locale: fr })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y", { locale: fr })
                            )
                        ) : (
                            <span>Sélectionner une période</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(range) => setDate(range)}
                        numberOfMonths={2}
                        locale={fr}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
