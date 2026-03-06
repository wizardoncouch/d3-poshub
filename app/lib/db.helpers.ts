import { localDB } from "./db.client";

type BaseDoc = {
    _id: string;
    _rev?: string;
    [key: string]: any;
};

/**
 * Find a single document using a Mango selector.
 * Requires pouchdb-find plugin.
 */
export async function findOne<T = BaseDoc>(
    selector: Record<string, any>
): Promise<T | null> {
    const result = await localDB.find({
        selector,
        limit: 1,
    });

    return (result.docs[0] as T) || null;
}

/**
 * Create a new document.
 * If _id is not provided, PouchDB will generate one.
 */
export async function create<T extends Record<string, any>>(
    doc: T
): Promise<PouchDB.Core.Response> {
    return await localDB.post(doc);
}

/**
 * Create a new document with a fixed _id.
 */
export async function createWithId<T extends BaseDoc>(
    doc: T
): Promise<PouchDB.Core.Response> {
    return await localDB.put(doc);
}

/**
 * Update an existing document by _id.
 * Automatically fetches the latest _rev first.
 */
export async function update<T extends Record<string, any>>(
    id: string,
    updates: Partial<T>
): Promise<PouchDB.Core.Response> {
    const existing = await localDB.get<T & BaseDoc>(id);

    return await localDB.put({
        ...existing,
        ...updates,
        _id: existing._id,
        _rev: existing._rev,
    });
}

/**
 * Delete a document by _id.
 */
export async function remove(id: string): Promise<PouchDB.Core.Response> {
    const existing = await localDB.get<BaseDoc>(id);
    return await localDB.remove(existing);
}