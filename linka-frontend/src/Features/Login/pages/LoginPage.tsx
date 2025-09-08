// src/Features/Login/LoginPage.tsx
import { Box } from "@mui/material";
import InfoPanel from "../components/InfoPanel";
import LoginForm from "../components/LoginForm";
import backgroundImage from "../../../assets/images/ImagenLogin.png";


export default function LoginPage() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        px: 6,
        gap: 6,
      }}
    >
      <InfoPanel />
      <LoginForm />
    </Box>
  );
}