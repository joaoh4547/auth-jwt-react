import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { setCookie, parseCookies } from "nookies";
interface User {
  email: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredencials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credencials: SignInCredencials) => Promise<void>;
  isAuthenticated: boolean;
  user: User;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const { "@app.token": token } = parseCookies();

    if (token) {
      api.get("/me").then((response) => {
        const { email, permissions, roles } = response.data;
        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredencials) {
    try {
      const response = await api.post("sessions", { email, password });
      console.log(response.data);

      const { token, refreshToken, permissions, roles } = response.data;
      setCookie(undefined, "@app.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      setCookie(undefined, "@app.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      setUser({
        email,
        permissions,
        roles,
      });
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      Router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}
