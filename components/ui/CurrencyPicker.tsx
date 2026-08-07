"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const currencies = [
  { label: "USD ($) - US Dollar", value: "USD" },
  { label: "ETB (Br) - Ethiopian Birr", value: "ETB" },
  { label: "EUR (€) - Euro", value: "EUR" },
  { label: "GBP (£) - British Pound", value: "GBP" },
  { label: "CAD ($) - Canadian Dollar", value: "CAD" },
  { label: "AUD ($) - Australian Dollar", value: "AUD" },
  { label: "KES (KSh) - Kenyan Shilling", value: "KES" },
];

interface CurrencyPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function CurrencyPicker({ value, onChange }: CurrencyPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-left text-sm font-mono shadow-sm"
      >
        <span className="truncate">
          {value ? currencies.find((c) => c.value === value)?.label : "Select currency..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-70 p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.value}
                  value={currency.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue.toUpperCase());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === currency.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {currency.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}