import { useEffect, useMemo, useState } from "react";
import { ArrowBigLeftDash, ChevronLeft, LogOut, Package2, User } from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { ToastContainer } from "react-toastify";
import { useInventoryAuthStore } from "~/store/InventoryStore";

function getPageTitle(pathname: string) {
    if (pathname.startsWith("/i/l")) return "Inventory Login";
    if (pathname.startsWith("/i")) return "Inventory";
    return "Inventory";
}

export default function InventoryProtectedLayout() {
    const hydrate = useInventoryAuthStore((state) => state.hydrate);
    const user = useInventoryAuthStore((state) => state.user);
    const hydrated = useInventoryAuthStore((state) => state.hydrated);
    const logoutUser = useInventoryAuthStore((state) => state.logoutUser);

    const location = useLocation();

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    const title = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

    if (!hydrated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-100">
                <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/i/l" replace />;
    }

    return (
        <>
            <div className="min-h-screen bg-stone-100">
                <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white transition hover:bg-stone-50 active:scale-[0.98] text-blue-500"
                                    aria-label="Go back"
                                >
                                    <ArrowBigLeftDash size={100} />
                                </Link>

                                <div className="flex min-w-0 items-center gap-3">

                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-semibold text-stone-800 sm:text-xl">
                                            {title}
                                        </h1>
                                        <p className="text-sm text-stone-500">
                                            Manage inventory easily
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-w-[200px] items-center gap-3 rounded-2xl px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                    <User className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-stone-800">
                                        {user.firstname}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={logoutUser}
                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-red-500 px-3 text-sm font-medium text-white transition hover:bg-red-600 active:scale-[0.98] ms-3"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>

                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            <ToastContainer closeButton={false} />
        </>
    );
}