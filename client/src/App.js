import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import MainContent from "./components/layout/MainContent";
import axios from "axios";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#ff9800",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models] = useState([
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Flash" }
  ]);

  const [selectedModel] = useState("gpt-4.1-mini");
  const [conversationId, setConversationId] = useState(null);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [lockedQuestions, setLockedQuestions] = useState(false); // Add this state to track if questions should be locked
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [showFollowUps, setShowFollowUps] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState({
    clarity: false,
    context: false,
    constraints: false,
    examples: false,
    chain_of_thought: false,
    few_shot: false,
    role_play: false,
  });

  const [selectedPhrases, setSelectedPhrases] = useState({
    be_specific: false,
    be_concise: false,
    be_creative: false,
    be_technical: false,
    be_simple: false,
    be_professional: false,
    be_friendly: false,
    be_formal: false,
    be_casual: false,
    be_structured: false,
  });

  const [useEnglish, setUseEnglish] = useState(false);
  const [useSimplified, setUseSimplified] = useState(true);

  // Handle skill toggle
  const handleSkillToggle = (skill) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  // Toggle all skills
  const toggleAllSkills = (checked) => {
    const updatedSkills = {};
    Object.keys(selectedSkills).forEach((skill) => {
      updatedSkills[skill] = checked;
    });
    setSelectedSkills(updatedSkills);
  };

  // Handle phrase toggle
  const handlePhraseToggle = (phrase) => {
    setSelectedPhrases((prev) => ({
      ...prev,
      [phrase]: !prev[phrase],
    }));
  };

  // Handle follow-up answer
  const handleFollowUpAnswer = (question, answer) => {
    // Simply store the answer without making an API request
    setFollowUpAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  // Generate final prompt with follow-up answers
  const generateFinalPrompt = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/final-prompt", {
        conversationId,
        answers: followUpAnswers,
        model: "gpt-4.1-mini",
      });
      
      setEnhancedPrompt(response.data.finalPrompt);
    } catch (error) {
      console.error("Error generating final prompt:", error);
      setError(error.response?.data?.error || error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  
  // Enhance the prompt
  const enhancePrompt = async () => {
    if (!originalPrompt) {
      setError("Please enter a prompt to enhance");
      return;
    }

    // Check if any skill is selected
    if (!Object.values(selectedSkills).some((value) => value)) {
      setError("Please select at least one prompt engineering skill");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Sending enhance request with prompt:", originalPrompt);
      const response = await axios.post("/api/enhance", {
        prompt: originalPrompt,
        skills: selectedSkills,
        model: "gpt-4.1-mini",
        insertPhrases: selectedPhrases,
        useEnglish,
        useSimplified,
        conversationId,
      });

      console.log("Received response:", response.data);
      setEnhancedPrompt(response.data.enhancedPrompt);
      setConversationId(response.data.conversationId);
      setFollowUpQuestions(response.data.followUpQuestions || []);
      setShowFollowUps(true);
      
      // Reset follow-up answers when starting a new enhancement
      setFollowUpAnswers({});
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      setError(error.response?.data?.error || error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
          <MainContent
            originalPrompt={originalPrompt}
            setOriginalPrompt={setOriginalPrompt}
            enhancedPrompt={enhancedPrompt}
            loading={loading}
            error={error}
            models={models}
            selectedModel={selectedModel}
            selectedSkills={selectedSkills}
            handleSkillToggle={handleSkillToggle}
            toggleAllSkills={toggleAllSkills}
            selectedPhrases={selectedPhrases}
            handlePhraseToggle={handlePhraseToggle}
            useEnglish={useEnglish}
            setUseEnglish={setUseEnglish}
            useSimplified={useSimplified}
            setUseSimplified={setUseSimplified}
            enhancePrompt={enhancePrompt}
            followUpQuestions={followUpQuestions}
            followUpAnswers={followUpAnswers}
            handleFollowUpAnswer={handleFollowUpAnswer}
            showFollowUps={showFollowUps}
            generateFinalPrompt={generateFinalPrompt}
          />
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
