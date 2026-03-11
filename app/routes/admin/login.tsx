import { redirect, type LoaderFunctionArgs } from "react-router";
import { ToastContainer } from "react-toastify";

// This runs on the server (or client before rendering)
export async function clientLoader({ request }: LoaderFunctionArgs) {
    const isAuthenticated = !!localStorage.getItem("admin_token"); // Replace with your auth logic

    if (isAuthenticated) {
        return redirect("/a");
    }

    return {}; // Return user data here if needed
}

export default function AdminLogin() {
    return (
        <>
            <ToastContainer closeButton={false} />
        </>
    );
}