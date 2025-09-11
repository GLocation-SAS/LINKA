// src/Context/UserContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Config/firebase";
import api from "../Config/axiosconfig";

type UserContextType = {
  uid: string | null;
  displayName: string | null;
  email: string | null;
  rol: string | null;
  setUid: (uid: string | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
const UID_KEY = "linka:uid";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUidState] = useState<string | null>(() => {
    return localStorage.getItem(UID_KEY);
  });
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);

  const setUid = (next: string | null) => {
    setUidState(next);
    if (next) {
      localStorage.setItem(UID_KEY, next);
    } else {
      localStorage.removeItem(UID_KEY);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const currentUid = user?.uid ?? null;
      setUid(currentUid);

      if (currentUid) {
        try {
          const { data } = await api.get(`/usuarios/obtener/${currentUid}`);
          setDisplayName(data.display_name);
          setEmail(data.email);
          setRol(data.rol);
        } catch (err) {
          console.error("Error cargando datos del usuario:", err);
        }
      } else {
        setDisplayName(null);
        setEmail(null);
        setRol(null);
      }
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUid(null);
    setDisplayName(null);
    setEmail(null);
    setRol(null);
  };

  const value = useMemo(
    () => ({ uid, displayName, email, rol, setUid, logout }),
    [uid, displayName, email, rol]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
