require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
    credentials: true,
  })
);

// Import routes
let promptsData;
try {
  promptsData = require("./routes/api/promptsData");
} catch (error) {
  console.error("Error loading promptsData route:", error);
  promptsData = express.Router();
}

// API Routes
app.use("/api/prompts", promptsData);

// Store conversation state (in a real app, use a proper database)
const conversations = new Map();

// OpenAI API route
app.post("/api/enhance", async (req, res) => {
  try {
    const {
      prompt,
      skills,
      model,
      insertPhrases,
      useEnglish,
      useSimplified,
      conversationId,
    } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key is not configured on the server" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Create OpenAI instance with the user's API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log("Generating follow-up questions for prompt:", prompt);
    // Generate follow-up questions
    const followUpQuestions = await generateFollowUpQuestions(
      openai,
      prompt,
      model,
      useEnglish
    );
    console.log("Generated follow-up questions:", followUpQuestions);

    // Store conversation state
    const newConversationId = conversationId || Date.now().toString();
    conversations.set(newConversationId, {
      originalPrompt: prompt,
      followUpQuestions,
      timestamp: Date.now(),
      skills: skills,
      insertPhrases: insertPhrases,
      useEnglish: useEnglish,
    });

    let enhancedPrompt = prompt;

    // Process the prompt based on the selected skills and options
    if (useSimplified) {
      // Apply all skills at once for simplified mode
      enhancedPrompt = await applySkills(
        openai,
        skills,
        prompt,
        useEnglish,
        model
      );

      // Add insert phrases if selected
      if (insertPhrases && Object.keys(insertPhrases).length > 0) {
        const phrases = require("./data/inserts");
        let phraseText = "";
        
        Object.keys(insertPhrases).forEach((phrase) => {
          if (insertPhrases[phrase] && phrases[phrase]) {
            phraseText += phrases[phrase] + " ";
          }
        });
        
        // Only add the phrase text if it's not empty
        if (phraseText.trim()) {
          enhancedPrompt = phraseText + "\n\n" + enhancedPrompt;
        }
      }

      console.log(
        "Sending response with follow-up questions:",
        followUpQuestions
      );
      return res.json({
        enhancedPrompt,
        conversationId: newConversationId,
        followUpQuestions,
      });
    } else {
      // Apply skills one by one
      const results = [];
      let orderNum = 1;

      for (const skill in skills) {
        if (skills[skill]) {
          enhancedPrompt = await applySkill(
            openai,
            skill,
            enhancedPrompt,
            orderNum,
            useEnglish,
            model
          );
          results.push({
            step: orderNum,
            skill,
            prompt: enhancedPrompt,
          });
          orderNum++;
        }
      }

      // Add insert phrases if selected
      if (insertPhrases && Object.keys(insertPhrases).length > 0) {
        const phrases = require("./data/inserts");
        let phraseText = "";
        let addedPhrases = [];
        
        Object.keys(insertPhrases).forEach((phrase) => {
          if (insertPhrases[phrase] && phrases[phrase]) {
            phraseText += phrases[phrase] + " ";
            addedPhrases.push(phrase);
          }
        });
        
        // Only add the phrase text if it's not empty
        if (phraseText.trim()) {
          enhancedPrompt = phraseText + "\n\n" + enhancedPrompt;
          results.push({
            step: orderNum,
            skill: "Style: " + addedPhrases.join(", "),
            prompt: enhancedPrompt,
          });
          orderNum++;
        }
      }

      console.log(
        "Sending response with follow-up questions:",
        followUpQuestions
      );
      return res.json({
        enhancedPrompt,
        steps: results,
        conversationId: newConversationId,
        followUpQuestions,
      });
    }
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// New endpoint for follow-up questions
app.post("/api/follow-up", async (req, res) => {
  try {
    const { conversationId, answer, model } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key is not configured on the server" });
    }

    if (!conversationId || !conversations.has(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    if (!answer) {
      return res.status(400).json({ error: "Answer is required" });
    }

    const conversation = conversations.get(conversationId);
    const openai = new OpenAI({ apiKey });

    // Update the original prompt with the answer
    const updatedPrompt = `${conversation.originalPrompt}\nAdditional context: ${answer}`;

    // Get the useEnglish preference from the conversation
    const useEnglish = conversation.useEnglish || false;
    
    // Generate new follow-up questions based on the updated context
    const followUpQuestions = await generateFollowUpQuestions(
      openai,
      updatedPrompt,
      model,
      useEnglish
    );

    // Update conversation state
    conversation.originalPrompt = updatedPrompt;
    conversation.followUpQuestions = followUpQuestions;
    conversation.timestamp = Date.now();

    res.json({
      followUpQuestions,
      conversationId,
    });
  } catch (error) {
    console.error("Error processing follow-up:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Helper function to generate follow-up questions
async function generateFollowUpQuestions(openai, prompt, model, useEnglish = false) {
  const templates = require("./data/templates");
  const formattedInput = templates.follow_up.replace("{prompt}", prompt);
  console.log("Sending follow-up request to OpenAI:", formattedInput);

  let systemContent = "You are a helpful assistant that generates relevant follow-up questions to help clarify and enhance user requests. Your questions should be specific, relevant, and help gather important details that would improve the quality of the response. Return ONLY a JSON array of questions, with no additional text or explanation.";
  
  // Add language instruction based on useEnglish setting
  if (useEnglish) {
    systemContent += " " + templates.lang_eng;
  } else {
    systemContent += " " + templates.lang_default;
  }

  const response = await openai.chat.completions.create({
    model: model || "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: systemContent
      },
      { role: "user", content: formattedInput },
    ],
  });

  console.log("OpenAI response:", response.choices[0].message.content);

  try {
    const questions = JSON.parse(response.choices[0].message.content);
    console.log("Parsed questions:", questions);
    // Ensure we have at least 3 questions
    if (!Array.isArray(questions) || questions.length < 3) {
      console.log("Using fallback questions due to invalid response");
      return useEnglish ? [
        "What specific details would you like to know about this topic?",
        "Are there any particular constraints or requirements to consider?",
        "What is your level of expertise in this area?",
      ] : [
        "What specific details would you like to know about this topic?",
        "Are there any particular constraints or requirements to consider?",
        "What is your level of expertise in this area?",
      ];
    }
    return questions;
  } catch (error) {
    console.error("Error parsing follow-up questions:", error);
    return useEnglish ? [
      "What specific details would you like to know about this topic?",
      "Are there any particular constraints or requirements to consider?",
      "What is your level of expertise in this area?",
    ] : [
      "What specific details would you like to know about this topic?",
      "Are there any particular constraints or requirements to consider?",
      "What is your level of expertise in this area?",
    ];
  }
}

// Helper function to apply a single skill
async function applySkill(openai, skill, prompt, orderNum, langEng, model) {
  let templates;
  try {
    templates = require("./data/templates");
  } catch (error) {
    console.error("Error loading templates:", error);
    throw new Error("Failed to load prompt templates");
  }

  let systemMessage = templates.system;
  if (langEng && orderNum === 1) {
    systemMessage += "\n" + templates.lang_eng;
  } else if (!langEng) {
    systemMessage += "\n" + templates.lang_default;
  }

  // Add extra instruction to ensure no explanatory text
  systemMessage += "\nIMPORTANT: Return ONLY the enhanced prompt with no explanations, no headers, no labels, and no quotation marks around it.";

  const template = templates[skill];
  if (!template) {
    throw new Error(`Template not found for skill: ${skill}`);
  }

  const formattedInput = template.replace("{prompt}", prompt);

  const response = await openai.chat.completions.create({
    model: model || "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: formattedInput },
    ],
  });

  let enhancedContent = response.choices[0].message.content;
  
  // Clean up the response to remove any explanatory text
  // Looking for patterns like "[Enhanced Prompt]", "Enhanced prompt:", etc.
  const patterns = [
    /\[Enhanced Prompt\](.*)/is,
    /Enhanced prompt:(.*)/is,
    /Utilizing .* technique to enhance .* prompt:(.*)/is,
    /.*\[(.*)\].*/is,
    /"(.*)"/s  // Text in quotes
  ];
  
  for (const pattern of patterns) {
    const match = enhancedContent.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > prompt.length / 2) { // Ensure we're not extracting something too short
        enhancedContent = extracted;
        break;
      }
    }
  }
  
  return enhancedContent;
}

// Helper function to apply multiple skills at once
async function applySkills(openai, skills, prompt, langEng, model) {
  let templates;
  try {
    templates = require("./data/templates");
  } catch (error) {
    console.error("Error loading templates:", error);
    throw new Error("Failed to load prompt templates");
  }

  let systemMessage = templates.system_multiple;
  if (langEng) {
    systemMessage += "\n" + templates.lang_eng;
  } else {
    systemMessage += "\n" + templates.lang_default;
  }

  // Add extra instruction to ensure no explanatory text
  systemMessage += "\nIMPORTANT: Return ONLY the enhanced prompt with no explanations, no headers, no labels, and no quotation marks around it.";

  const selectedSkills = Object.keys(skills).filter((skill) => skills[skill]);
  let integratedTemplates = "[Prompt Engineering Techniques to Apply]\n";

  selectedSkills.forEach((skill, idx) => {
    const simplerKey = `${skill}_simpler`;
    const template = templates[simplerKey] || templates[skill];
    if (!template) {
      throw new Error(`Template not found for skill: ${skill}`);
    }
    integratedTemplates += `${idx + 1}. ${skill}: ${template}\n`;
  });

  integratedTemplates +=
    "Based on [Prompt engineering techniques to apply], refine the prompt provided below. Ensure that each technique is fully incorporated to achieve a clear and effective improvement:\n\n[original]\n" +
    prompt +
    "\n[improved]\n";

  const response = await openai.chat.completions.create({
    model: model || "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: integratedTemplates },
    ],
  });

  let enhancedContent = response.choices[0].message.content;
  
  // Clean up the response to remove any explanatory text
  // Looking for patterns like "[improved]", "Enhanced:", etc.
  const patterns = [
    /\[improved\](.*)/is,
    /Enhanced:(.*)/is,
    /Enhanced prompt:(.*)/is,
    /Utilizing .* techniques to enhance .* prompt:(.*)/is,
    /"(.*)"/s,  // Text in quotes
    /```(.*?)```/s  // Text in code blocks
  ];
  
  for (const pattern of patterns) {
    const match = enhancedContent.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > prompt.length / 2) { // Ensure we're not extracting something too short
        enhancedContent = extracted;
        break;
      }
    }
  }
  
  return enhancedContent;
}

