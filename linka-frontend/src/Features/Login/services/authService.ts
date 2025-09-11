import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../../../Config/firebase";
import api from "../../../Config/axiosconfig";

// 🔑 Función auxiliar para obtener rol
const getUserRole = async (uid: string): Promise<string> => {
  try {
    const res = await api.get(`/usuarios/obtener/${uid}`);
    const data = res.data;

    if (data?.rol === "admin") {
      return "admin";
    }
    return "gestor"; // valor por defecto
  } catch (error) {
    // Si no existe en backend, asignamos gestor
    console.warn("Usuario no encontrado en obtener, asignando rol gestor");
    return "gestor";
  }
};

// función auxiliar para verificar si ya existe el usuario
const getUserRole2 = async (uid: string, defaultRol: string): Promise<string> => {
  try {
    const res = await api.get(`/usuarios/obtener/${uid}`);
    const data = res.data;

    if (data?.rol) {
      return data.rol; // si existe en backend usamos ese rol
    }
    return defaultRol; // si no existe usamos el seleccionado en el registro
  } catch (error) {
    console.warn("Usuario no encontrado, se asigna rol:", defaultRol);
    return defaultRol;
  }
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const rol = await getUserRole(user.uid);

  // Llamada a backend
  await api.post("/usuarios/crear", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    rol,
    estado: "activo",
  });

  return user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const rol = await getUserRole(user.uid);

  await api.post("/usuarios/crear", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || email.split("@")[0],
    rol,
    estado: "activo",
  });

  return user;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  rolSeleccionado: string
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const rol = await getUserRole2(user.uid, rolSeleccionado);

  await api.post("/usuarios/crear", {
    uid: user.uid,
    email: user.email,
    displayName,
    rol,
    estado: "activo",
  });

  return user;
};



export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Se envió un correo para restablecer tu contraseña");
  } catch (error: any) {
    alert(error.message);
  }
}

export function mapAuthErrorToMessage(err: any): string {
  const raw =
    err?.code ||
    err?.message ||
    err?.error?.message || // por si viene del REST
    "";

  const text = String(raw).toLowerCase();

  // Cuenta deshabilitada
  if (text.includes("auth/user-disabled") || text.includes("user_disabled")) {
    return "Tu cuenta está inactiva. Por favor comunícate con el administrador para activarla.";
  }

  // Otros casos comunes (opcional)
  if (text.includes("auth/invalid-credential") || text.includes("wrong-password")) {
    return "Correo o contraseña incorrectos.";
  }
  if (text.includes("auth/user-not-found")) {
    return " No existe una cuenta con ese correo.";
  }

  // Genérico
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}
