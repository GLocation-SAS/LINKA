import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Config/firebase";
import api from "../Config/axiosconfig";

interface AuthContextProps {
  user: User | null;
  rol: string | null;
  loading: boolean;
  setRol: (rol: string | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  rol: null,
  loading: true,
  setRol: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rol, setRol] = useState<string | null>(
    localStorage.getItem("rol") || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Consultar rol desde backend
          const res = await api.get(`/usuarios/obtener/${firebaseUser.uid}`);
          const userData = res.data;
          const rol = userData?.rol || "admin";

          setRol(rol);
          localStorage.setItem("rol", rol); // ✅ persistencia
        } catch (error) {
          console.error("Error obteniendo rol:", error);
          setRol("admin");
          localStorage.setItem("rol", "gestor");
        }
      } else {
        setUser(null);
        setRol(null);
        localStorage.removeItem("rol");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol, loading, setRol }}>
      {children}
    </AuthContext.Provider>
  );
}
