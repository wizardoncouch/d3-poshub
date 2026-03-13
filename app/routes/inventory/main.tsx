import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "~/store/AppStore";

type InventoryHistoryDoc = {
    _id: string;
    _rev?: string;
    type: string;
    title?: string;
    reference?: string;
    status?: "draft" | "done";
    done?: boolean;
    createdAt?: string;
    updatedAt?: string;
    inventoryDate?: string;
    totalItems?: number;
    notes?: string;
};

export default function InventoryMainPage() {
    const { localDB } = useAppStore();
    const navigate = useNavigate();

    const [items, setItems] = useState<InventoryHistoryDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!localDB) return;

        let cancelled = false;

        const getInventoryHistory = async () => {
            try {
                setLoading(true);
                setError("");

                let docs: InventoryHistoryDoc[] = [];

                try {
                    await localDB.createIndex({
                        index: { fields: ["type", "createdAt"] },
                    });

                    const res = await localDB.find({
                        selector: {
                            type: "inventory",
                        },
                        sort: [{ type: "asc" }, { createdAt: "desc" }],
                    });

                    docs = (res.docs || []) as InventoryHistoryDoc[];
                } catch {
                    const res = await localDB.allDocs({
                        include_docs: true,
                    });

                    docs = (res.rows || [])
                        .map((row: any) => row.doc)
                        .filter((doc: any) => doc && doc.type === "inventory");
                }

                docs.sort((a, b) => {
                    const aDate = new Date(a.createdAt || a.inventoryDate || 0).getTime();
                    const bDate = new Date(b.createdAt || b.inventoryDate || 0).getTime();
                    return bDate - aDate;
                });

                if (!cancelled) {
                    setItems(docs);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to load inventory history.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        getInventoryHistory();

        return () => {
            cancelled = true;
        };
    }, [localDB]);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;

        return items.filter((item) => {
            return [
                item.title,
                item.reference,
                item.notes,
                item._id,
                item.status,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [items, search]);

    const formatDate = (value?: string) => {
        if (!value) return "No date";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleString();
    };

    const isDone = (item: InventoryHistoryDoc) =>
        item.done === true || item.status === "done";

    const goToCreate = () => {
        navigate("/i/c");
    };

    const goToItem = (item: InventoryHistoryDoc) => {
        if (isDone(item)) {
            navigate(`/i/${item._id}`);
            return;
        }
        navigate(`/i/${item._id}/e`);
    };

    return (
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <button
                    type="button"
                    onClick={goToCreate}
                    className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.99]"
                >
                    + New Inventory
                </button>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600 shadow-sm">
                    Loading inventory history...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && filteredItems.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h2 className="text-lg font-semibold">No inventory entries yet</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Start by creating your first inventory record.
                    </p>
                </div>
            )}

            {!loading && !error && filteredItems.length > 0 && (
                <>
                    <div className="mb-3 hidden grid-cols-[1.7fr_1fr_1fr_140px] gap-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                        <div>Inventory</div>
                        <div>Date</div>
                        <div>Items</div>
                        <div>Status</div>
                    </div>

                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const done = isDone(item);

                            return (
                                <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => goToItem(item)}
                                    className="w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-black hover:shadow md:p-5"
                                >
                                    <div className="flex flex-col gap-3 md:grid md:grid-cols-[1.7fr_1fr_1fr_140px] md:items-center md:gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-start justify-between gap-3 md:block">
                                                <div>
                                                    <h3 className="truncate text-base font-semibold text-gray-900">
                                                        {item.title || item.reference || "Untitled Inventory"}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        ID: {item._id}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium md:hidden ${done
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {done ? "Done" : "Open"}
                                                </span>
                                            </div>

                                            {item.notes ? (
                                                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                                    {item.notes}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 md:hidden">Date</p>
                                            <p className="text-sm text-gray-800">
                                                {formatDate(item.inventoryDate || item.createdAt || item.updatedAt)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 md:hidden">Items</p>
                                            <p className="text-sm text-gray-800">
                                                {item.totalItems ?? 0}
                                            </p>
                                        </div>

                                        <div className="hidden md:block">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${done
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}
                                            >
                                                {done ? "Done" : "Open"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-gray-500 md:text-sm">
                                        <span>
                                            {done
                                                ? "View inventory details"
                                                : "Tap to continue editing"}
                                        </span>
                                        <span className="font-medium text-gray-700">
                                            {done ? "View" : "Edit"} →
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}