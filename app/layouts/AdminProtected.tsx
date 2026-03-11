import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import { useAdminAuthStore } from "~/store/AdminStore";

export default function AdminProtectedLayout() {
    const navigate = useNavigate()
    const { user } = useAdminAuthStore()

    useEffect(() => {
        // Only check auth on client-side
        if (!user) {
            navigate("/a/l", { replace: true });
        }
    }, [user, navigate]);


    if (!user) return null;


    return (
        <>
            <div className="flex flex-1 h-full">
                <div className="md:ml-18 lg:ml-45 flex-1 flex flex-col h-full">
                    <main className="pt-18 px-3 pb-16 flex-1 h-full">
                        <Outlet />
                    </main>
                </div>
            </div>
            <ToastContainer closeButton={false} />
        </>
    );
}