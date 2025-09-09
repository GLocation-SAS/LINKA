import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Config/firebase";

type UserContextType = {
  uid: string | null;
  setUid: (uid: string | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const UID_KEY = "linka:uid";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUidState] = useState<string | null>(() => {
    return localStorage.getItem(UID_KEY);
  });

  const setUid = (next: string | null) => {
    setUidState(next);
    if (next) {
      localStorage.setItem(UID_KEY, next);
    } else {
      localStorage.removeItem(UID_KEY);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUid(null);
  };

  const value = useMemo(
    () => ({ uid, setUid, logout }),
    [uid]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
