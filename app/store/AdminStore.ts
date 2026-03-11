import { create } from "zustand";
import { localDB } from "~/lib/db.client";
import { error } from "~/lib/utils";

export interface User {
    uid: number;
    firstname: string;
    lastname: string;
    roles: string[];
}

interface AdminAuthState {
    user: User | null;
    locked: boolean;
    setLocked: (locked: boolean) => void;
    login: (passcode: string) => void;
    logout: () => void;
}


export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
    user: null,
    locked: false,
    setLocked: (locked: boolean) => {
        set({ locked: locked });
    },
    login: async (passcode: string) => {
        try {
            await localDB.createIndex({
                index: {
                    fields: ["type", "passcode"],
                },
            });
            const res = await localDB.find({
                selector: {
                    type: "user",
                    passcode: passcode,
                },
                limit: 1,
            });

            if (!res.docs || res.docs.length === 0) {
                set({ user: null, locked: true });
                error("Invalid Passcode")
                return false;
            }

            const doc = res.docs[0] as any;

            const user: User = {
                uid: doc.uid || 0,
                firstname: doc.firstname || "",
                lastname: doc.lastname || "",
                roles: Array.isArray(doc.roles) ? doc.roles : [],
            };

            set({
                user,
                locked: false,
            });

            return true;
        } catch (err) {
            error("Something is wrong, call Support.")
            set({ user: null, locked: true });
            return false;
        }

    },
    logout: () => {
        set({ user: null, locked: false });
    },
}));
