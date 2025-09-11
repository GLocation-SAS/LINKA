import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import PaginationTable from "../../../components/PaginationTable";
import Loading from "../../../components/Loading";
import FiltrosAudiencias from "../components/FiltrosAudiencias";
import TablaAudiencias from "../components/TablaAudiencias";
import AudienciaDialog from "../components/AudienciaDialog";
import VerAudienciaDialog from "../components/VerAudienciaDialog";
import FeedbackModal from "../../../components/FeedbackModal";
import {
    listarAudiencias, crearAudiencia, obtenerAudiencia,
    actualizarAudiencia, eliminarAudiencia,
    type AudienciaRow, type AudienciaDetalle, type ContactoIn
} from "../services/audienciasService";
import { useUser } from "../../../Context/UserContext";

// Utilidades para fechas
const toIsoStart = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString(); };
const toIsoEnd = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x.toISOString(); };

export default function AudienciaPage() {
    // Filtros
    const [nombreAudiencia, setNombreAudiencia] = useState("");
    const [nombreCampana, setNombreCampana] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const { uid, rol } = useUser();

    // Tabla & paginación
    const [rows, setRows] = useState<AudienciaRow[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Estado
    const [loading, setLoading] = useState(false);

    // Dialogs
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<AudienciaRow | null>(null);
    const [openView, setOpenView] = useState(false);
    const [detalle, setDetalle] = useState<AudienciaDetalle | null>(null);

    // Modales de confirmación
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
    const [askCreate, setAskCreate] = useState<null | { payload: { nombre: string; idCampana: string; contactos: ContactoIn[] } }>(null);
    const [askUpdate, setAskUpdate] = useState<null | { payload: { nombre?: string; idCampana?: string; contactosAgregar?: ContactoIn[]; contactosEliminar?: string[] } }>(null);

    // Modales de éxito
    const [confirmCreate, setConfirmCreate] = useState(false);
    const [confirmUpdate, setConfirmUpdate] = useState(false);
    const [confirmDeleteSuccess, setConfirmDeleteSuccess] = useState(false);

    // Loading de acciones (para los modales)
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    // ⏳ Bandera para encadenar el modal de éxito tras cerrar el de confirmación+loading
    const [pendingSuccess, setPendingSuccess] = useState<null | "create" | "update" | "delete">(null);

    const [lastCreatedName, setLastCreatedName] = useState<string | null>(null);


    // Debounce
    const [debouncedNombreAudiencia, setDebouncedNombreAudiencia] = useState("");
    const [debouncedNombreCampana, setDebouncedNombreCampana] = useState("");
    useEffect(() => { const t = setTimeout(() => setDebouncedNombreAudiencia(nombreAudiencia), 300); return () => clearTimeout(t); }, [nombreAudiencia]);
    useEffect(() => { const t = setTimeout(() => setDebouncedNombreCampana(nombreCampana), 300); return () => clearTimeout(t); }, [nombreCampana]);

    const queryParams = useMemo(() => ({
        nombreAudiencia: debouncedNombreAudiencia || undefined,
        nombreCampana: debouncedNombreCampana || undefined,
        fechaInicio: startDate ? toIsoStart(startDate) : undefined,
        fechaFin: endDate ? toIsoEnd(endDate) : undefined,
        limit,
        page,
        idUsuario: rol === "admin" ? undefined : uid ?? undefined, // 👈 solo si no es admin
    }), [
        debouncedNombreAudiencia,
        debouncedNombreCampana,
        startDate,
        endDate,
        limit,
        page,
        uid,
        rol,
    ]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await listarAudiencias(queryParams);
            setRows(res.data ?? []);
            setTotalPages(res.pagination?.totalPages ?? 1);
        } catch (e) {
            console.error("Error listando audiencias:", e);
            setRows([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [queryParams]);

    const handleSearch = () => setPage(1);
    const handleClear = () => {
        setNombreAudiencia("");
        setNombreCampana("");
        setStartDate(null);
        setEndDate(null);
        setPage(1);
    };

    // Acciones
    const openViewDetalle = async (idAudiencia: string) => {
        setOpenView(true);
        setDetalle(null);
        try {
            const d = await obtenerAudiencia(idAudiencia);
            setDetalle(d);
        } catch (e) {
            console.error(e);
        }
    };

    const openEditDialog = (row: AudienciaRow) => {
        setEditing(row);
        setOpenEdit(true);
    };

    const submitCreate = async (payload: { nombre: string; idCampana: string; contactos: ContactoIn[] }) => {
        setAskCreate({ payload });
    };

    const doCreate = async () => {
        if (!askCreate) return;
        setLoadingCreate(true);
        try {
            await crearAudiencia({ ...askCreate.payload, idUsuario: uid });
            setLastCreatedName(askCreate.payload.nombre); // 👈 guardar nombre creado
            await fetchData();
            setOpenCreate(false);
            setPage(1);
            setPendingSuccess("create");
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCreate(false);
            setAskCreate(null);
        }
    };


    const submitUpdate = async (payload: {
        nombre?: string; idCampana?: string; contactosAgregar?: ContactoIn[]; contactosEliminar?: string[];
    }) => {
        if (!editing) return;
        setAskUpdate({ payload });
    };

    const doUpdate = async () => {
        if (!editing || !askUpdate) return;
        setLoadingUpdate(true);
        try {
            await actualizarAudiencia(editing.idAudiencia, askUpdate.payload);
            setOpenEdit(false);
            setEditing(null);
            await fetchData();
            setPendingSuccess("update");
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUpdate(false);
            setAskUpdate(null); // cierre del modal de confirmación
        }
    };

    const confirmRemove = (idAudiencia: string) => setConfirmDelete({ open: true, id: idAudiencia });

    const doRemove = async () => {
        if (!confirmDelete.id) return;
        setLoadingDelete(true);
        try {
            await eliminarAudiencia(confirmDelete.id);
            if (rows.length === 1 && page > 1) setPage(page - 1);
            else await fetchData();
            // Primero marcamos para abrir éxito y luego cerramos el modal de confirmación
            setPendingSuccess("delete");
            setConfirmDelete({ open: false });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDelete(false);
        }
    };

    // ✅ Efecto que abre el modal de éxito con un pequeño delay tras cerrar el de confirmación
    useEffect(() => {
        if (pendingSuccess === "create" && !loadingCreate && !askCreate) {
            const t = setTimeout(() => {
                setConfirmCreate(true);
                setPendingSuccess(null);
            }, 200);
            return () => clearTimeout(t);
        }
        if (pendingSuccess === "update" && !loadingUpdate && !askUpdate) {
            const t = setTimeout(() => {
                setConfirmUpdate(true);
                setPendingSuccess(null);
            }, 200);
            return () => clearTimeout(t);
        }
        if (pendingSuccess === "delete" && !loadingDelete && !confirmDelete.open) {
            const t = setTimeout(() => {
                setConfirmDeleteSuccess(true);
                setPendingSuccess(null);
            }, 200);
            return () => clearTimeout(t);
        }
    }, [pendingSuccess, loadingCreate, askCreate, loadingUpdate, askUpdate, loadingDelete, confirmDelete.open]);

    return (
        <Layout>
            <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack>
                        <Typography variant="h4" fontWeight={700}>Audiencias</Typography>
                        <Typography fontSize={16} color="text.secondary">Gestiona y consulta audiencias con sus contactos.</Typography>
                    </Stack>
                </Stack>

                <FiltrosAudiencias
                    nombreAudiencia={nombreAudiencia}
                    setNombreAudiencia={setNombreAudiencia}
                    nombreCampana={nombreCampana}
                    setNombreCampana={setNombreCampana}
                    startDate={startDate}
                    endDate={endDate}
                    setDateRange={([fi, ff]) => { setStartDate(fi); setEndDate(ff); }}
                    onSearch={handleSearch}
                    onClear={handleClear}
                    searching={loading}
                    onOpenCreate={() => setOpenCreate(true)}
                />

                {loading ? (
                    <Loading height={240} />
                ) : (
                    <>
                        <TablaAudiencias
                            rows={rows}
                            onView={openViewDetalle}
                            onEdit={openEditDialog}
                            onDelete={confirmRemove}
                        />
                        <PaginationTable
                            page={page}
                            limit={limit}
                            totalPages={totalPages}
                            onChangePage={(p) => setPage(p)}
                            onChangeLimit={(l) => { setLimit(l); setPage(1); }}
                        />
                    </>
                )}
            </Box>

            {/* Crear */}
            <AudienciaDialog
                open={openCreate}
                mode="create"
                onClose={() => setOpenCreate(false)}
                onSubmit={submitCreate}
            />

            {/* Editar */}
            <AudienciaDialog
                open={openEdit}
                mode="edit"
                initial={editing ?? undefined}
                onClose={() => { setOpenEdit(false); setEditing(null); }}
                onSubmit={() => { }}
                onUpdate={submitUpdate}
            />

            {/* Ver */}
            <VerAudienciaDialog open={openView} onClose={() => setOpenView(false)} detalle={detalle} />

            {/* ❌ Confirmar eliminar */}
            <FeedbackModal
                open={confirmDelete.open}
                type="confirm"
                title="¿Eliminar audiencia?"
                description="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={doRemove}
                onClose={() => { if (!loadingDelete) setConfirmDelete({ open: false }); }}
                loadingConfirm={loadingDelete}
                loadingTitle="Eliminando audiencia..."
                loadingDescription="Estamos eliminando la audiencia. Por favor espera."
            />

            {/* ✅ Eliminación exitosa */}
            <FeedbackModal
                open={confirmDeleteSuccess}
                type="success"
                title="Audiencia eliminada"
                description="La audiencia se eliminó correctamente."
                confirmLabel="Aceptar"
                onConfirm={() => setConfirmDeleteSuccess(false)}
                onClose={() => setConfirmDeleteSuccess(false)}
            />

            {/* ❓ Preguntar creación */}
            <FeedbackModal
                open={!!askCreate}
                type="confirm"
                title="¿Crear audiencia?"
                description={`Se creará la audiencia "${askCreate?.payload.nombre}" junto con sus contactos.`}
                confirmLabel="Crear"
                cancelLabel="Cancelar"
                onConfirm={doCreate}
                onClose={() => { if (!loadingCreate) setAskCreate(null); }}
                loadingConfirm={loadingCreate}
                loadingTitle="Creando audiencia..."
                loadingDescription={`Creando "${askCreate?.payload.nombre}". Esto tomará unos segundos.`}
            />


            {/* ✅ Confirmar creación */}
            <FeedbackModal
                open={confirmCreate}
                type="success"
                title="Audiencia creada"
                description={
                    lastCreatedName
                        ? `La audiencia "${lastCreatedName}" fue creada correctamente junto con sus contactos.`
                        : "La audiencia fue creada correctamente junto con sus contactos."
                }
                confirmLabel="Aceptar"
                onConfirm={() => setConfirmCreate(false)}
                onClose={() => setConfirmCreate(false)}
            />


            {/* ❓ Preguntar actualización */}
            <FeedbackModal
                open={!!askUpdate}
                type="confirm"
                title="¿Actualizar audiencia?"
                description={`Se guardarán los cambios realizados en la audiencia "${editing?.nombre_audiencia}".`}
                confirmLabel="Actualizar"
                cancelLabel="Cancelar"
                onConfirm={doUpdate}
                onClose={() => { if (!loadingUpdate) setAskUpdate(null); }}
                loadingConfirm={loadingUpdate}
                loadingTitle="Actualizando audiencia..."
                loadingDescription={`Guardando cambios en "${editing?.nombre_audiencia}".`}
            />

            {/* ✅ Confirmar actualización */}
            <FeedbackModal
                open={confirmUpdate}
                type="success"
                title="Audiencia actualizada"
                description="Los cambios realizados en la audiencia se guardaron correctamente."
                confirmLabel="Aceptar"
                onConfirm={() => setConfirmUpdate(false)}
                onClose={() => setConfirmUpdate(false)}
            />
        </Layout>
    );
}
