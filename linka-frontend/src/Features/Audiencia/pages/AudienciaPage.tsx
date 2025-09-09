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
    const { uid } = useUser();

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

    // Modales de feedback
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
    const [askCreate, setAskCreate] = useState<null | { payload: { nombre: string; idCampana: string; contactos: ContactoIn[] } }>(null);
    const [askUpdate, setAskUpdate] = useState<null | { payload: { nombre?: string; idCampana?: string; contactosAgregar?: ContactoIn[]; contactosEliminar?: string[] } }>(null);
    const [confirmCreate, setConfirmCreate] = useState(false);
    const [confirmUpdate, setConfirmUpdate] = useState(false);

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
        limit, page,
    }), [debouncedNombreAudiencia, debouncedNombreCampana, startDate, endDate, limit, page]);

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
        try {
            await crearAudiencia({ ...askCreate.payload, idUsuario: uid });
            fetchData();
            setOpenCreate(false);
            setPage(1);
            setConfirmCreate(true);
        } catch (e) {
            console.error(e);
        } finally {
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
        try {
            await actualizarAudiencia(editing.idAudiencia, askUpdate.payload);
            setOpenEdit(false);
            setEditing(null);
            fetchData();
            setConfirmUpdate(true);
        } catch (e) {
            console.error(e);
        } finally {
            setAskUpdate(null);
        }
    };

    const confirmRemove = (idAudiencia: string) => setConfirmDelete({ open: true, id: idAudiencia });
    const doRemove = async () => {
        if (!confirmDelete.id) return;
        try {
            await eliminarAudiencia(confirmDelete.id);
            setConfirmDelete({ open: false });
            if (rows.length === 1 && page > 1) setPage(page - 1);
            else fetchData();
        } catch (e) {
            console.error(e);
        }
    };

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
                onClose={() => setConfirmDelete({ open: false })}
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
                onClose={() => setAskCreate(null)}
            />

            {/* ✅ Confirmar creación */}
            <FeedbackModal
                open={confirmCreate}
                type="success"
                title="Audiencia creada"
                description="La audiencia fue creada correctamente junto con sus contactos."
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
                onClose={() => setAskUpdate(null)}
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
