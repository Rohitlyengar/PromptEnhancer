import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  Box,
  Avatar,
  Container,
  useTheme,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ApiIcon from "@mui/icons-material/Api";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockIcon from "@mui/icons-material/Lock";

const Header = ({ apiKey, onApiKeyChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || "");
  const theme = useTheme();

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setTempApiKey(apiKey);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveApiKey = () => {
    onApiKeyChange(tempApiKey);
    setOpenDialog(false);
  };

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

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              onClick={handleOpenDialog}
              variant={apiKey ? "outlined" : "contained"}
              size="medium"
              startIcon={apiKey ? <LockIcon /> : <ApiIcon />}
              endIcon={<KeyboardArrowRightIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 600,
              }}
            >
              {apiKey ? "API Key Connected" : "Connect API Key"}
            </Button>
          </Box>
        </Toolbar>
      </Container>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '450px',
            maxWidth: '100%'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Box display="flex" alignItems="center">
            <ApiIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h5" component="div" fontWeight={700}>
              Connect OpenAI API Key
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your API key enables the app to enhance your prompts with OpenAI's powerful models.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Your API Key"
            type="password"
            fullWidth
            variant="outlined"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box 
            sx={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.05)', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid rgba(99, 102, 241, 0.1)',
              mt: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Your key is stored locally in your browser and is never sent
              to our servers. You can get your OpenAI API key from{" "}
              <Link
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener"
                sx={{ fontWeight: 600 }}
              >
                OpenAI's platform
              </Link>
              .
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveApiKey} 
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;
