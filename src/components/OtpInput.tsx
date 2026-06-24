"use client";

import { useRef } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

export default function OtpInput({
  value,
  onChange,
  onComplete,
  length = 4,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (code: string) => void;
  length?: number;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const boxWidth = length > 4 ? 42 : 52;

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "")) {
      onComplete?.(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
      {Array.from({ length }).map((_, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            refs.current[index] = el;
          }}
          value={value[index] ?? ""}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, digit);
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          sx={{
            width: boxWidth,
            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
          }}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 1,
              style: { textAlign: "center", fontSize: "1.4rem", fontWeight: 600, padding: "14px 0" },
            },
          }}
        />
      ))}
    </Stack>
  );
}
