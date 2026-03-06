import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            setUser({ ...data.data, token });
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser({ ...userData, token });
    navigate("/dashboard");
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }, [navigate]);

  const value = useMemo(
    () => ({ user, login, logout, isLoading }),
    [user, login, logout, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
