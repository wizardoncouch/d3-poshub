import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);

import { create } from "zustand";

type SyncHandler = PouchDB.Replication.Sync<Record<string, unknown>> | null;

interface AppState {
    localDB: PouchDB.Database | null;
    remoteDB: PouchDB.Database | null;
    localDbName: string;
    remoteDbUrl: string;
    syncHandler: SyncHandler;
    hydrated: boolean;

    hydrate: () => void;
    setLocalDB: (name: string) => PouchDB.Database | null;
    setRemoteDB: (url: string) => PouchDB.Database | null;
    saveConfig: (localName: string, remoteUrl: string) => void;
    startSync: () => void;
    stopSync: () => void;
    clearConfig: () => void;
}

const LOCAL_DBNAME_KEY = "local_dbname";
const REMOTE_DBURL_KEY = "remote_dburl";

const isBrowser = typeof window !== "undefined";

export const useAppStore = create<AppState>((set, get) => ({
    localDB: null,
    remoteDB: null,
    localDbName: "",
    remoteDbUrl: "",
    syncHandler: null,
    hydrated: false,

    hydrate: () => {
        if (!isBrowser) return;

        const savedLocalName = window.localStorage.getItem(LOCAL_DBNAME_KEY) ?? "";
        const savedRemoteUrl = window.localStorage.getItem(REMOTE_DBURL_KEY) ?? "";

        set({
            localDbName: savedLocalName,
            remoteDbUrl: savedRemoteUrl,
            localDB: savedLocalName ? new PouchDB(savedLocalName) : null,
            remoteDB: savedRemoteUrl ? new PouchDB(savedRemoteUrl) : null,
            hydrated: true,
        });
    },

    setLocalDB: (name: string) => {
        if (!isBrowser) return null;

        const trimmed = name.trim();
        if (!trimmed) return null;

        const { localDB, localDbName } = get();
        if (localDB && localDbName === trimmed) return localDB;

        const db = new PouchDB(trimmed);
        window.localStorage.setItem(LOCAL_DBNAME_KEY, trimmed);

        set({
            localDB: db,
            localDbName: trimmed,
        });

        return db;
    },

    setRemoteDB: (url: string) => {
        if (!isBrowser) return null;

        const trimmed = url.trim();
        if (!trimmed) return null;

        const { remoteDB, remoteDbUrl } = get();
        if (remoteDB && remoteDbUrl === trimmed) return remoteDB;

        const db = new PouchDB(trimmed);
        window.localStorage.setItem(REMOTE_DBURL_KEY, trimmed);

        set({
            remoteDB: db,
            remoteDbUrl: trimmed,
        });

        return db;
    },

    saveConfig: (localName: string, remoteUrl: string) => {
        const trimmedLocal = localName.trim();
        const trimmedRemote = remoteUrl.trim();

        if (!trimmedLocal || !trimmedRemote) return;

        get().setLocalDB(trimmedLocal);
        get().setRemoteDB(trimmedRemote);
    },

    startSync: () => {
        const { localDB, remoteDB, syncHandler } = get();

        if (!localDB || !remoteDB || syncHandler) return;

        const sync = localDB
            .sync(remoteDB, {
                live: true,
                retry: true,
            })
            .on("change", (info) => console.log("sync change", info))
            .on("paused", (err) => console.log("sync paused", err))
            .on("active", () => console.log("sync active"))
            .on("denied", (err) => console.error("sync denied", err))
            .on("error", (err) => console.error("sync error", err));

        set({ syncHandler: sync });
    },

    stopSync: () => {
        const { syncHandler } = get();
        if (!syncHandler) return;

        syncHandler.cancel();
        set({ syncHandler: null });
    },

    clearConfig: () => {
        get().stopSync();

        if (isBrowser) {
            window.localStorage.removeItem(LOCAL_DBNAME_KEY);
            window.localStorage.removeItem(REMOTE_DBURL_KEY);
        }

        set({
            localDB: null,
            remoteDB: null,
            localDbName: "",
            remoteDbUrl: "",
            syncHandler: null,
            hydrated: true,
        });
    },
}));