import { useEffect } from "react";
import useUsers from "~/hooks/useUsers";
import { startSync } from "~/lib/db.client";

export function Welcome({ users }: any) {

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <p>{JSON.stringify(users)}</p>
    </main>
  );
}
