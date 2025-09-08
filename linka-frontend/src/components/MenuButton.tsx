// src/components/MenuButton.tsx
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

interface MenuButtonProps {
  text: string;
  active?: boolean;
}

export default function MenuButton({ text, active = false }: MenuButtonProps) {
  return (
    <Button
      fullWidth
      startIcon={<Add />}
      disableRipple
      sx={{
        justifyContent: "flex-start",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 600,
        fontSize: "14px",
        color: active ? "#F38933" : "#000000",
        backgroundColor: active ? "rgba(243,137,51,0.1)" : "transparent",
        padding: "10px 16px",
        borderRadius: 0,
        "&:hover": {
          backgroundColor: "#F99F56", // Hover naranja
          color: "#FFFFFF",
        },
        "&:active": {
          borderBottom: "2px solid #F38933", // Pressed
          backgroundColor: "transparent",
          color: "#F38933",
        },
      }}
    >
      {text}
    </Button>
  );
}
