import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, Typography, Box, Chip, Paper, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import GroupsIcon from "@mui/icons-material/Groups";
import { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Papa from "papaparse";
import type { ContactoIn, AudienciaRow } from "../services/audienciasService";
import {
    listarCampanasTodas,
    type CampanaItem,
    obtenerAudiencia,
} from "../services/audienciasService";
import Loading from "../../../components/Loading";
import { useUser } from "../../../Context/UserContext";

type Mode = "create" | "edit";

interface Props {
    open: boolean;
    mode: Mode;
    initial?: Partial<AudienciaRow> & { idUsuario?: string; idAudiencia?: string };
    onClose: () => void;
    onSubmit: (payload: {
        nombre: string;
        idCampana: string;
        contactos: ContactoIn[];
    }) => void;
    onUpdate?: (payload: {
        nombre?: string;
        idCampana?: string;
        contactosAgregar?: ContactoIn[];
        contactosEliminar?: string[];
    }) => void;
}

export default function AudienciaDialog({
    open, mode, initial, onClose, onSubmit, onUpdate,
}: Props) {
    const [nombre, setNombre] = useState("");
    const [idCampana, setIdCampana] = useState("");
    const [campanas, setCampanas] = useState<CampanaItem[]>([]);
    const [nombreContacto, setNombreContacto] = useState("");
    const [numeroContacto, setNumeroContacto] = useState("+57");
    const [contactos, setContactos] = useState<ContactoIn[]>([]);
    const [originalContactos, setOriginalContactos] = useState<any[]>([]);
    const [loadingContactos, setLoadingContactos] = useState(false);

    const { uid, rol } = useUser();

    // 🔹 Cargar campañas y datos de la audiencia si estamos en edición
    // 🔹 Cargar campañas y datos de la audiencia si estamos en edición
    useEffect(() => {
        if (open) {
            if (mode === "edit" && initial?.idAudiencia) {
                setLoadingContactos(true); // 👈 inicia loader
                obtenerAudiencia(initial.idAudiencia)
                    .then((audiencia) => {
                        setNombre(audiencia.nombre_audiencia || "");
                        setIdCampana(audiencia.idCampana || "");

                        const contactosMapeados = audiencia.contactos.map((c: any) => ({
                            idContacto: c.idContacto,
                            nombre_contacto: c.nombre_contacto,
                            numero_contacto: c.numero_contacto.startsWith("+")
                                ? c.numero_contacto
                                : `+${c.numero_contacto}`,
                        }));

                        setContactos(contactosMapeados);
                        setOriginalContactos(contactosMapeados);
                    })
                    .catch(console.error)
                    .finally(() => setLoadingContactos(false)); // 👈 detiene loader
            } else {
                // Reset para crear
                setNombre(initial?.nombre_audiencia || "");
                setIdCampana(initial?.idCampana || "");
                setContactos([]);
                setOriginalContactos([]);
                setNombreContacto("");
                setNumeroContacto("+57");
            }

            listarCampanasTodas(
                rol === "admin" ? {} : { idUsuario: uid ?? undefined } // 👈 solo si no es admin
            )
                .then(setCampanas)
                .catch(console.error);
        }
    }, [open, initial, mode, uid, rol]);


    // ➕ Agregar contacto manual
    const addContacto = () => {
        if (!nombreContacto.trim() || !numeroContacto.trim()) return;

        const cleanNumber = numeroContacto.replace(/\s+/g, ""); // elimina espacios
        const finalNumber = cleanNumber.startsWith("+")
            ? cleanNumber.substring(1) // quitar el +
            : cleanNumber;

        setContactos((prev) => [
            ...prev,
            {
                nombre_contacto: nombreContacto.trim(),
                numero_contacto: finalNumber, // 👈 backend recibe 573145267829
            },
        ]);

        setNombreContacto("");
        setNumeroContacto("+57");
    };


    const rmContacto = (idx: number) => {
        setContactos((prev) => prev.filter((_, i) => i !== idx));
    };

    // 📥 Subir CSV y parsear
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
                            ? row.Numero
                            : `+${row.Numero}`;
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

    // 📤 Descargar plantilla CSV
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

    // 💾 Guardar
    const handleSubmit = () => {
        if (mode === "create") {
            onSubmit({ nombre, idCampana, contactos });
        } else {
            // ➕ Contactos nuevos
            const contactosAgregar = contactos.filter(
                (c) => !originalContactos.some((o) => o.numero_contacto === c.numero_contacto)
            ).map((c) => ({
                ...c,
                numero_contacto: c.numero_contacto.startsWith("+")
                    ? c.numero_contacto.substring(1)
                    : c.numero_contacto,
            }));

            // ❌ Contactos eliminados
            const contactosEliminar = originalContactos
                .filter((o) => !contactos.some((c) => c.numero_contacto === o.numero_contacto))
                .map((o: any) => o.idContacto);

            onUpdate?.({
                nombre,
                idCampana,
                contactosAgregar: contactosAgregar.length ? contactosAgregar : undefined,
                contactosEliminar: contactosEliminar.length ? contactosEliminar : undefined,
            });
        }
    };

    const disabled = !nombre.trim() || !idCampana.trim();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { minHeight: "600px" } }}
        >
            <DialogTitle>
                {mode === "create" ? "Crear audiencia" : "Editar audiencia"}
            </DialogTitle>
            <DialogContent dividers>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    {/* Columna izquierda */}
                    <Stack flex={1} spacing={3}>
                        <Box>
                            <Typography fontWeight={600} fontSize={16} mb={0.5}>
                                Campaña Asociada
                            </Typography>
                            <Autocomplete
                                options={campanas}
                                getOptionLabel={(c) => c.nombre}
                                value={campanas.find((c) => c.idCampana === idCampana) || null}
                                onChange={(_, val) => setIdCampana(val ? val.idCampana : "")}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecciona una campaña" />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography fontWeight={600} fontSize={16} mb={0.5}>
                                Nombre de la audiencia
                            </Typography>
                            <TextField
                                placeholder="Ej. Lanzamiento Linka"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                fullWidth
                            />
                        </Box>

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
                                    sx={{
                                        fontWeight: 700,
                                        textTransform: "none",
                                    }}
                                >
                                    Subir archivo CSV
                                    <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
                                </Button>

                                <Button
                                    variant="contained"
                                    color="neutral"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownloadTemplate}
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: "none",
                                    }}
                                >
                                    Descargar plantilla
                                </Button>
                            </Box>

                            <Typography fontSize={13} color="text.secondary" mt={1}>
                                La plantilla debe tener columnas: <b>Nombre</b> y <b>Número</b>.
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Columna derecha */}
                    <Stack flex={1} spacing={2}>
                        <Typography fontWeight={600} fontSize={16}>
                            Contactos
                        </Typography>

                        <TextField
                            placeholder="Nombre del contacto"
                            value={nombreContacto}
                            onChange={(e) => setNombreContacto(e.target.value)}
                            fullWidth
                            sx={{ marginTop: "1% !important" }}
                        />

                        <Stack direction="row" spacing={1} alignItems="center">
                            <PhoneInput
                                country={"co"}
                                value={numeroContacto}
                                onChange={(_, __, ___, formattedValue) => {
                                    setNumeroContacto(formattedValue);
                                }}
                                placeholder="Ingresar número de teléfono"   // 👈 aquí el placeholder
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

                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={addContacto}
                                sx={{
                                    height: "50px !important",
                                    "& .MuiButton-startIcon": {
                                        marginRight: "2px !important", // 👈 ajusta la separación (default es 8px)
                                    },
                                    width: "50% !important",
                                }}
                            >
                                Añadir
                            </Button>

                        </Stack>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                minHeight: 300,
                                border: "1px dashed",
                                borderColor: "grey.400",
                                backgroundColor: "grey.50",
                                overflowY: "auto",
                                ...(contactos.length === 0 && {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }),
                            }}
                        >
                            {loadingContactos ? (
                                <Loading height={200} />  // 👈 loader mientras carga
                            ) : contactos.length ? (
                                <Grid container spacing={1}>
                                    {contactos.map((c, idx) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                            <Chip
                                                label={`${c.nombre_contacto} — ${c.numero_contacto}`}
                                                onDelete={() => rmContacto(idx)}
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
                                    <Typography color="text.secondary" fontSize={14} align="center">
                                        No hay contactos agregados
                                    </Typography>
                                </Stack>
                            )}
                        </Paper>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="info" variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={disabled}
                    variant="contained"
                    color="secondary"
                >
                    {mode === "create" ? "Guardar Audiencia" : "Guardar cambios"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
