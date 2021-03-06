import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("me")
      .then((response) => console.log(response))
      .catch((e) => console.log(e));
  }, []);
  return <h1>Dashboard {user?.email}</h1>;
}
