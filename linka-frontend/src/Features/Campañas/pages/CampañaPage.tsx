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
  const { uid } = useUser();

  // Listado & paginación
  const [rows, setRows] = useState<Campana[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [nombre, setNombre] = useState("");
  const [[startDate, endDate], setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Crear / Editar / Eliminar
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Campana | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Campana | null>(null);

  const [busyAction, setBusyAction] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: any = { page, limit };
    if (nombre.trim()) p.nombre = nombre.trim();
    if (startDate) p.fechaInicio = startOfDayISO(startDate);
    if (endDate) p.fechaFin = endOfDayISO(endDate);
    return p;
  }, [page, limit, nombre, startDate, endDate]);

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
  }, [page, limit]); // Los filtros se aplican manualmente con botón

  const applyFilters = async () => {
    // Forzar page 1 en la aplicación de filtros y evitar doble fetch
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

  // Crear
  const handleCreate = async (nombre: string) => {
    if (!uid) {
      setModalError("No se pudo identificar al usuario. Inicia sesión nuevamente.");
      return;
    }
    if (!nombre) return;
    setBusyAction(true);
    try {
      await crearCampana({ nombre, idUsuario: uid });
      setOpenCreate(false);
      setModalSuccess("¡Campaña creada correctamente!");
      await fetchData({ ...params, page: 1 }); // mostrar desde la primera página
      setPage(1);
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo crear la campaña.");
    } finally {
      setBusyAction(false);
    }
  };

  // Editar
  const handleOpenEdit = (row: Campana) => {
    setCurrentEdit(row);
    setOpenEdit(true);
  };
  const handleEdit = async (nombre: string) => {
    if (!currentEdit?.idCampana || !nombre) return;
    setBusyAction(true);
    try {
      await actualizarCampana(currentEdit.idCampana, { nombre });
      setOpenEdit(false);
      setCurrentEdit(null);
      setModalSuccess("¡Campaña actualizada!");
      await fetchData();
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo actualizar la campaña.");
    } finally {
      setBusyAction(false);
    }
  };

  // Eliminar
  const handleDelete = async () => {
    if (!confirmDelete?.idCampana) return;
    setBusyAction(true);
    try {
      await eliminarCampana(confirmDelete.idCampana);
      setConfirmDelete(null);
      setModalSuccess("Campaña eliminada.");
      // Si la última del page se borró, intenta reequilibrar
      if (rows.length === 1 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        await fetchData({ ...params, page: newPage });
      } else {
        await fetchData();
      }
    } catch (e: any) {
      console.error(e);
      setModalError("No se pudo eliminar la campaña.");
    } finally {
      setBusyAction(false);
    }
  };

  return (
    <Layout>
      <Stack spacing={2}>
        <Stack
          direction="column"
          spacing={0.5}
        >
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
        loading={busyAction}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />

      {/* Dialog Editar */}
      <CampanaDialog
        open={openEdit}
        mode="edit"
        initialName={currentEdit?.nombre || ""}
        loading={busyAction}
        onClose={() => {
          setOpenEdit(false);
          setCurrentEdit(null);
        }}
        onSubmit={handleEdit}
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
        onClose={() => setConfirmDelete(null)}
        loadingConfirm={busyAction}
      />


      {/* Éxito */}
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
