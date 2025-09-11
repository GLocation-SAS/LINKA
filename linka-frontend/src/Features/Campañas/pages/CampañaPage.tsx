// src/Features/Dashboard/pages/DashboardPage.tsx
import { useState, useEffect, useMemo } from "react";
import { Typography } from "@mui/material";
import Layout from "../../../components/layout";
import { useUser } from "../../../Context/UserContext";
import { Stack } from "@mui/material";
import { crearCampana, actualizarCampana, eliminarCampana, listarCampanas } from "../services/campanasService";
import FiltrosCampanas from "../components/FiltrosCampanas";
import CampanaDialog from "../components/CampanaDialog";
import TablaCampanas from "../components/TablaCampanas";
import FeedbackModal from "../../../components/FeedbackModal";
import PaginationTable from "../../../components/PaginationTable";
import type { Campana } from "../Types/types";
import { startOfDayISO, endOfDayISO } from "../../../utils/date";

export default function CampanasPage() {
  const { uid, rol } = useUser();

  // Listado & paginación
  const [rows, setRows] = useState<Campana[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [nombre, setNombre] = useState("");
  const [[startDate, endDate], setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Crear / Editar / Eliminar (dialogs)
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Campana | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Campana | null>(null);

  // Confirmaciones (FeedbackModal) para crear/editar
  const [askCreate, setAskCreate] = useState<string | null>(null);
  const [askUpdate, setAskUpdate] = useState<string | null>(null);

  // Loaders por acción (para FeedbackModal.loadingConfirm)
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Éxito / Error
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Para encadenar -> abrir modal de éxito tras cerrar confirmación + terminar loader
  const [pendingSuccess, setPendingSuccess] = useState<null | "create" | "update" | "delete">(null);

  const params = useMemo(() => {
    const p: any = { page, limit };
    if (nombre.trim()) p.nombre = nombre.trim();
    if (startDate) p.fechaInicio = startOfDayISO(startDate);
    if (endDate) p.fechaFin = endOfDayISO(endDate);
    if (rol !== "admin" && uid) p.idUsuario = uid; // 👈 solo si no es admin
    return p;
  }, [page, limit, nombre, startDate, endDate, uid, rol]);


  const fetchData = async (customParams?: any) => {
    setLoading(true);
    try {
      const res = await listarCampanas(customParams ?? params);
      setRows(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo obtener el listado de campañas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, uid]); // Los filtros se aplican manualmente con botón

  const applyFilters = async () => {
    const firstPageParams = { ...params, page: 1 };
    setPage(1);
    await fetchData(firstPageParams);
  };

  const clearFilters = async () => {
    setNombre("");
    setDateRange([null, null]);
    setPage(1);
    await fetchData({ page: 1, limit });
  };

  // ---------- Crear ----------
  // Desde el diálogo: en vez de crear directo, abrimos confirmación
  const handleCreateAsk = async (nombreNuevo: string) => {
    if (!uid) {
      setModalError("No se pudo identificar al usuario. Inicia sesión nuevamente.");
      return;
    }
    if (!nombreNuevo) return;
    setAskCreate(nombreNuevo);
  };

  const doCreate = async () => {
    if (!askCreate || !uid) return;
    setLoadingCreate(true);
    try {
      await crearCampana({ nombre: askCreate, idUsuario: uid });
      setPendingSuccess("create");
      // refrescamos listado (desde page 1)
      await fetchData({ ...params, page: 1 });
      setPage(1);
      setOpenCreate(false);
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo crear la campaña.");
    } finally {
      setLoadingCreate(false);
      setAskCreate(null); // cierra modal confirmación
    }
  };

  // ---------- Editar ----------
  const handleOpenEdit = (row: Campana) => {
    setCurrentEdit(row);
    setOpenEdit(true);
  };

  // Desde el diálogo de editar, pedimos confirmación con el nuevo nombre
  const handleEditAsk = async (nombreNuevo: string) => {
    if (!currentEdit?.idCampana || !nombreNuevo) return;
    setAskUpdate(nombreNuevo);
  };

  const doUpdate = async () => {
    if (!currentEdit?.idCampana || !askUpdate) return;
    setLoadingUpdate(true);
    try {
      await actualizarCampana(currentEdit.idCampana, { nombre: askUpdate });
      setPendingSuccess("update");
      setOpenEdit(false);
      setCurrentEdit(null);
      await fetchData();
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo actualizar la campaña.");
    } finally {
      setLoadingUpdate(false);
      setAskUpdate(null); // cierra confirmación
    }
  };

  // ---------- Eliminar ----------
  const handleDelete = async () => {
    if (!confirmDelete?.idCampana) return;
    setLoadingDelete(true);
    try {
      await eliminarCampana(confirmDelete.idCampana);
      // Si la última del page se borró, reequilibrar
      if (rows.length === 1 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        await fetchData({ ...params, page: newPage });
      } else {
        await fetchData();
      }
      setPendingSuccess("delete");
      setConfirmDelete(null); // cierra confirmación
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo eliminar la campaña.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // ---------- Encadenado: abrir éxito tras cerrar confirmación + terminar loader ----------
  useEffect(() => {
    if (pendingSuccess === "create" && !loadingCreate && !askCreate) {
      const t = setTimeout(() => {
        setModalSuccess("¡Campaña creada correctamente!");
        setPendingSuccess(null);
      }, 200);
      return () => clearTimeout(t);
    }
    if (pendingSuccess === "update" && !loadingUpdate && !askUpdate) {
      const t = setTimeout(() => {
        setModalSuccess("¡Campaña actualizada!");
        setPendingSuccess(null);
      }, 200);
      return () => clearTimeout(t);
    }
    if (pendingSuccess === "delete" && !loadingDelete && !confirmDelete) {
      const t = setTimeout(() => {
        setModalSuccess("Campaña eliminada.");
        setPendingSuccess(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [pendingSuccess, loadingCreate, askCreate, loadingUpdate, askUpdate, loadingDelete, confirmDelete]);

  return (
    <Layout>
      <Stack spacing={2}>
        <Stack direction="column" spacing={0.5}>
          <Typography variant="h4" fontWeight={700}>
            Campañas
          </Typography>
          <Typography fontSize={16} color="text.secondary">
            Organiza tus envíos en campañas para un mejor seguimiento.
          </Typography>
        </Stack>

        {/* Filtros */}
        <FiltrosCampanas
          filter={nombre}
          setFilter={setNombre}
          startDate={startDate}
          endDate={endDate}
          setDateRange={setDateRange}
          onSearch={applyFilters}
          onClear={clearFilters}
          onOpenCreate={() => setOpenCreate(true)}
          searching={loading}
        />

        {/* Tabla */}
        <TablaCampanas
          rows={rows}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={(r) => setConfirmDelete(r)}
        />

        {/* Paginación */}
        <PaginationTable
          page={page}
          limit={limit}
          totalPages={totalPages}
          onChangePage={(p) => setPage(p)}
          onChangeLimit={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </Stack>

      {/* Dialog Crear */}
      <CampanaDialog
        open={openCreate}
        mode="create"
        loading={loadingCreate} // opcional, deshabilita el form si quieres
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateAsk} // 👈 ahora pide confirmación
      />

      {/* Dialog Editar */}
      <CampanaDialog
        open={openEdit}
        mode="edit"
        initialName={currentEdit?.nombre || ""}
        loading={loadingUpdate}
        onClose={() => {
          setOpenEdit(false);
          setCurrentEdit(null);
        }}
        onSubmit={handleEditAsk} // 👈 ahora pide confirmación
      />

      {/* Confirmar Crear */}
      <FeedbackModal
        open={Boolean(askCreate)}
        type="confirm"
        title="¿Crear campaña?"
        description={
          askCreate ? (
            <Typography>
              Se creará la campaña <strong>"{askCreate}"</strong>.
            </Typography>
          ) : undefined
        }
        confirmLabel="Crear"
        cancelLabel="Cancelar"
        onConfirm={doCreate}
        onClose={() => { if (!loadingCreate) setAskCreate(null); }}
        loadingConfirm={loadingCreate}
        loadingTitle="Creando campaña..."
        loadingDescription={askCreate ? `Registrando "${askCreate}".` : "Registrando campaña."}
      />

      {/* Confirmar Editar */}
      <FeedbackModal
        open={Boolean(askUpdate)}
        type="confirm"
        title="¿Actualizar campaña?"
        description={
          askUpdate ? (
            <Typography>
              Se actualizará el nombre a <strong>"{askUpdate}"</strong>.
            </Typography>
          ) : undefined
        }
        confirmLabel="Actualizar"
        cancelLabel="Cancelar"
        onConfirm={doUpdate}
        onClose={() => { if (!loadingUpdate) setAskUpdate(null); }}
        loadingConfirm={loadingUpdate}
        loadingTitle="Actualizando campaña..."
        loadingDescription={askUpdate ? `Guardando cambios: "${askUpdate}".` : "Guardando cambios."}
      />

      {/* Confirmar Eliminar */}
      <FeedbackModal
        open={Boolean(confirmDelete)}
        type="confirm"
        title="¿Eliminar campaña?"
        description={
          <Typography>
            Esta acción no se puede deshacer. Se eliminará la campaña{" "}
            <strong>{confirmDelete?.nombre}</strong>, así como todas sus{" "}
            <strong>audiencias</strong> y los <strong>contactos</strong> que
            pertenecen a ellas.
          </Typography>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onClose={() => { if (!loadingDelete) setConfirmDelete(null); }}
        loadingConfirm={loadingDelete}
        loadingTitle="Eliminando campaña..."
        loadingDescription={
          confirmDelete?.nombre
            ? `Eliminando "${confirmDelete.nombre}".`
            : "Eliminando campaña."
        }
      />

      {/* Éxito */}
      <FeedbackModal
        open={Boolean(modalSuccess)}
        type="success"
        title={modalSuccess || "Éxito"}
        description={
          modalSuccess === "¡Campaña creada correctamente!"
            ? "La campaña fue registrada y ya aparece en tu listado."
            : modalSuccess === "¡Campaña actualizada!"
              ? "Los cambios fueron guardados exitosamente."
              : modalSuccess === "Campaña eliminada."
                ? "La campaña y sus datos relacionados fueron eliminados."
                : undefined
        }
        onClose={() => setModalSuccess(null)}
      />

      {/* Error */}
      <FeedbackModal
        open={Boolean(modalError)}
        type="error"
        title="Ocurrió un error"
        description={modalError || undefined}
        onClose={() => setModalError(null)}
      />
    </Layout>
  );
}
