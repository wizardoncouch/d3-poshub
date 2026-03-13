import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "~/store/AppStore";

type ProductDoc = {
    _id: string;
    _rev?: string;
    type: "product";
    name?: string;
    description?: string;
    barcode?: string;
    sku?: string;
    storage?: string;
    quantity?: number | string;
    stock?: number | string;
    onhand?: number | string;
    price?: number | string;
};

type InventoryLine = {
    productId: string;
    name: string;
    sku: string;
    barcode: string;
    storage: string;
    expectedQty: number;
    countedQty: number;
    difference: number;
};

export default function InventoryCreatePage() {
    const { localDB } = useAppStore();
    const navigate = useNavigate();

    const [products, setProducts] = useState<ProductDoc[]>([]);
    const [storageLocations, setStorageLocations] = useState<string[]>([]);
    const [selectedStorage, setSelectedStorage] = useState("");
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [search, setSearch] = useState("");
    const [counts, setCounts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const toNumber = (value: unknown): number => {
        if (value === null || value === undefined || value === "") return 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const getExpectedQty = (product: ProductDoc): number => {
        return toNumber(product.quantity ?? product.stock ?? product.onhand ?? 0);
    };

    useEffect(() => {
        if (!localDB) return;

        let cancelled = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                let docs: ProductDoc[] = [];

                try {
                    await localDB.createIndex({
                        index: {
                            fields: ["type"],
                        },
                    });

                    const res = await localDB.find({
                        selector: {
                            type: "product",
                        },
                        limit: 1000
                    });
                    console.log(res.docs?.length)

                    docs = (res.docs || []) as ProductDoc[];
                } catch {
                    const res = await localDB.allDocs({ include_docs: true });
                    docs = (res.rows || [])
                        .map((row: any) => row.doc)
                        .filter((doc: any) => doc && doc.type === "product") as ProductDoc[];
                }

                const locations = Array.from(
                    new Set(
                        docs
                            .map((p) => String(p.storage || "").trim())
                            .filter(Boolean)
                    )
                ).sort((a, b) => a.localeCompare(b));

                if (!cancelled) {
                    setProducts(docs);
                    setStorageLocations(locations);
                    setSelectedStorage((prev) => prev || locations[0] || "");
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to load products.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, [localDB]);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();

        return products
            .filter((p) => String(p.storage || "").trim() === selectedStorage)
            .filter((p) => {
                if (!q) return true;
                return [
                    p.name,
                    p.description,
                    p.barcode,
                    p.sku,
                    p._id,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => {
                const an = String(a.name || "").toLowerCase();
                const bn = String(b.name || "").toLowerCase();
                return an.localeCompare(bn);
            });
    }, [products, selectedStorage, search]);

    useEffect(() => {
        if (!filteredProducts.length) return;

        setCounts((prev) => {
            const next = { ...prev };

            for (const product of filteredProducts) {
                if (next[product._id] === undefined) {
                    next[product._id] = String(getExpectedQty(product));
                }
            }

            return next;
        });
    }, [filteredProducts]);

    const handleCountChange = (productId: string, value: string) => {
        if (!/^-?\d*\.?\d*$/.test(value) && value !== "") return;

        setCounts((prev) => ({
            ...prev,
            [productId]: value,
        }));
    };

    const buildLines = (): InventoryLine[] => {
        return filteredProducts.map((product) => {
            const expectedQty = getExpectedQty(product);
            const countedQty = toNumber(counts[product._id] ?? expectedQty);

            return {
                productId: product._id,
                name: String(product.name || ""),
                sku: String(product.sku || ""),
                barcode: String(product.barcode || ""),
                storage: String(product.storage || ""),
                expectedQty,
                countedQty,
                difference: countedQty - expectedQty,
            };
        });
    };

    const summary = useMemo(() => {
        const lines = buildLines();

        return lines.reduce(
            (acc, line) => {
                acc.totalProducts += 1;
                acc.totalExpected += line.expectedQty;
                acc.totalCounted += line.countedQty;
                acc.totalDifference += line.difference;

                if (line.difference !== 0) {
                    acc.withVariance += 1;
                }

                return acc;
            },
            {
                totalProducts: 0,
                totalExpected: 0,
                totalCounted: 0,
                totalDifference: 0,
                withVariance: 0,
            }
        );
    }, [filteredProducts, counts]);

    const saveInventory = async () => {
        if (!localDB) return;
        if (!selectedStorage) {
            setError("Please select a storage location.");
            return;
        }
        if (!filteredProducts.length) {
            setError("No products found in the selected storage location.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const lines = buildLines();

            const now = new Date().toISOString();

            const doc = {
                type: "inventory",
                title: title.trim() || `Inventory - ${selectedStorage}`,
                notes: notes.trim(),
                storage: selectedStorage,
                status: "draft",
                done: false,
                createdAt: now,
                updatedAt: now,
                inventoryDate: now,
                totalItems: lines.length,
                totalExpectedQty: summary.totalExpected,
                totalCountedQty: summary.totalCounted,
                totalDifferenceQty: summary.totalDifference,
                lines,
            };

            const res = await localDB.post(doc);

            navigate(`/i/${res.id}/e`);
        } catch (err: any) {
            setError(err?.message || "Failed to save inventory.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Inventory Entry</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Select a storage location, count actual quantities, and save the inventory entry.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/i")}
                    className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50"
                >
                    Back to History
                </button>
            </div>

            {loading && (
                <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600 shadow-sm">
                    Loading products...
                </div>
            )}

            {!loading && error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !storageLocations.length && (
                <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
                    <h2 className="text-lg font-semibold">No storage locations found</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Make sure your product documents have a <code>storage</code> value.
                    </p>
                </div>
            )}

            {!loading && storageLocations.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold">Inventory Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Storage Location
                                    </label>
                                    <select
                                        value={selectedStorage}
                                        onChange={(e) => setSelectedStorage(e.target.value)}
                                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                                    >
                                        {storageLocations.map((storage) => (
                                            <option key={storage} value={storage}>
                                                {storage}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={`Inventory - ${selectedStorage || "Storage"}`}
                                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Optional notes"
                                        rows={4}
                                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Search Products
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name, barcode, sku"
                                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-white p-4 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold">Summary</h2>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-gray-500">Products</p>
                                    <p className="mt-1 text-lg font-semibold">{summary.totalProducts}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-gray-500">With Variance</p>
                                    <p className="mt-1 text-lg font-semibold">{summary.withVariance}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-gray-500">Expected Qty</p>
                                    <p className="mt-1 text-lg font-semibold">{summary.totalExpected}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-gray-500">Counted Qty</p>
                                    <p className="mt-1 text-lg font-semibold">{summary.totalCounted}</p>
                                </div>

                                <div className="col-span-2 rounded-xl bg-gray-50 p-3">
                                    <p className="text-gray-500">Difference</p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {summary.totalDifference > 0 ? "+" : ""}
                                        {summary.totalDifference}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={saveInventory}
                                disabled={saving || filteredProducts.length === 0}
                                className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Inventory Entry"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white shadow-sm">
                        <div className="border-b p-4">
                            <h2 className="text-base font-semibold">
                                Products in {selectedStorage || "Storage"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Enter the actual counted quantity for each product.
                            </p>
                        </div>

                        {!filteredProducts.length ? (
                            <div className="p-6 text-sm text-gray-600">
                                No products found for this storage location.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredProducts.map((product) => {
                                    const expectedQty = getExpectedQty(product);
                                    const countedQty = toNumber(counts[product._id] ?? expectedQty);
                                    const difference = countedQty - expectedQty;

                                    return (
                                        <div
                                            key={product._id}
                                            className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_120px]"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {product.name || "Unnamed Product"}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                    {product.sku ? <span>SKU: {product.sku}</span> : null}
                                                    {product.barcode ? <span>Barcode: {product.barcode}</span> : null}
                                                    <span>ID: {product._id}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                                    Expected
                                                </label>
                                                <div className="rounded-xl border bg-gray-50 px-3 py-3 text-sm">
                                                    {expectedQty}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                                    Counted
                                                </label>
                                                <input
                                                    type="text"
                                                    value={counts[product._id] ?? String(expectedQty)}
                                                    onChange={(e) => handleCountChange(product._id, e.target.value)}
                                                    className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-black"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                                    Difference
                                                </label>
                                                <div
                                                    className={`rounded-xl border px-3 py-3 text-sm font-medium ${difference === 0
                                                        ? "bg-gray-50"
                                                        : difference > 0
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-700"
                                                        }`}
                                                >
                                                    {difference > 0 ? "+" : ""}
                                                    {difference}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}