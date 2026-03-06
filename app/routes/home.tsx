import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import useUsers from "~/hooks/useUsers";
import { useEffect } from "react";
import { startSync } from "~/lib/db.client";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const users = useUsers();
  useEffect(() => {
    startSync()
  }, [])
  return <Welcome users={users} />;
}
