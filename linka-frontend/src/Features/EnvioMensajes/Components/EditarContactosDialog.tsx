// src/Features/Mensajes/components/EditarContactosDialog.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Stack,
    Box,
    Grid,
    Paper,
    Chip,
    InputAdornment,
    Autocomplete
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import Papa from "papaparse";
import SearchIcon from "@mui/icons-material/Search"

import {
    actualizarAudiencia,
    obtenerAudiencia,
    type ContactoIn,
    type AudienciaRow,
} from "../../Audiencia/services/audienciasService";
import Loading from "../../../components/Loading";
import FeedbackModal from "../../../components/FeedbackModal"; // 👈 importar modal

type Props = {
    open: boolean;
    onClose: () => void;
    audiencia: string; // puede ser "all" o un idAudiencia
    audienciasCampana: AudienciaRow[];
    contactos: ContactoIn[];
    setContactos: React.Dispatch<React.SetStateAction<ContactoIn[]>>;
};

export default function EditarContactosDialog({
    open,
    onClose,
    audiencia,
    audienciasCampana,
    contactos,
    setContactos,
}: Props) {
    const [audienciaSeleccionada, setAudienciaSeleccionada] = useState<string>("");
    const [nombreContacto, setNombreContacto] = useState("");
    const [numeroContacto, setNumeroContacto] = useState("");
    const [search, setSearch] = useState("");
    const [loadingContactos, setLoadingContactos] = useState(false);

    // 🔹 Guardamos contactos originales para comparar
    const [originalContactos, setOriginalContactos] = useState<ContactoIn[]>([]);

    // 🔹 Estados del modal de feedback
    const [modal, setModal] = useState<{
        open: boolean;
        type: "success" | "error" | "info" | "confirm";
        title?: string;
        description?: string;
        loadingConfirm?: boolean;
    }>({ open: false, type: "info" });

    useEffect(() => {
        if (audiencia !== "all") {
            setAudienciaSeleccionada(audiencia);
        } else {
            setAudienciaSeleccionada("");
        }
    }, [audiencia]);

    const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

    // 🔹 Cargar contactos al abrir modal
    useEffect(() => {
        const fetchContactos = async () => {
            if (!audienciaSeleccionada) return;
            setLoadingContactos(true);
            try {
                const data = await obtenerAudiencia(audienciaSeleccionada);
                setContactos(data.contactos);
                setOriginalContactos(data.contactos); // ✅ guardamos copia para comparación
            } catch (err) {
                console.error("❌ Error cargando contactos:", err);
            } finally {
                setLoadingContactos(false);
            }
        };
        if (open) fetchContactos();
    }, [open, audienciaSeleccionada, setContactos]);

    // ➕ Añadir contacto manual
    const handleAddContacto = () => {
        if (!numeroContacto || !audienciaSeleccionada) return;
        setContactos((prev) => [
            ...prev,
            {
                nombre_contacto: nombreContacto || "Sin nombre",
                numero_contacto: normalizePhone(numeroContacto),
            },
        ]);
        setNombreContacto("");
        setNumeroContacto("");
    };

    // ❌ Eliminar contacto
    const handleDeleteContacto = (numero: string) => {
        setContactos((prev) =>
            prev.filter((c) => c.numero_contacto !== numero)
        );
    };

    // 💾 Guardar cambios con confirmación
    const handleGuardar = async () => {
        setModal({
            open: true,
            type: "confirm",
            title: "¿Actualizar audiencia?",
            description:
                "¿Seguro que deseas actualizar los contactos de esta audiencia? Los cambios son permanentes.",
        });
    };

    const confirmGuardar = async () => {
        if (!audienciaSeleccionada) return;
        setModal({
            open: true,
            type: "info",
            loadingConfirm: true,
            title: "Actualizando audiencia...",
            description: "Estamos guardando los cambios en los contactos.",
        });

        try {
            // ✅ Detectar añadidos
            const contactosAgregar = contactos.filter(
                (c) =>
                    !originalContactos.some(
                        (o) => normalizePhone(o.numero_contacto) === normalizePhone(c.numero_contacto)
                    )
            );

            // ✅ Detectar eliminados
            const contactosEliminar = originalContactos
                .filter(
                    (o) =>
                        !contactos.some(
                            (c) => normalizePhone(c.numero_contacto) === normalizePhone(o.numero_contacto)
                        )
                )
                .map((o: any) => o.idContacto); // el backend necesita el idContacto

            const payload: {
                contactosAgregar?: ContactoIn[];
                contactosEliminar?: string[];
            } = {};

            if (contactosAgregar.length) payload.contactosAgregar = contactosAgregar;
            if (contactosEliminar.length) payload.contactosEliminar = contactosEliminar;

            if (payload.contactosAgregar || payload.contactosEliminar) {
                await actualizarAudiencia(audienciaSeleccionada, payload);
            }

            const data = await obtenerAudiencia(audienciaSeleccionada);
            setContactos(data.contactos);
            setOriginalContactos(data.contactos);

            setModal({
                open: true,
                type: "success",
                title: "¡Audiencia actualizada!",
                description: "Los contactos fueron actualizados correctamente.",
            });

            setTimeout(() => {
                setModal((prev) => ({ ...prev, open: false }));
                onClose();
            }, 2000);
        } catch (err) {
            console.error("❌ Error guardando contactos:", err);
            setModal({
                open: true,
                type: "error",
                title: "Error al actualizar",
                description: "No se pudieron guardar los cambios. Intenta nuevamente.",
            });
        }
    };

    // 🔍 Filtrado en vivo
    const contactosFiltrados = contactos.filter(
        (c) =>
            c.nombre_contacto.toLowerCase().includes(search.toLowerCase()) ||
            c.numero_contacto.includes(search)
    );

    // 📥 Subir CSV
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const nuevosContactos: ContactoIn[] = [];
                (results.data as any[]).forEach((row) => {
                    if (row.Nombre && row.Numero) {
                        const numero = row.Numero.startsWith("+")
                            ? row.Numero.substring(1)
                            : row.Numero;
                        nuevosContactos.push({
                            nombre_contacto: row.Nombre.trim(),
                            numero_contacto: numero.trim(),
                        });
                    }
                });
                setContactos((prev) => [...prev, ...nuevosContactos]);
            },
        });
    };

    // 📤 Descargar plantilla
    const handleDownloadTemplate = () => {
        const header = "Nombre,Numero\n";
        const blob = new Blob([header], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "plantilla_audiencia.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700} sx={{ pb: 0.5 }}>
                    Editar destinatarios
                </DialogTitle>
                <Typography color="text.secondary" px={3} pb={1} variant="body2">
                    Puedes buscar, añadir o eliminar contactos para este envío.
                    Los cambios son permanentes.
                </Typography>
                <DialogContent dividers>
                    {/* Seleccionar audiencia */}
                    <Box mb={2}>
                        <Typography variant="subtitle1" mb={1}>
                            Selecciona una audiencia
                        </Typography>
                        <Autocomplete
                            fullWidth
                            options={audienciasCampana}
                            getOptionLabel={(a) => a.nombre_audiencia}
                            value={
                                audienciasCampana.find((a) => a.idAudiencia === audienciaSeleccionada) ||
                                null
                            }
                            onChange={(_, val) => setAudienciaSeleccionada(val ? val.idAudiencia : "")}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Selecciona una audiencia"
                                    size="medium"
                                />
                            )}
                        />
                    </Box>

                    <Typography variant="subtitle1">Contactos</Typography>
                    <TextField
                        fullWidth
                        placeholder="Nombre del contacto"
                        value={nombreContacto}
                        onChange={(e) => setNombreContacto(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {/* Teléfono + Añadir */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Box flex={1}>
                            <PhoneInput
                                country={"co"}
                                value={numeroContacto}
                                onChange={(_, __, ___, formattedValue) =>
                                    setNumeroContacto(formattedValue)
                                }
                                placeholder="Ingresar número de teléfono"
                                inputStyle={{
                                    width: "100%",
                                    height: "50px",
                                    borderRadius: "8px",
                                    backgroundColor: "#F5F5F5",
                                    border: "1px solid #D0D0D0",
                                    fontSize: "14px",
                                    fontFamily: "Nunito, Arial, sans-serif",
                                    paddingLeft: "48px",
                                }}
                                buttonStyle={{
                                    border: "none",
                                    background: "transparent",
                                    borderRadius: "8px 0 0 8px",
                                }}
                                dropdownStyle={{
                                    borderRadius: "8px",
                                    fontFamily: "Nunito, Arial, sans-serif",
                                }}
                                containerStyle={{ width: "100%" }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleAddContacto}
                            sx={{ height: "50px", whiteSpace: "nowrap" }}
                            disabled={!audienciaSeleccionada}
                        >
                            + Añadir
                        </Button>
                    </Stack>

                    {/* Buscar */}
                    <TextField
                        fullWidth
                        placeholder="Buscar contactos por nombre o número"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ mb: 3 }}
                        disabled={!audienciaSeleccionada}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Lista contactos */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            minHeight: 200,
                            border: "1px dashed",
                            borderColor: "grey.400",
                            backgroundColor: "grey.50",
                            overflowY: "auto",
                            mb: 3,
                            ...(contactosFiltrados.length === 0 && {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }),
                        }}
                    >
                        {loadingContactos ? (
                            <Loading height={200} />
                        ) : contactosFiltrados.length ? (
                            <Grid container spacing={1}>
                                {contactosFiltrados.map((c, idx) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                        <Chip
                                            label={`${c.nombre_contacto} — ${normalizePhone(
                                                c.numero_contacto
                                            )}`}
                                            onDelete={() =>
                                                handleDeleteContacto(c.numero_contacto)
                                            }
                                            color="secondary"
                                            sx={{
                                                fontSize: "12px",
                                                height: "28px",
                                                width: "100%",
                                                justifyContent: "space-between",
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Stack alignItems="center" spacing={1}>
                                <GroupsIcon sx={{ fontSize: 40, color: "grey.500" }} />
                                <Typography
                                    color="text.secondary"
                                    fontSize={14}
                                    align="center"
                                >
                                    No hay contactos agregados
                                </Typography>
                            </Stack>
                        )}
                    </Paper>

                    {/* CSV */}
                    <Box>
                        <Typography fontWeight={600} fontSize={16} mb={0.5}>
                            Subir archivo CSV
                        </Typography>
                        <Typography fontSize={13} color="text.secondary" mb={1}>
                            ¿Muchos contactos? Ahorra tiempo subiendo un archivo CSV.
                        </Typography>
                        <Box
                            sx={{
                                border: "1px dashed",
                                borderColor: "secondary.main",
                                borderRadius: 2,
                                p: 2,
                                bgcolor: "rgba(243,137,51,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Button
                                component="label"
                                variant="contained"
                                color="secondary"
                                startIcon={<UploadFileIcon />}
                                sx={{ fontWeight: 700, textTransform: "none" }}
                                disabled={!audienciaSeleccionada}
                            >
                                Subir archivo CSV
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <Button
                                variant="contained"
                                color="neutral"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadTemplate}
                                sx={{ fontWeight: 600, textTransform: "none" }}
                            >
                                Descargar plantilla
                            </Button>
                        </Box>
                        <Typography fontSize={13} color="text.secondary" mt={1}>
                            La plantilla debe tener columnas: <b>Nombre</b> y <b>Numero</b>.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} variant="outlined" color="info">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGuardar}
                        color="secondary"
                        variant="contained"
                        disabled={!audienciaSeleccionada}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Modal */}
            <FeedbackModal
                open={modal.open}
                type={modal.type}
                title={modal.title}
                description={modal.description}
                loadingConfirm={modal.loadingConfirm}
                onConfirm={confirmGuardar}
                onClose={() => setModal((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
}
