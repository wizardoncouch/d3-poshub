import { ArrowBigLeftDash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import { ToastContainer } from "react-toastify";
import NumpadPasscode from "~/components/NumpadPasscode";
import { useInventoryAuthStore } from "~/store/InventoryStore";

export default function InventoryLogin() {
    const user = useInventoryAuthStore((state) => state.user);
    const hydrated = useInventoryAuthStore((state) => state.hydrated);
    const loginUser = useInventoryAuthStore((state) => state.loginUser);
    const hydrate = useInventoryAuthStore((state) => state.hydrate);

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
        return <Navigate to="/i" replace />;
    }

    return (
        <>
            <div className="grid h-full items-center justify-center bg-stone-100 p-6">
                <div className="flex flex-col gap-5 w-full max-w-[340px] ">
                    <div className="flex flex-row gap-3 items-center justify-start ms-1">
                        <Link to={'/'} className="text-blue-500 "><ArrowBigLeftDash size={30} /></Link>
                        <p className="text-2xl uppercase text-stone-500 ">Inventory Login</p>
                    </div>
                    <div className="rounded-3xl p-6">
                        <h2
                            className="text-center text-xl"
                            style={{ marginBottom: errorMessage ? 10 : 34 }}
                        >
                            Enter Passcode
                        </h2>

                        {errorMessage && (
                            <p className={`mb-1 text-center text-sm text-red-400 ${shake ? "shake" : ""}`}>
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
            </div>
            <ToastContainer closeButton={false} />
        </>
    );
}