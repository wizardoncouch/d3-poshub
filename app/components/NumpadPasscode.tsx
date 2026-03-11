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

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                }}
            >
                {maskedValue.map((char, index) => (
                    <div
                        key={index}
                        style={{
                            width: 20,
                            height: 20,
                            border: "1px solid #ccc",
                            borderRadius: 15,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 30,
                            fontWeight: 700,
                            background: char == 'x' ? "#a1a1a1" : "#ffffff"
                        }}
                    >
                        {/* {char} */}
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                }}
            >
                {buttons.map((digit) => (
                    <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigit(digit)}
                        disabled={disabled}
                        style={keyStyle}
                    >
                        {digit}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleClear}
                    disabled={disabled}
                    style={actionStyle}
                >
                    Clear
                </button>

                <button
                    type="button"
                    onClick={() => handleDigit("0")}
                    disabled={disabled}
                    style={keyStyle}
                >
                    0
                </button>

                <button
                    type="button"
                    onClick={handleBackspace}
                    disabled={disabled}
                    style={actionStyle}
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

const keyStyle: React.CSSProperties = {
    height: 80,
    width: 80,
    borderRadius: 12,
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
};

const actionStyle: React.CSSProperties = {
    height: 80,
    width: 80,
    borderRadius: 12,
    border: "1px solid #ccc",
    background: "#f7f7f7",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
};