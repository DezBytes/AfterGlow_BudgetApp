"use client";

import { useState, useRef } from "react";

interface CurrencyInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

function formatWithCommas(v: string): string {
  const num = parseFloat(v);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: v.includes(".") ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = focused ? value : formatWithCommas(value);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      placeholder={placeholder}
      onChange={(e) => {
        // Strip everything except digits, dots, and minus
        const raw = e.target.value.replace(/[^0-9.\-]/g, "");
        onChange(raw);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={className}
    />
  );
}
