import { useState, useCallback } from "react";
import { CalcButton } from "./CalcButton";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = useCallback((n: string) => {
    setDisplay((d) => {
      if (resetNext || d === "0") {
        setResetNext(false);
        return n;
      }
      return d.length < 12 ? d + n : d;
    });
  }, [resetNext]);

  const handleDecimal = useCallback(() => {
    setDisplay((d) => {
      if (resetNext) {
        setResetNext(false);
        return "0.";
      }
      return d.includes(".") ? d : d + ".";
    });
  }, [resetNext]);

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const handleOperator = useCallback((operator: string) => {
    const current = parseFloat(display);
    if (prev !== null && op && !resetNext) {
      const result = calculate(parseFloat(prev), current, op);
      const resultStr = String(parseFloat(result.toFixed(10)));
      setDisplay(resultStr);
      setPrev(resultStr);
    } else {
      setPrev(display);
    }
    setOp(operator);
    setResetNext(true);
  }, [display, prev, op, resetNext]);

  const handleEquals = useCallback(() => {
    if (prev === null || !op) return;
    const result = calculate(parseFloat(prev), parseFloat(display), op);
    const resultStr = String(parseFloat(result.toFixed(10)));
    setDisplay(resultStr);
    setPrev(null);
    setOp(null);
    setResetNext(true);
  }, [display, prev, op]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setResetNext(false);
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay((d) => d === "0" ? d : String(-parseFloat(d)));
  }, []);

  const handlePercent = useCallback(() => {
    setDisplay((d) => String(parseFloat(d) / 100));
  }, []);

  const fontSize = display.length > 9 ? "text-3xl" : display.length > 6 ? "text-5xl" : "text-6xl";

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl shadow-black/40">
        {/* Display */}
        <div className="text-right mb-6 px-2 min-h-[5rem] flex flex-col justify-end">
          {prev && op && (
            <span className="text-muted-foreground text-sm mb-1 block">
              {prev} {op}
            </span>
          )}
          <span className={`font-light tracking-tight text-foreground ${fontSize} break-all leading-tight`}>
            {display}
          </span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <CalcButton variant="function" onClick={handleClear}>AC</CalcButton>
          <CalcButton variant="function" onClick={handleToggleSign}>+/−</CalcButton>
          <CalcButton variant="function" onClick={handlePercent}>%</CalcButton>
          <CalcButton variant="operator" active={op === "÷" && resetNext} onClick={() => handleOperator("÷")}>÷</CalcButton>

          <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
          <CalcButton variant="operator" active={op === "×" && resetNext} onClick={() => handleOperator("×")}>×</CalcButton>

          <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
          <CalcButton variant="operator" active={op === "−" && resetNext} onClick={() => handleOperator("−")}>−</CalcButton>

          <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
          <CalcButton variant="operator" active={op === "+" && resetNext} onClick={() => handleOperator("+")}>+</CalcButton>

          <CalcButton className="col-span-2" onClick={() => handleNumber("0")}>0</CalcButton>
          <CalcButton onClick={handleDecimal}>.</CalcButton>
          <CalcButton variant="operator" onClick={handleEquals}>=</CalcButton>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
