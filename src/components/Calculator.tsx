'use client';

import { useCallback, useMemo, useState } from "react";
import styles from "./Calculator.module.css";

type Operator = "÷" | "×" | "-" | "+";

type ButtonConfig = {
  label: string;
  variant?: "operator" | "control";
  span?: number;
  onClick: (handlePress: CalculatorHandlers) => void;
};

type CalculatorHandlers = {
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  clear: () => void;
  toggleSign: () => void;
  inputPercent: () => void;
  applyOperator: (operator: Operator) => void;
  evaluate: () => void;
};

const operators: Operator[] = ["÷", "×", "-", "+"];

const buttonLayout: ButtonConfig[] = [
  { label: "AC", variant: "control", onClick: (h) => h.clear() },
  { label: "+/-", variant: "control", onClick: (h) => h.toggleSign() },
  { label: "%", variant: "control", onClick: (h) => h.inputPercent() },
  { label: "÷", variant: "operator", onClick: (h) => h.applyOperator("÷") },
  { label: "7", onClick: (h) => h.inputDigit("7") },
  { label: "8", onClick: (h) => h.inputDigit("8") },
  { label: "9", onClick: (h) => h.inputDigit("9") },
  { label: "×", variant: "operator", onClick: (h) => h.applyOperator("×") },
  { label: "4", onClick: (h) => h.inputDigit("4") },
  { label: "5", onClick: (h) => h.inputDigit("5") },
  { label: "6", onClick: (h) => h.inputDigit("6") },
  { label: "-", variant: "operator", onClick: (h) => h.applyOperator("-") },
  { label: "1", onClick: (h) => h.inputDigit("1") },
  { label: "2", onClick: (h) => h.inputDigit("2") },
  { label: "3", onClick: (h) => h.inputDigit("3") },
  { label: "+", variant: "operator", onClick: (h) => h.applyOperator("+") },
  { label: "0", span: 2, onClick: (h) => h.inputDigit("0") },
  { label: ".", onClick: (h) => h.inputDecimal() },
  { label: "=", variant: "operator", onClick: (h) => h.evaluate() },
];

const MAX_DISPLAY_LENGTH = 12;

const isOperator = (value: string): value is Operator =>
  (operators as string[]).includes(value);

const formatResult = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const absValue = Math.abs(value);

  if (absValue === 0) {
    return "0";
  }

  if (absValue >= 1e12 || absValue < 1e-9) {
    return value.toExponential(6).replace(/\.?0+e/, "e").replace(/e\+?/, "e");
  }

  const fixed = value.toPrecision(12);
  const normalized = parseFloat(fixed).toString();

  return normalized.length > MAX_DISPLAY_LENGTH
    ? value.toExponential(6).replace(/\.?0+e/, "e").replace(/e\+?/, "e")
    : normalized;
};

const performOperation = (left: number, operator: Operator, right: number) => {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? Number.NaN : left / right;
    default: {
      const _exhaustive: never = operator;
      return _exhaustive;
    }
  }
};

export function Calculator() {
  const [displayValue, setDisplayValue] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const isError = displayValue === "Error";

  const reset = useCallback(() => {
    setDisplayValue("0");
    setStoredValue(null);
    setPendingOperator(null);
    setOverwrite(false);
  }, []);

  const applyNewValue = useCallback(
    (value: number) => {
      const formatted = formatResult(value);
      if (formatted === "Error") {
        setDisplayValue("Error");
        setStoredValue(null);
        setPendingOperator(null);
        setOverwrite(true);
        return;
      }

      setDisplayValue(formatted);
      setOverwrite(true);
    },
    []
  );

  const inputDigit = useCallback(
    (digit: string) => {
      if (isError) {
        reset();
      }

      setDisplayValue((current) => {
        if (overwrite || current === "0") {
          setOverwrite(false);
          return digit === "0" ? "0" : digit;
        }

        if (current.length >= MAX_DISPLAY_LENGTH) {
          return current;
        }

        return current + digit;
      });
    },
    [isError, overwrite, reset]
  );

  const inputDecimal = useCallback(() => {
    if (isError) {
      reset();
    }

    setDisplayValue((current) => {
      if (overwrite) {
        setOverwrite(false);
        return "0.";
      }

      if (current.includes(".")) {
        return current;
      }

      if (current.length >= MAX_DISPLAY_LENGTH) {
        return current;
      }

      return `${current}.`;
    });
  }, [isError, overwrite, reset]);

  const toggleSign = useCallback(() => {
    if (isError) {
      reset();
      return;
    }

    setDisplayValue((current) =>
      current.startsWith("-") ? current.slice(1) : current === "0" ? "0" : `-${current}`
    );
  }, [isError, reset]);

  const inputPercent = useCallback(() => {
    if (isError) {
      reset();
      return;
    }

    const currentValue = parseFloat(displayValue);
    if (Number.isNaN(currentValue)) {
      return;
    }

    applyNewValue(currentValue / 100);
  }, [applyNewValue, displayValue, isError, reset]);

  const applyOperator = useCallback(
    (operator: Operator) => {
      if (isError) {
        reset();
        return;
      }

      const currentValue = parseFloat(displayValue);

      if (storedValue === null) {
        setStoredValue(currentValue);
      } else if (pendingOperator) {
        const result = performOperation(storedValue, pendingOperator, currentValue);
        if (Number.isNaN(result)) {
          setDisplayValue("Error");
          setStoredValue(null);
          setPendingOperator(null);
          setOverwrite(true);
          return;
        }

        setStoredValue(result);
        setDisplayValue(formatResult(result));
      }

      setPendingOperator(operator);
      setOverwrite(true);
    },
    [displayValue, isError, pendingOperator, reset, storedValue]
  );

  const evaluate = useCallback(() => {
    if (isError) {
      reset();
      return;
    }

    if (pendingOperator === null || storedValue === null) {
      setOverwrite(true);
      return;
    }

    const currentValue = parseFloat(displayValue);
    const result = performOperation(storedValue, pendingOperator, currentValue);

    if (Number.isNaN(result)) {
      setDisplayValue("Error");
      setStoredValue(null);
      setPendingOperator(null);
      setOverwrite(true);
      return;
    }

    setDisplayValue(formatResult(result));
    setStoredValue(null);
    setPendingOperator(null);
    setOverwrite(true);
  }, [displayValue, isError, pendingOperator, reset, storedValue]);

  const handlers = useMemo<CalculatorHandlers>(
    () => ({
      inputDigit,
      inputDecimal,
      clear: reset,
      toggleSign,
      inputPercent,
      applyOperator,
      evaluate,
    }),
    [applyOperator, evaluate, inputDecimal, inputDigit, inputPercent, reset, toggleSign]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.display} data-error={displayValue === "Error"}>
        {displayValue}
      </div>
      <div className={styles.grid}>
        {buttonLayout.map(({ label, variant, span, onClick }) => (
          <button
            key={label}
            className={styles.button}
            data-variant={variant ?? "default"}
            data-span={span ?? 1}
            onClick={() => onClick(handlers)}
            aria-label={isOperator(label) ? `Operate ${label}` : label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

