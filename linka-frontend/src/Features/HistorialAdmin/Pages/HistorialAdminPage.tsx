import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import FiltrosHistorial from "../components/FiltrosHistorial";
import TablaHistorial from "../components/TablaHistorial";
import Loading from "../../../components/Loading";
import { listarHistorial, type HistorialItem, type HistorialTipo } from "../services/historialService";
import PaginationTable from "../../../components/PaginationTable";

function toIsoStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}
function toIsoEnd(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

export default function HistorialAdminPage() {
  const [usuario, setUsuario] = useState<string>("");
  const [debouncedUsuario, setDebouncedUsuario] = useState<string>(""); // 👈 debounce
  const [tipo, setTipo] = useState<HistorialTipo | "">("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [rows, setRows] = useState<HistorialItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // ⏳ Debounce de 300ms para el texto
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsuario(usuario), 300);
    return () => clearTimeout(t);
  }, [usuario]);

  const queryParams = useMemo(() => ({
    usuario: debouncedUsuario || undefined,               // 👈 usa el debounced
    tipo: (tipo || undefined) as HistorialTipo | undefined,
    fechaInicio: startDate ? toIsoStart(startDate) : undefined,
    fechaFin: endDate ? toIsoEnd(endDate) : undefined,
    limit,
    page,
  }), [debouncedUsuario, tipo, startDate, endDate, limit, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listarHistorial(queryParams);
      setRows(res.data || []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (e) {
      console.error("Error listando historial:", e);
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Ahora el fetch reacciona a los filtros/pg/limit ya ACTUALIZADOS
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]); // o lista explícita: [debouncedUsuario, tipo, startDate, endDate, page, limit]

  // Ya no dispara fetch directo; solo resetea página
  const handleSearch = () => {
    setPage(1);
  };

  const handleClear = () => {
    setUsuario("");
    setTipo("");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
    // El efecto hará el fetch automáticamente
  };

  return (
    <Layout>
      <Box>
        <Stack direction="column" alignItems="left" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>Historial de Usuarios</Typography>
          <Typography fontSize={16} color="text.secondary">Registro de las actividades importantes de los usuarios en la plataforma.</Typography>
        </Stack>

        <FiltrosHistorial
          usuario={usuario}
          setUsuario={setUsuario}
          tipo={tipo}
          setTipo={setTipo}
          startDate={startDate}
          endDate={endDate}
          setDateRange={([fi, ff]) => { setStartDate(fi); setEndDate(ff); }}
          onSearch={handleSearch}     // 🔁 ahora solo setPage(1)
          onClear={handleClear}
          searching={loading}
        />

        {loading ? (
          <Loading height={240} />
        ) : (
          <>
            <TablaHistorial rows={rows} />
            <PaginationTable
              page={page}
              limit={limit}
              totalPages={totalPages}
              onChangePage={(p: any) => { setPage(p); }}                   // 👈 sin fetch manual
              onChangeLimit={(l: any) => { setLimit(l); setPage(1); }}     // 👈 sin fetch manual
            />
          </>
        )}
      </Box>
    </Layout>
  );
}
