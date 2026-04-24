import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Container,
  useTheme,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const Header = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      elevation={0}
      color="default" 
      sx={{ 
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(20px)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 42, 
                height: 42,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                mr: 2 
              }}
            >
              <AutoFixHighIcon />
            </Avatar>
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Prompt Enhancer
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
