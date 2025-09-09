import React, { createContext, useContext, useState, ReactNode } from "react";

type User = {
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    // ✅ Demo hardcoded credentials
    const demoUsers = [
      { username: "clayton.reynolds", email: "clayton.reynolds@example.com", password: "Green@7581" },
      { username: "prathamesh.tase", email: "prathamesh.tase@example.com", password: "Green@7581" },
      { username: "lavinia.reynolds", email: "lavinia.reynolds@example.com", password: "Green@7581" },
      { username: "admin", email: "admin@example.com", password: "admin123" }, // extra fallback
    ];

    const found = demoUsers.find(
      u =>
        (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
        u.password === password
    );

    if (found) {
      const authUser = { username: found.username, email: found.email };
      setUser(authUser);
      localStorage.setItem("user", JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