// Add a default route for development
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.send(
      "API is running. Please start the React app separately with: npm run client"
    );
  });
}

// Final prompt endpoint
app.post("/api/final-prompt", async (req, res) => {
  try {
    const { conversationId, answers, model } = req.body;
    
    const apiKey = process.env.OPENAI_API_KEY;

    // Validate inputs
    if (!conversationId || !answers) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key is not configured on the server" });
    }
    
    if (!conversations.has(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    
    const conversation = conversations.get(conversationId);
    const { originalPrompt, skills, insertPhrases, useEnglish } = conversation;
    
    // Process answers and generate final prompt
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    const answerText = Object.entries(answers)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
      .join("\n\n");
    
    // Create an enhanced prompt that includes the answers
    const promptWithAnswers = `${originalPrompt}\n\nAdditional context from follow-up questions:\n${answerText}`;
    
    // Apply the selected techniques to the prompt with answers
    let finalPrompt;
    
    if (skills && Object.keys(skills).some(skill => skills[skill])) {
      // Apply selected techniques to the updated prompt
      finalPrompt = await applySkills(
        openai,
        skills,
        promptWithAnswers,
        useEnglish,
        model
      );
      
      // Add insert phrases if selected
      if (insertPhrases && Object.keys(insertPhrases).some(phrase => insertPhrases[phrase])) {
        const phrases = require("./data/inserts");
        let phraseText = "";
        
        Object.keys(insertPhrases).forEach((phrase) => {
          if (insertPhrases[phrase] && phrases[phrase]) {
            phraseText += phrases[phrase] + " ";
          }
        });
        
        // Only add the phrase text if it's not empty
        if (phraseText.trim()) {
          finalPrompt = phraseText + "\n\n" + finalPrompt;
        }
      }
    } else {
      // If no techniques were selected, just use the combined prompt
      const response = await openai.chat.completions.create({
        model: model || "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "You are a prompt engineering assistant. Generate a final enhanced prompt based on the original prompt and the answers to follow-up questions."
          },
          {
            role: "user",
            content: `Generate an enhanced prompt based on the following prompt and Q&A pairs:\n\nOriginal prompt: ${originalPrompt}\n\nFollow-up Q&A:\n${answerText}`
          }
        ]
      });
      
      finalPrompt = response.choices[0].message.content;
    }
    
    res.json({ finalPrompt });
  } catch (error) {
    console.error("Error generating final prompt:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
