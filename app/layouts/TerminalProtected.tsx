import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import { useTerminalAuthStore } from "~/store/TerminalStore";

export default function TerminalProtectedLayout() {
    const hydrate = useTerminalAuthStore((state) => state.hydrate);
    const user = useTerminalAuthStore((state) => state.user);
    const hydrated = useTerminalAuthStore((state) => state.hydrated);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    if (!hydrated) {
        return null;
    }

    if (!user) {
        return <Navigate to="/t/l" replace />;
    }

    return (
        <>
            <Outlet />
            <ToastContainer closeButton={false} />
        </>
    );
}