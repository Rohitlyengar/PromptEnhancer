import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";

const FeedbackDialog = ({ open, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Feedback</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" gutterBottom>
            Please provide feedback on the quality and accuracy of the prompts generated, we will skew the results towards the best.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Your Feedback"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!feedback.trim()}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
