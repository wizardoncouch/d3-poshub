import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";
import { ToastContainer } from "react-toastify";
import NumpadPasscode from "~/components/NumpadPasscode";
import { useTerminalAuthStore } from "~/store/TerminalStore";

export default function TerminalLogin() {
    const user = useTerminalAuthStore((state) => state.user);
    const hydrated = useTerminalAuthStore((state) => state.hydrated);
    const loginUser = useTerminalAuthStore((state) => state.loginUser);
    const hydrate = useTerminalAuthStore((state) => state.hydrate);

    const [passcode, setPasscode] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [shake, setShake] = useState(false);

    const shakeTimeoutRef = useRef<number | null>(null);

    const passcodeLength = 6;

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (errorMessage && passcode.length > 0 && passcode.length < passcodeLength) {
            setErrorMessage("");
        }
    }, [errorMessage, passcode.length]);

    useEffect(() => {
        return () => {
            if (shakeTimeoutRef.current) {
                window.clearTimeout(shakeTimeoutRef.current);
            }
        };
    }, []);

    async function handleLogin(code: string) {
        if (loading) return;

        try {
            setLoading(true);
            setErrorMessage("");

            const ok = await loginUser(code);

            if (!ok) {
                setErrorMessage("Invalid passcode");
                setShake(true);
                setPasscode("");

                if (shakeTimeoutRef.current) {
                    window.clearTimeout(shakeTimeoutRef.current);
                }

                shakeTimeoutRef.current = window.setTimeout(() => {
                    setShake(false);
                }, 4000);
            }
        } catch {
            setErrorMessage("Invalid passcode");
            setShake(true);
            setPasscode("");

            if (shakeTimeoutRef.current) {
                window.clearTimeout(shakeTimeoutRef.current);
            }

            shakeTimeoutRef.current = window.setTimeout(() => {
                setShake(false);
            }, 4000);
        } finally {
            setLoading(false);
        }
    }

    if (!hydrated) {
        return null;
    }

    if (user) {
        return <Navigate to="/t" replace />;
    }

    return (
        <>
            <div className="grid h-screen items-center justify-center bg-stone-50 p-6">
                <div className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow">
                    <h2
                        className="text-center text-xl"
                        style={{ marginBottom: errorMessage ? 10 : 34 }}
                    >
                        Enter Passcode
                    </h2>

                    {errorMessage && (
                        <p
                            className={`mb-1 text-center text-sm text-red-400 ${shake ? "shake" : ""
                                }`}
                        >
                            {errorMessage}
                        </p>
                    )}

                    <NumpadPasscode
                        value={passcode}
                        onChange={setPasscode}
                        onSubmit={handleLogin}
                        length={passcodeLength}
                        disabled={loading}
                        autoSubmit
                    />
                </div>
            </div>
            <ToastContainer closeButton={false} />
        </>
    );
}