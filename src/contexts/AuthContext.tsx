import Router from "next/router";
import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";

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

  async function signIn({ email, password }: SignInCredencials) {
    try {
      const response = await api.post("sessions", { email, password });
      console.log(response.data);

      const { permissions, roles } = response.data;

      setUser({
        email,
        permissions,
        roles,
      });
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
