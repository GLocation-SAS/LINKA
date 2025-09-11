// src/Features/Mensajes/components/StepDestinatarios.tsx
import {
    Box,
    Typography,
    Stack,
    TextField,
    Autocomplete,
    Button,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useEffect, useState, useMemo } from "react";

import {
    listarAudiencias,
    listarCampanasTodas,
    obtenerAudiencia,
    type AudienciaRow,
    type CampanaItem,
    type ContactoIn,
} from "../../Audiencia/services/audienciasService";
import Loading from "../../../components/Loading";
import EditarContactosDialog from "./EditarContactosDialog";
import { useUser } from "../../../Context/UserContext";

type Props = {
    campana: string;
    setCampana: (v: string) => void;
    audiencia: string;
    setAudiencia: (v: string) => void;
    total: number;
    setTotal: (v: number) => void;
    contactos: ContactoIn[]; // 👈 ahora ContactoIn
    setContactos: React.Dispatch<React.SetStateAction<ContactoIn[]>>;
};

export default function StepDestinatarios({
    campana,
    setCampana,
    audiencia,
    setAudiencia,
    total,
    setTotal,
    contactos,
    setContactos,
}: Props) {
    const [campanas, setCampanas] = useState<CampanaItem[]>([]);
    const [audiencias, setAudiencias] = useState<AudienciaRow[]>([]);
    const [loading, setLoading] = useState(false);
    const { uid, rol } = useUser();

    // Modal
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dataCampanas = await listarCampanasTodas(
                    rol === "admin" ? {} : { idUsuario: uid ?? undefined } // 👈 solo si no es admin
                );
                setCampanas(dataCampanas);

                const dataAudiencias = await listarAudiencias({ page: 1, limit: 100 });
                setAudiencias(dataAudiencias.data);
            } catch (error) {
                console.error("❌ Error cargando destinatarios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [uid, rol]); // 👈 agregamos rol a dependencias


    // 🔹 Audiencias filtradas por campaña
    const audienciasFiltradas = useMemo(() => {
        if (!campana) return [];
        return audiencias.filter((a) => a.idCampana === campana);
    }, [audiencias, campana]);

    // 🔹 Cuando cambia audiencia → cargar contactos y calcular total
    useEffect(() => {
        const fetchContactos = async () => {
            if (!audiencia) {
                setContactos([]);
                setTotal(0);
                return;
            }

            if (audiencia === "all") {
                let totalAll = 0;
                let contactosAll: ContactoIn[] = [];

                for (const a of audienciasFiltradas) {
                    try {
                        const data = await obtenerAudiencia(a.idAudiencia);
                        totalAll += data.contactos.length;

                        // 👇 Mapear ContactoOut → ContactoIn
                        contactosAll = [
                            ...contactosAll,
                            ...data.contactos.map((c) => ({
                                nombre_contacto: c.nombre_contacto,
                                numero_contacto: c.numero_contacto,
                            })),
                        ];
                    } catch (err) {
                        console.error("❌ Error obteniendo audiencia:", err);
                    }
                }

                setTotal(totalAll);
                setContactos(contactosAll);
            } else {
                try {
                    const data = await obtenerAudiencia(audiencia);
                    setTotal(data.contactos.length);

                    setContactos(
                        data.contactos.map((c) => ({
                            nombre_contacto: c.nombre_contacto,
                            numero_contacto: c.numero_contacto,
                        }))
                    );
                } catch (err) {
                    console.error("❌ Error obteniendo audiencia:", err);
                    setContactos([]);
                    setTotal(0);
                }
            }
        };

        fetchContactos();
    }, [audiencia, audienciasFiltradas, setContactos, setTotal]);

    return (
        <Box p={3} bgcolor="white" borderRadius={2}>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                    1. Destinatarios
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                    Total <br /> {total}
                </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" mb={2}>
                Elige la campaña y la audiencia para este envío.
            </Typography>

            {loading ? (
                <Loading height="150px" />
            ) : (
                <>
                    <Stack direction="row" spacing={2} mb={2}>
                        {/* Campañas */}
                        <Box flex={1}>
                            <Typography variant="subtitle1" mb={1}>
                                Campaña
                            </Typography>
                            <Autocomplete
                                options={campanas}
                                getOptionLabel={(c) => c.nombre}
                                value={campanas.find((c) => c.idCampana === campana) || null}
                                onChange={(_, val) => {
                                    setCampana(val ? val.idCampana : "");
                                    setAudiencia("");
                                    setContactos([]);
                                    setTotal(0);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecciona una campaña" />
                                )}
                            />
                        </Box>

                        {/* Audiencias */}
                        <Box flex={1}>
                            <Typography variant="subtitle1" mb={1}>
                                Audiencia
                            </Typography>
                            <Autocomplete
                                options={[
                                    { idAudiencia: "all", nombre_audiencia: "Todas" },
                                    ...audienciasFiltradas,
                                ]}
                                getOptionLabel={(a) => a.nombre_audiencia}
                                value={
                                    audiencia
                                        ? [
                                            { idAudiencia: "all", nombre_audiencia: "Todas" },
                                            ...audienciasFiltradas,
                                        ].find((a) => a.idAudiencia === audiencia) || null
                                        : null
                                }
                                onChange={(_, val) => setAudiencia(val ? val.idAudiencia : "")}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Selecciona una audiencia" />
                                )}
                                disabled={!campana}
                            />
                        </Box>
                    </Stack>

                    {/* Botón abrir modal */}
                    {/* Botón abrir modal */}
                    <Box width="100%">
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => setOpenModal(true)}
                            disabled={!audiencia} // 👈 solo habilitado si hay audiencia seleccionada
                        >
                            Ver o Editar Contactos
                        </Button>
                    </Box>



                    {/* Modal */}
                    <EditarContactosDialog
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        audiencia={audiencia}
                        audienciasCampana={audienciasFiltradas}   // 👈 aquí
                        contactos={contactos}
                        setContactos={setContactos}
                    />

                </>
            )}
        </Box>
    );
}
