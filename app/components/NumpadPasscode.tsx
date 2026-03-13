import { useEffect, useMemo } from "react";

interface NumpadPasscodeProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    length?: number;
    disabled?: boolean;
    autoSubmit?: boolean;
}

export default function NumpadPasscode({
    value,
    onChange,
    onSubmit,
    length = 6,
    disabled = false,
    autoSubmit = true,
}: NumpadPasscodeProps) {
    const maskedValue = useMemo(() => {
        return Array.from({ length }, (_, i) => (value[i] ? "x" : ""));
    }, [value, length]);

    function handleDigit(digit: string) {
        if (disabled) return;
        if (value.length >= length) return;

        const next = value + digit;
        onChange(next);

        if (autoSubmit && next.length === length && onSubmit) {
            onSubmit(next);
        }
    }

    function handleBackspace() {
        if (disabled) return;
        onChange(value.slice(0, -1));
    }

    function handleClear() {
        if (disabled) return;
        onChange("");
    }

    function handleSubmit() {
        if (disabled) return;
        if (value.length !== length) return;
        onSubmit?.(value);
    }
    /*
    KEYBOARD SUPPORT
    */

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (disabled) return;

            if (/^[0-9]$/.test(e.key)) {
                handleDigit(e.key);
            }

            if (e.key === "Backspace") {
                handleBackspace();
            }

            if (e.key === "Enter") {
                handleSubmit();
            }

            if (e.key === "Escape") {
                handleClear();
            }
        }

        window.addEventListener("keydown", handleKey);

        return () => window.removeEventListener("keydown", handleKey);
    }, [value, disabled]);


    const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const buttonClass = "h-[80px] w-[80px] rounded-xl border border-gray-100 text-lg pointer shadow-sm transition hover:-translate-y-1 hover:shadow-md active:border-gray-100 active:scale-[0.98]";
    const keyClass = `${buttonClass} bg-white`;
    const actionClass = `${buttonClass} bg-gray-100`;

    return (
        <div className="w-full max-w-[360px] mx-auto my-0 flex flex-col gap-4">
            <div className="flex justify-center gap-2">
                {maskedValue.map((char, index) => (
                    <div className={`w-[20px] h-[20px] border-1 border-gray-400 rounded-full flex justify-center items-center ${char == 'x' ? 'bg-gray-500' : "bg-stone-100"}`}
                        key={index}>
                        {/* {char} */}
                    </div>
                ))}
            </div>

            <div className="grid gap-3 grid-cols-3">
                {buttons.map((digit) => (
                    <button
                        className={keyClass}
                        key={digit}
                        type="button"
                        onClick={() => handleDigit(digit)}
                        disabled={disabled}
                    >
                        {digit}
                    </button>
                ))}

                <button
                    type="button"
                    className={actionClass}
                    onClick={handleClear}
                    disabled={disabled}
                >
                    Clear
                </button>

                <button
                    type="button"
                    className={keyClass}
                    onClick={() => handleDigit("0")}
                    disabled={disabled}
                >
                    0
                </button>

                <button
                    type="button"
                    className={actionClass}
                    onClick={handleBackspace}
                    disabled={disabled}
                >
                    ⌫
                </button>
            </div>

            {!autoSubmit && (
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={disabled || value.length !== length}
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        border: "none",
                        cursor: disabled || value.length !== length ? "not-allowed" : "pointer",
                        fontSize: 16,
                        fontWeight: 600,
                    }}
                >
                    Login
                </button>
            )}
        </div>
    );
}
