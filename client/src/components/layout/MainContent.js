import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Alert,
  Chip,
  useTheme,
  Stack,
  Zoom,
  Fade,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import TranslateIcon from "@mui/icons-material/Translate";
import SpeedIcon from "@mui/icons-material/Speed";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SettingsIcon from "@mui/icons-material/Settings";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

const MainContent = ({
  originalPrompt,
  setOriginalPrompt,
  enhancedPrompt,
  loading,
  error,
  models,
  selectedModel,
  selectedSkills,
  handleSkillToggle,
  toggleAllSkills,
  selectedPhrases,
  handlePhraseToggle,
  useEnglish,
  setUseEnglish,
  useSimplified,
  setUseSimplified,
  enhancePrompt,
  followUpQuestions,
  followUpAnswers,
  handleFollowUpAnswer,
  showFollowUps,
  generateFinalPrompt,
}) => {
  const theme = useTheme();
  const [styleTab, setStyleTab] = useState(0);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const handleStyleTabChange = (event, newValue) => {
    setStyleTab(newValue);
  };

  // Group phrases for tabs
  const toneStyles = ['be_professional', 'be_friendly', 'be_formal', 'be_casual'];
  const formatStyles = ['be_specific', 'be_concise', 'be_structured'];
  const contentStyles = ['be_creative', 'be_technical', 'be_simple'];

  // Count selected skills
  const skillCount = Object.values(selectedSkills).filter(Boolean).length;
  const phraseCount = Object.values(selectedPhrases).filter(Boolean).length;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              height: "100%",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ p: 3, pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TipsAndUpdatesIcon sx={{ mr: 1.5, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  Prompt Engineering
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  mb: 2 
                }}
              >
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${skillCount} skills selected`} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={Object.values(selectedSkills).every(
                        (value) => value
                      )}
                      onChange={(e) => toggleAllSkills(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Toggle All
                    </Typography>
                  }
                />
              </Box>
            </Box>

            <Divider />

            <Box sx={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
              <Accordion 
                defaultExpanded 
                elevation={0}
                disableGutters
                sx={{ 
                  '&:before': { display: 'none' },
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 3, py: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Basic Techniques
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pt: 0, pb: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.clarity ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.clarity ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.clarity}
                            onChange={() => handleSkillToggle("clarity")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Clarity Enhancement
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Make the prompt more specific and remove ambiguity.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.context ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.context ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.context}
                            onChange={() => handleSkillToggle("context")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Context Addition
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add relevant context to make the prompt more comprehensive.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.constraints ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.constraints ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.constraints}
                            onChange={() => handleSkillToggle("constraints")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Constraints
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add specific constraints and requirements.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.examples ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.examples ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.examples}
                            onChange={() => handleSkillToggle("examples")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Examples
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add relevant examples to illustrate expected output.
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion 
                elevation={0}
                disableGutters
                sx={{ 
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 3, py: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Advanced Techniques
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pt: 0, pb: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.chain_of_thought ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.chain_of_thought ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.chain_of_thought}
                            onChange={() => handleSkillToggle("chain_of_thought")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Chain of Thought
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Encourage step-by-step reasoning.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.few_shot ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.few_shot ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.few_shot}
                            onChange={() => handleSkillToggle("few_shot")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Few-Shot Learning
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add input-output examples to guide the response.
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: selectedSkills.role_play ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: '1px solid',
                      borderColor: selectedSkills.role_play ? 'primary.light' : 'divider',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedSkills.role_play}
                            onChange={() => handleSkillToggle("role_play")}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Role Play
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Frame as a conversation with a specific expert role.
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ModeEditOutlineIcon sx={{ mr: 1.5, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  Enhance Your Prompt
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Enter your prompt here to receive an enhanced version..."
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                    background: theme.palette.background.default,
                  }
                }}
              />

              <Box sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ px: 2 }}>
                  <Tabs 
                    value={styleTab} 
                    onChange={handleStyleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ 
                      minHeight: 'auto',
                      '& .MuiTab-root': {
                        minHeight: 48,
                        py: 1.5,
                        px: 2,
                      }
                    }}
                  >
                    <Tab 
                      icon={<FormatListBulletedIcon sx={{ fontSize: 18 }}/>} 
                      iconPosition="start" 
                      label="Format" 
                      sx={{ fontWeight: 600 }}
                    />
                    <Tab 
                      icon={<Brightness4Icon sx={{ fontSize: 18 }}/>} 
                      iconPosition="start" 
                      label="Tone" 
                      sx={{ fontWeight: 600 }}
                    />
                    <Tab 
                      icon={<LightbulbIcon sx={{ fontSize: 18 }}/>} 
                      iconPosition="start" 
                      label="Content" 
                      sx={{ fontWeight: 600 }}
                    />
                  </Tabs>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2 }}>
                  {styleTab === 0 && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="Be Specific"
                        clickable
                        color={selectedPhrases.be_specific ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_specific")}
                        variant={selectedPhrases.be_specific ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Be Concise"
                        clickable
                        color={selectedPhrases.be_concise ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_concise")}
                        variant={selectedPhrases.be_concise ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Be Structured"
                        clickable
                        color={selectedPhrases.be_structured ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_structured")}
                        variant={selectedPhrases.be_structured ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Stack>
                  )}
                  
                  {styleTab === 1 && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="Professional"
                        clickable
                        color={selectedPhrases.be_professional ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_professional")}
                        variant={selectedPhrases.be_professional ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Friendly"
                        clickable
                        color={selectedPhrases.be_friendly ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_friendly")}
                        variant={selectedPhrases.be_friendly ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Formal"
                        clickable
                        color={selectedPhrases.be_formal ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_formal")}
                        variant={selectedPhrases.be_formal ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Casual"
                        clickable
                        color={selectedPhrases.be_casual ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_casual")}
                        variant={selectedPhrases.be_casual ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Stack>
                  )}
                  
                  {styleTab === 2 && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="Creative"
                        clickable
                        color={selectedPhrases.be_creative ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_creative")}
                        variant={selectedPhrases.be_creative ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Technical"
                        clickable
                        color={selectedPhrases.be_technical ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_technical")}
                        variant={selectedPhrases.be_technical ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Simple"
                        clickable
                        color={selectedPhrases.be_simple ? "primary" : "default"}
                        onClick={() => handlePhraseToggle("be_simple")}
                        variant={selectedPhrases.be_simple ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Stack>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: "flex", 
                    gap: 1, 
                    height: '100%',
                    justifyContent: 'flex-start' 
                  }}>
                    <Chip
                      icon={<TranslateIcon />}
                      label="English"
                      variant={useEnglish ? "filled" : "outlined"}
                      color={useEnglish ? "primary" : "default"}
                      onClick={() => setUseEnglish(!useEnglish)}
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      icon={<SpeedIcon />}
                      label="Simplified"
                      variant={useSimplified ? "filled" : "outlined"}
                      color={useSimplified ? "primary" : "default"}
                      onClick={() => setUseSimplified(!useSimplified)}
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="primary"
                onClick={enhancePrompt}
                disabled={loading}
                fullWidth
                size="large"
                startIcon={loading ? null : <AutoFixHighIcon />}
                sx={{ 
                  mb: 0,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Enhance Prompt"}
              </Button>
            </Box>

            <Box sx={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
              {showFollowUps &&
                followUpQuestions &&
                followUpQuestions.length > 0 && (
                  <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Follow-up Questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Answer these questions to further refine your prompt.
                    </Typography>
                    
                    <Stack spacing={3}>
                      {followUpQuestions.map((question, index) => (
                        <Fade in={true} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            backgroundColor: theme.palette.background.default
                          }}>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom
                              fontWeight={600}
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <AddCircleOutlineIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                              {question}
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Enter your answer..."
                              value={followUpAnswers[question] || ""}
                              onChange={(e) =>
                                handleFollowUpAnswer(question, e.target.value)
                              }
                              variant="outlined"
                              sx={{ 
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          </Box>
                        </Fade>
                      ))}
                    </Stack>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={generateFinalPrompt}
                      disabled={loading}
                      fullWidth
                      size="large"
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Final Prompt"}
                    </Button>
                  </Box>
                )}

              {enhancedPrompt && (
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Enhanced Prompt
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton 
                        onClick={() => copyToClipboard(enhancedPrompt)}
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        borderColor: 'rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="body1"
                          style={{ 
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.7,
                          }}
                        >
                          {enhancedPrompt}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainContent;
