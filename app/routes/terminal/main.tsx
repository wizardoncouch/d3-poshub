import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "~/store/AppStore";

interface TableDoc {
    _id: string;
    type?: string;
    name?: string;
}

export default function TerminalDashboard() {
    const localDB = useAppStore((state) => state.localDB);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localDB) return;

        async function checkTables() {
            try {
                await localDB?.createIndex({
                    index: { fields: ["type"] },
                });

                const res = await localDB?.find({
                    selector: { type: "table" },
                });

                const tables = res?.docs;
                navigate(tables && tables.length > 0 ? "/t/f" : "/t/s", { replace: true });
            } catch (err) {
                console.error("Failed to load tables:", err);
                navigate("/t/s", { replace: true });
            }
        }

        checkTables();
    }, [localDB, navigate]);

    return <p>Loading terminal...</p>;
}