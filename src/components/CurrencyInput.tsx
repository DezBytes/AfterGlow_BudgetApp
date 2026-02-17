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
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        // Prevent multiple decimal points
        const parts = raw.split(".");
        const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
        onChange(sanitized);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={className}
    />
  );
}
