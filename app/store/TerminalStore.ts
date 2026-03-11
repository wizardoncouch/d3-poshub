import { create } from "zustand";
import { useAppStore } from "~/store/AppStore";

export interface User {
    uid: number;
    firstname: string;
    lastname: string;
    roles: string[];
}

interface UserDoc {
    uid?: number;
    firstname?: string;
    lastname?: string;
    roles?: string[] | string;
    type?: string;
    passcode?: string;
}

interface TerminalAuthState {
    user: User | null;
    locked: boolean;
    hydrated: boolean;

    hydrate: () => void;
    setLocked: (locked: boolean) => void;
    loginUser: (passcode: string) => Promise<boolean>;
    logoutUser: () => void;
}

const TERMINAL_AUTH_USER_KEY = "terminal_auth_user";
const ALLOWED_ROLES = new Set(["cashier", "waiter"]);
const isBrowser = typeof window !== "undefined";

function clearStoredUser() {
    if (!isBrowser) return;
    window.localStorage.removeItem(TERMINAL_AUTH_USER_KEY);
}

function saveStoredUser(user: User) {
    if (!isBrowser) return;
    window.localStorage.setItem(TERMINAL_AUTH_USER_KEY, JSON.stringify(user));
}

function normalizeRoles(roles: UserDoc["roles"]): string[] {
    if (Array.isArray(roles)) {
        return roles
            .map((role) => String(role).trim().toLowerCase())
            .filter(Boolean);
    }

    if (typeof roles === "string") {
        return roles
            .split(",")
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean);
    }

    return [];
}

function toUser(doc: UserDoc): User {
    return {
        uid: typeof doc.uid === "number" ? doc.uid : 0,
        firstname: typeof doc.firstname === "string" ? doc.firstname : "",
        lastname: typeof doc.lastname === "string" ? doc.lastname : "",
        roles: normalizeRoles(doc.roles),
    };
}

function hasTerminalAccess(roles: string[]): boolean {
    return roles.some((role) => ALLOWED_ROLES.has(role));
}

export const useTerminalAuthStore = create<TerminalAuthState>((set) => ({
    user: null,
    locked: false,
    hydrated: false,

    hydrate: () => {
        if (!isBrowser) return;

        try {
            const rawUser = window.localStorage.getItem(TERMINAL_AUTH_USER_KEY);

            if (!rawUser) {
                set({
                    user: null,
                    locked: false,
                    hydrated: true,
                });
                return;
            }

            const parsed = JSON.parse(rawUser) as User;

            set({
                user: {
                    uid: typeof parsed.uid === "number" ? parsed.uid : 0,
                    firstname: typeof parsed.firstname === "string" ? parsed.firstname : "",
                    lastname: typeof parsed.lastname === "string" ? parsed.lastname : "",
                    roles: Array.isArray(parsed.roles)
                        ? parsed.roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean)
                        : [],
                },
                locked: false,
                hydrated: true,
            });
        } catch (err) {
            console.error("Terminal store hydrate error:", err);
            clearStoredUser();

            set({
                user: null,
                locked: false,
                hydrated: true,
            });
        }
    },

    setLocked: (locked: boolean) => {
        set({ locked });
    },

    loginUser: async (passcode: string) => {
        const fail = () => {
            clearStoredUser();
            set({
                user: null,
                locked: true,
                hydrated: true,
            });
            return false;
        };

        try {
            const cleanPasscode = passcode.trim();

            if (!cleanPasscode) {
                return fail();
            }

            const { localDB } = useAppStore.getState();

            if (!localDB) {
                console.error("loginUser: localDB is not initialized.");
                return fail();
            }

            await localDB.createIndex({
                index: {
                    fields: ["type", "passcode"],
                },
            });

            const res = await localDB.find({
                selector: {
                    type: "user",
                    passcode: cleanPasscode,
                },
                limit: 1,
            });

            if (!res.docs?.length) {
                return fail();
            }

            const doc = res.docs[0] as UserDoc;
            const user = toUser(doc);

            if (!hasTerminalAccess(user.roles)) {
                return fail();
            }

            saveStoredUser(user);

            set({
                user,
                locked: false,
                hydrated: true,
            });

            return true;
        } catch (err) {
            console.error("Terminal login error:", err);
            return fail();
        }
    },

    logoutUser: () => {
        clearStoredUser();

        set({
            user: null,
            locked: false,
            hydrated: true,
        });
    },
}));