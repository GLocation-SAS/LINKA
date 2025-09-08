// src/Features/Usuarios/pages/UsuariosPage.tsx
import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import FiltrosUsuarios from "../components/FiltrosUsuarios";
import TablaUsuarios from "../components/TablaUsuarios";
import EditarUsuarioDialog from "../components/EditarUsuarioDialog";
import CrearUsuarioDialog from "../components/CrearUsuarioDialog";
import PaginationTable from "../../../components/PaginationTable";
import {
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuariosService";
import Layout from "../../../components/layout";
import Loading from "../../../components/Loading";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FeedbackModal from "../../../components/FeedbackModal";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCrear, setOpenCrear] = useState(false);
  const [loading, setLoading] = useState(false);

  // ====== Estados para UPDATE ======
  const [pendingUpdate, setPendingUpdate] = useState<any | null>(null);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [showSuccessUpdate, setShowSuccessUpdate] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState<string | null>(null);

  // ====== Estados para DELETE ======
  const [pendingDelete, setPendingDelete] = useState<{ uid: string; email?: string; display_name?: string } | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showSuccessDelete, setShowSuccessDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState<string | null>(null);

  const fetchUsuarios = async (params = {}) => {
    try {
      setLoading(true);
      const data = await listarUsuarios({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      setUsuarios(data.usuarios || []);
      setPagination(data.pagination || { page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      setUsuarios([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.limit]);

  const handleEdit = (usuario: any) => {
    setSelectedUser(usuario);
    setOpenDialog(true);
  };

  // Intercepta el guardar para pedir confirmación primero
  const handleSaveRequested = async (data: any) => {
    setErrorUpdate(null);
    setPendingUpdate(data);
    setShowConfirmUpdate(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedUser || !pendingUpdate) return;
    setLoadingUpdate(true);
    try {
      await actualizarUsuario(selectedUser.uid, pendingUpdate);
      setShowConfirmUpdate(false);
      setOpenDialog(false);
      setShowSuccessUpdate(true);
      await fetchUsuarios();
    } catch (err: any) {
      console.error("Error al actualizar usuario:", err);
      setShowConfirmUpdate(false);
      setErrorUpdate(
        err?.response?.data?.message || "❌ No se pudo actualizar el usuario."
      );
    } finally {
      setLoadingUpdate(false);
      setPendingUpdate(null);
    }
  };

  // Intercepta el eliminar para pedir confirmación primero
  const handleDeleteRequested = (uid: string) => {
    const user = usuarios.find((u) => u.uid === uid);
    setErrorDelete(null);
    setPendingDelete({
      uid,
      email: user?.email,
      display_name: user?.display_name || user?.displayName,
    });
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setLoadingDelete(true);
    try {
      await eliminarUsuario(pendingDelete.uid);
      setShowConfirmDelete(false);
      setShowSuccessDelete(true);
      await fetchUsuarios();
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      setShowConfirmDelete(false);
      setErrorDelete(
        err?.response?.data?.message || "❌ No se pudo eliminar el usuario."
      );
    } finally {
      setLoadingDelete(false);
      setPendingDelete(null);
    }
  };

  return (
    <Layout>
      {/* 🔹 Header con botón */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Gestionar Usuarios
          </Typography>
          <Typography fontSize={16} color="text.secondary">
            Añade, edita o elimina usuarios y gestiona sus roles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenCrear(true)}
        >
          Crear usuario
        </Button>
      </Stack>

      {/* 🔹 Filtros */}
      <FiltrosUsuarios onFilter={setFilters} />

      {/* 🔹 Tabla con loading y vacío */}
      {loading ? (
        <Loading height="300px" />
      ) : usuarios.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No hay usuarios encontrados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ajusta los filtros aplicados para ver resultados.
          </Typography>
        </Box>
      ) : (
        <>
          <TablaUsuarios
            usuarios={usuarios}
            onEdit={handleEdit}
            onDelete={handleDeleteRequested} // 👈 ahora abre confirmación
          />

          {/* 🔹 Paginación */}
          <PaginationTable
            page={pagination.page}
            limit={pagination.limit}
            totalPages={pagination.totalPages}
            onChangePage={(page) =>
              setPagination((prev: any) => ({ ...prev, page }))
            }
            onChangeLimit={(limit) =>
              setPagination((prev: any) => ({ ...prev, limit, page: 1 }))
            }
          />
        </>
      )}

      {/* 🔹 Editar Usuario */}
      <EditarUsuarioDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveRequested} // 👈 intercepta para confirmar
        usuario={selectedUser}
      />

      {/* 🔹 Crear Usuario */}
      <CrearUsuarioDialog
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        onCreated={fetchUsuarios}
      />

      {/* ===== Modales UPDATE ===== */}
      <FeedbackModal
        open={showConfirmUpdate}
        type="confirm"
        title="¿Guardar cambios del usuario?"
        description={
          selectedUser && pendingUpdate ? (
            <>
              <strong>Usuario:</strong> {selectedUser?.display_name || selectedUser?.displayName || selectedUser?.email}
              <br />
              {/* Muestra algunos cambios clave si existen */}
              {"rol" in pendingUpdate && (
                <>
                  <strong>Rol nuevo:</strong> {pendingUpdate.rol}
                  <br />
                </>
              )}
              {"estado" in pendingUpdate && (
                <>
                  <strong>Estado nuevo:</strong> {pendingUpdate.estado}
                </>
              )}
            </>
          ) : undefined
        }
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmUpdate}
        onClose={() => setShowConfirmUpdate(false)}
        loadingConfirm={loadingUpdate}
      />

      <FeedbackModal
        open={showSuccessUpdate}
        type="success"
        title="¡Cambios guardados!"
        description="Los datos del usuario se actualizaron correctamente."
        confirmLabel="Aceptar"
        onClose={() => setShowSuccessUpdate(false)}
      />

      <FeedbackModal
        open={Boolean(errorUpdate)}
        type="error"
        title="No se pudo actualizar"
        description={errorUpdate || undefined}
        confirmLabel="Entendido"
        onClose={() => setErrorUpdate(null)}
      />

      {/* ===== Modales DELETE ===== */}
      <FeedbackModal
        open={showConfirmDelete}
        type="confirm"
        title="¿Eliminar este usuario?"
        description={
          pendingDelete ? (
            <>
              Esta acción no se puede deshacer.
              <br />
              <strong>Usuario:</strong>{" "}
              {pendingDelete.display_name || pendingDelete.email || pendingDelete.uid}
            </>
          ) : undefined
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        loadingConfirm={loadingDelete}
      />

      <FeedbackModal
        open={showSuccessDelete}
        type="success"
        title="Usuario eliminado"
        description="El usuario fue eliminado correctamente."
        confirmLabel="Aceptar"
        onClose={() => setShowSuccessDelete(false)}
      />

      <FeedbackModal
        open={Boolean(errorDelete)}
        type="error"
        title="No se pudo eliminar"
        description={errorDelete || undefined}
        confirmLabel="Entendido"
        onClose={() => setErrorDelete(null)}
      />
    </Layout>
  );
}
