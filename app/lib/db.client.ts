import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);


const LOCAL_DB_NAME = "terminal_local";
// const REMOTE_BASE_URL = import.meta.env.VITE_COUCH_REMOTE_URL || "http://localhost:1234";
const REMOTE_BASE_URL = "https://admin:4w35Om3!@couchdb.d3.net";
const REMOTE_DB_NAME = "terminal_pp_1154";

export const localDB = new PouchDB(LOCAL_DB_NAME);
export const remoteDB = new PouchDB(`${REMOTE_BASE_URL}/${REMOTE_DB_NAME}`);

let syncHandler: PouchDB.Replication.Sync<{}> | null = null;

export function startSync() {
    if (syncHandler) return syncHandler;

    syncHandler = localDB
        .sync(remoteDB, {
            live: true,
            retry: true,
        })
        .on("change", (change: any) => {
            console.log("sync change", change);
        })
        .on("paused", (err: any) => {
            if (err) {
                console.warn("sync paused due to error or connection issue", err);
            } else {
                console.log("sync paused");
            }
        })
        .on("active", () => {
            console.log("sync resumed");
        })
        .on("denied", (err: any) => {
            console.error("sync denied", err);
        })
        .on("complete", (info: any) => {
            console.log("sync complete", info);
        })
        .on("error", (err: any) => {
            console.error("sync error", err);
        });

    return syncHandler;
}

export function stopSync() {
    if (syncHandler) {
        syncHandler.cancel();
        syncHandler = null;
    }
}