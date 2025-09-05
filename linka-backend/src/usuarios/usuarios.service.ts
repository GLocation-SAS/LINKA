import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class UsuariosService {
  private firestore: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private readonly firebaseApp: admin.app.App) {
    this.firestore = this.firebaseApp.firestore();
  }

  async crearUsuario(uid: string, email: string, displayName: string, rol: string) {
    await this.firestore.collection('usuarios').doc(uid).set({
      email,
      email_lower: email.toLowerCase(),
      display_name: displayName,
      display_name_lower: displayName.toLowerCase(),
      rol,
      fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { uid, email, displayName, rol };
  }

  async obtenerUsuario(uid: string) {
    const doc = await this.firestore.collection('usuarios').doc(uid).get();
    return doc.exists ? doc.data() : null;
  }

  /**
 * Listar usuarios con filtros y paginación
 * @param filter texto para buscar en email o display_name (ignora mayúsculas/minúsculas)
 * @param page número de página (default: 1)
 * @param limit cantidad de resultados por página (default: 10)
 */
  async listarUsuarios(filter?: string, page = 1, limit = 10) {
    let usuarios: any[] = [];
    let totalCount = 0;

    // Normalizar filtro a minúsculas
    const filterLower = filter ? filter.toLowerCase() : undefined;

    if (filterLower) {
      const byEmailQuery = this.firestore
        .collection('usuarios')
        .where('email_lower', '>=', filterLower)
        .where('email_lower', '<=', filterLower + '\uf8ff');

      const byNameQuery = this.firestore
        .collection('usuarios')
        .where('display_name_lower', '>=', filterLower)
        .where('display_name_lower', '<=', filterLower + '\uf8ff');

      // contar ambos
      const totalEmail = await byEmailQuery.count().get();
      const totalName = await byNameQuery.count().get();
      totalCount = totalEmail.data().count + totalName.data().count;

      // obtener datos
      const byEmail = await byEmailQuery
        .orderBy('email_lower')
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      const byName = await byNameQuery
        .orderBy('display_name_lower')
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      usuarios = [
        ...byEmail.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
        ...byName.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
      ];
    } else {
      const baseQuery = this.firestore.collection('usuarios');

      // contar total
      const totalSnap = await baseQuery.count().get();
      totalCount = totalSnap.data().count;

      // obtener página
      const snapshot = await baseQuery
        .orderBy('email_lower')
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      usuarios = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    }

    const totalPages = Math.ceil(totalCount / limit);

    return {
      usuarios,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  }


  async actualizarUsuario(uid: string, data: Partial<{ email: string; displayName: string; rol: string }>) {
    const updateData: any = {};

    if (data.email) {
      updateData.email = data.email;
      updateData.email_lower = data.email.toLowerCase();
    }
    if (data.displayName) {
      updateData.display_name = data.displayName;
      updateData.display_name_lower = data.displayName.toLowerCase();
    }
    if (data.rol) {
      updateData.rol = data.rol;
    }

    await this.firestore.collection('usuarios').doc(uid).update(updateData);

    const updatedDoc = await this.firestore.collection('usuarios').doc(uid).get();
    return { uid, ...updatedDoc.data() };
  }
  
  async eliminarUsuario(uid: string) {
    await this.firestore.collection('usuarios').doc(uid).delete();
    return { deleted: true, uid };
  }
}
