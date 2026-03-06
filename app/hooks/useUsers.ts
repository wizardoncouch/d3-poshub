import { useEffect, useState } from "react";
import { localDB } from "~/lib/db.client";

export default function useUsers() {
    const [users, setUsers] = useState([]);

    async function load() {
        await localDB.createIndex({
            index: {
                fields: ["type"],
            },
        });
        const res = await localDB.find({
            selector: { type: "user" },
        });
        setUsers(res.docs as any);
    }

    useEffect(() => {
        load();

        const changes = localDB.changes({
            live: true,
            since: "now",
            include_docs: true
        }).on("change", load);

        return () => changes.cancel();
    }, []);

    return users;
}