import { createContext, ReactNode } from "react";

interface SignInCredencials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credencials: SignInCredencials) => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;

  async function signIn(credencials: SignInCredencials) {
    console.log(credencials);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
