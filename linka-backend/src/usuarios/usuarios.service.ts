import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class UsuariosService {
  private firestore: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private readonly firebaseApp: admin.app.App) {
    this.firestore = this.firebaseApp.firestore();
  }

  async crearUsuario(uid: string, email: string, displayName: string, rol: string, estado: string) {
    await this.firestore.collection('usuarios').doc(uid).set({
      email,
      email_lower: email.toLowerCase(),
      display_name: displayName,
      display_name_lower: displayName.toLowerCase(),
      rol,
      estado, // 👈 nuevo campo
      fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { uid, email, displayName, rol, estado };
  }

  async obtenerUsuario(uid: string) {
    const doc = await this.firestore.collection('usuarios').doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Listar usuarios con filtros, paginación y rango de fechas
   * @param filter texto para buscar en email o display_name (ignora mayúsculas/minúsculas)
   * @param page número de página (default: 1)
   * @param limit cantidad de resultados por página (default: 10)
   * @param startDate fecha inicial para filtrar por fecha_creacion
   * @param endDate fecha final para filtrar por fecha_creacion
   */
  async listarUsuarios(
    filter?: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    let usuarios: Record<string, any> = {}; // usamos un diccionario para evitar duplicados
    let totalCount = 0;

    const filterLower = filter ? filter.toLowerCase() : undefined;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (filterLower) {
      // Queries SOLO por texto
      const byEmailQuery = this.firestore
        .collection('usuarios')
        .where('email_lower', '>=', filterLower)
        .where('email_lower', '<=', filterLower + '\uf8ff')
        .orderBy('email_lower')
        .offset((page - 1) * limit)
        .limit(limit);

      const byNameQuery = this.firestore
        .collection('usuarios')
        .where('display_name_lower', '>=', filterLower)
        .where('display_name_lower', '<=', filterLower + '\uf8ff')
        .orderBy('display_name_lower')
        .offset((page - 1) * limit)
        .limit(limit);

      // Ejecutamos ambas consultas
      const [byEmail, byName] = await Promise.all([byEmailQuery.get(), byNameQuery.get()]);

      // Filtrar en memoria por rango de fechas
      const filtrarPorFecha = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data();
        const fecha = data.fecha_creacion?.toDate?.() || null;
        if (!fecha) return false;
        if (start && fecha < start) return false;
        if (end && fecha > end) return false;
        return true;
      };

      const docsFiltrados = [
        ...byEmail.docs.filter(filtrarPorFecha),
        ...byName.docs.filter(filtrarPorFecha),
      ];

      docsFiltrados.forEach((doc) => {
        usuarios[doc.id] = { uid: doc.id, ...doc.data() };
      });

      totalCount = docsFiltrados.length;
    } else {
      // Caso sin filtro de texto → solo rango de fechas
      let baseQuery: FirebaseFirestore.Query = this.firestore.collection('usuarios');

      if (start) baseQuery = baseQuery.where('fecha_creacion', '>=', start);
      if (end) baseQuery = baseQuery.where('fecha_creacion', '<=', end);

      const snapshot = await baseQuery
        .orderBy('display_name_lower') // 👈 ahora siempre ordenamos por display_name_lower
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      snapshot.docs.forEach((doc) => {
        usuarios[doc.id] = { uid: doc.id, ...doc.data() };
      });

      totalCount = snapshot.size;
    }

    const usuariosArray = Object.values(usuarios); // quitamos duplicados
    const totalPages = Math.ceil(totalCount / limit);

    return {
      usuarios: usuariosArray,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  }


  async actualizarUsuario(
    uid: string,
    body: Partial<{ email: string; displayName: string; rol: string; estado: 'activo' | 'inactivo' }>,
  ) {
    const updateData: any = {};

    if (body.email) {
      updateData.email = body.email;
      updateData.email_lower = body.email.toLowerCase();
    }
    if (body.displayName) {
      updateData.display_name = body.displayName;
      updateData.display_name_lower = body.displayName.toLowerCase();
    }
    if (body.rol) {
      updateData.rol = body.rol;
    }
    if (body.estado) {
      updateData.estado = body.estado;
    }

    // 🔐 Sincronizar con Firebase Auth si cambia email/displayName/estado
    try {
      const authUpdate: admin.auth.UpdateRequest = {};
      if (body.email) authUpdate.email = body.email;
      if (body.displayName) authUpdate.displayName = body.displayName;
      if (body.estado) authUpdate.disabled = body.estado === 'inactivo';

      if (Object.keys(authUpdate).length > 0) {
        await admin.auth().updateUser(uid, authUpdate);
      }
    } catch (e) {
      throw new BadRequestException(
        `No se pudo actualizar en Firebase Auth: ${(e as Error).message}`,
      );
    }

    await this.firestore.collection('usuarios').doc(uid).update(updateData);
    const updatedDoc = await this.firestore.collection('usuarios').doc(uid).get();
    return { uid, ...updatedDoc.data() };
  }

  async eliminarUsuario(uid: string) {
    // Primero borramos en Firestore
    await this.firestore.collection('usuarios').doc(uid).delete();

    // Luego intentamos eliminar en Auth (si no existe, no romper)
    try {
      await admin.auth().deleteUser(uid);
    } catch (e) {
      // Si el user ya no existe en Auth, solo loggeamos
      // console.warn('Usuario no existía en Auth:', e);
    }

    return { deleted: true, uid };
  }
}
