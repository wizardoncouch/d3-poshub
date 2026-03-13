import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useAppStore } from "../store/AppStore";

export default function Wrapper() {
    const hydrate = useAppStore((state) => state.hydrate);
    const hydrated = useAppStore((state) => state.hydrated);

    const localDbName = useAppStore((state) => state.localDbName);
    const remoteDbUrl = useAppStore((state) => state.remoteDbUrl);

    const saveConfig = useAppStore((state) => state.saveConfig);
    const startSync = useAppStore((state) => state.startSync);
    const stopSync = useAppStore((state) => state.stopSync);
    const clearConfig = useAppStore((state) => state.clearConfig);

    const [mounted, setMounted] = useState(false);
    const [localNameInput, setLocalNameInput] = useState("");
    const [remoteUrlInput, setRemoteUrlInput] = useState("");

    useEffect(() => {
        setMounted(true);
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (!mounted || !hydrated) return;
        if (!localDbName || !remoteDbUrl) return;

        startSync();

        return () => {
            stopSync();
        };
    }, [mounted, hydrated, localDbName, remoteDbUrl, startSync, stopSync]);

    useEffect(() => {
        if (!mounted) return;
        setLocalNameInput(localDbName);
        setRemoteUrlInput(remoteDbUrl);
    }, [mounted, localDbName, remoteDbUrl]);

    const isConfigured = Boolean(localDbName && remoteDbUrl);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        saveConfig(localNameInput, remoteUrlInput);
    }

    if (!mounted || !hydrated) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    if (!isConfigured) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: 24,
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    style={{
                        width: "100%",
                        maxWidth: 420,
                        padding: 24,
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        background: "#fff",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>App Setup</h2>

                    <div style={{ marginBottom: 16 }}>
                        <label
                            htmlFor="localDbName"
                            style={{ display: "block", marginBottom: 8 }}
                        >
                            Local DB Name
                        </label>
                        <input
                            id="localDbName"
                            type="text"
                            value={localNameInput}
                            onChange={(e) => setLocalNameInput(e.target.value)}
                            placeholder="qula_local"
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 8,
                                border: "1px solid #ccc",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label
                            htmlFor="remoteDbUrl"
                            style={{ display: "block", marginBottom: 8 }}
                        >
                            Remote DB URL
                        </label>
                        <input
                            id="remoteDbUrl"
                            type="text"
                            value={remoteUrlInput}
                            onChange={(e) => setRemoteUrlInput(e.target.value)}
                            placeholder="http://admin:password@localhost:5984/mydb"
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 8,
                                border: "1px solid #ccc",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: 12,
                            border: 0,
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Save and Continue
                    </button>
                </form>
            </div>
        );
    }

    return (
        <Outlet />
    );
}