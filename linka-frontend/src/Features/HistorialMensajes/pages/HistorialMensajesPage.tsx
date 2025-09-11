// src/Features/HistorialMensajes/pages/HistorialMensajesPage.tsx
import { useState, useEffect } from "react";
import Layout from "../../../components/layout";
import Loading from "../../../components/Loading";
import PaginationTable from "../../../components/PaginationTable";
import FiltrosHistorialMensajes from "../components/FiltrosHistorialMensajes";
import TablaHistorialMensajes from "../components/TablaHistorialMensajes";
import VerDetalleMensajeDialog from "../components/VerDetalleMensajeDialog";
import {
    listarMensajes,
    obtenerMensaje,
    type Mensaje,
} from "../services/historialMensajesService";
import { startOfDayISO, endOfDayISO } from "../../../utils/date";
import { Stack, Typography } from "@mui/material";
import { useUser } from "../../../Context/UserContext";

export default function HistorialMensajesPage() {
    const { uid } = useUser();
    const [rows, setRows] = useState<Mensaje[]>([]);
    const [loadingTabla, setLoadingTabla] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // 🔹 Filtros
    const [nombreCampana, setNombreCampana] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const setDateRange = (range: [Date | null, Date | null]) => {
        setStartDate(range[0]);
        setEndDate(range[1]);
    };

    // 🔹 Modal detalle
    const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null);
    const [openDetalle, setOpenDetalle] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const handleVerDetalle = async (idMensaje: string) => {
        setOpenDetalle(true);
        setLoadingDetalle(true);
        try {
            const detalle = await obtenerMensaje(idMensaje);
            setSelectedMensaje(detalle);
        } catch (error) {
            console.error("Error al obtener detalle del mensaje:", error);
        } finally {
            setLoadingDetalle(false);
        }
    };

    // 🔹 Fetch mensajes
    const fetchData = async () => {
        setLoadingTabla(true);
        try {
            const res = await listarMensajes({
                tipo: tipo || undefined,
                estado: estado || undefined,
                nombreCampana: nombreCampana || undefined,
                fechaInicio: startDate ? startOfDayISO(startDate) : undefined,
                fechaFin: endDate ? endOfDayISO(endDate) : undefined,
                idUsuario: uid, // Siempre traer de todos los usuarios
                limit,
                page,
            });
            setRows(res.data);
            setTotalPages(res.pagination.totalPages);
        } finally {
            setLoadingTabla(false);
        }
    };

    // ✅ Reactivo a filtros + paginación
    useEffect(() => {
        setPage(1);
        fetchData();
    }, [nombreCampana, tipo, estado, startDate, endDate,uid]);

    useEffect(() => {
        fetchData();
    }, [page, limit]);

    const handleClear = () => {
        setNombreCampana("");
        setTipo("");
        setEstado("");
        setStartDate(null);
        setEndDate(null);
        setPage(1);
    };

    return (
        <Layout>
            <Stack direction="column" alignItems="left" sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                    Historial de envíos masivos
                </Typography>
                <Typography fontSize={16} color="text.secondary">
                    Revisa tus envíos de campañas anteriores
                </Typography>
            </Stack>

            <FiltrosHistorialMensajes
                nombreCampana={nombreCampana}
                setNombreCampana={setNombreCampana}
                tipo={tipo}
                setTipo={setTipo}
                estado={estado}
                setEstado={setEstado}
                startDate={startDate}
                endDate={endDate}
                setDateRange={setDateRange}
                onClear={handleClear}
                searching={loadingTabla}
            />

            {loadingTabla ? (
                <Loading height="300px" />
            ) : (
                <TablaHistorialMensajes rows={rows} onVerDetalle={handleVerDetalle} />
            )}

            <PaginationTable
                page={page}
                limit={limit}
                totalPages={totalPages}
                onChangePage={setPage}
                onChangeLimit={(val) => {
                    setLimit(val);
                    setPage(1);
                }}
            />

            <VerDetalleMensajeDialog
                open={openDetalle}
                onClose={() => setOpenDetalle(false)}
                mensaje={selectedMensaje}
                loading={loadingDetalle}
            />
        </Layout>
    );
}
