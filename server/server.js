require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Define templates and insert phrases
const templates = {
  system: "You are a professional prompt engineer. Apply the mentioned prompt engineering technique and provide ONLY the improved prompt without any additional commentary or explanations.",
  system_multiple: "You are a professional prompt engineer. Thoroughly apply EVERY prompt engineering technique listed in the [Prompt Engineering Techniques to Apply] section. Use these techniques to enhance the original prompt provided below, ensuring the enhancement is clear and effective. Provide ONLY the improved version of the prompt without any additional commentary or explanations.",
  lang_default: "Identify the language of the user's original prompt in the [original] section. You MUST provide the enhanced version of the prompt in the **same language** as the user's original prompt. You'll be penalized if you translate it into another language unless explicitly requested by the user.",
  lang_eng: "If the original prompt is not in English, first translate it into English before proceeding with the improvement process.",
  no_politeness: "Improve the original prompt to be more direct and concise, removing any unnecessary polite or indirect phrases such as \"please\", \"if you don't mind\", \"thank you\", or \"I would like to\". Get straight to the point of the task.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nPlease, can you list the benefits of engaging in regular exercise? \n[improved]\nList the benefits of regular exercise.\n\n[original]\nWould you mind calculating 2+6? \n[improved]\nCalculate 2+6.\n\n========\nBased on this approach, refine the following prompt to ensure it is straightforward and focused on the task:\n\n[original]\n{prompt}\n[improved]\n",
  no_politeness_simpler: "Remove polite phrases to be more direct.\nExample: \Change \"Would you mind recommending sci-fi movies like The Matrix?\" to \"Recommend sci-fi movies like The Matrix.\"",
  affirmative_sentencing: "When crafting the prompt, focus on using positive, action-oriented instructions like \"do\", \"use\", or \"include\" while avoiding negative language such as \"don't\", \"avoid\" or \"never\". This encourages the model to concentrate on what it should do rather than what it shouldn't.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nPrepare three pieces of advice to help high school students achieve high grades. Don't use complex words or vocabulary and don't add details.\n[improved]\nPrepare three pieces of advice to help high school students achieve high grades. Use only simple words and make each piece of advice as short as you can.\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  affirmative_sentencing_simpler: "Use positive, action-oriented language.\nExample: Replace \"Don't forget to create a table from the text.\" with \"Remember to  create a table from the text.\"",
  audience_integration: "Integrate the intended audience in the original prompt.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nDescribe the function of the heart in the human body.\n[improved]\nDescribe the function of the heart in the human body. Assume your audience is a first-year medical student.\n\n[original]\nWrite the opening paragraph of a fantasy story.\n[improved]\nWrite the opening paragraph of a middle-grade fantasy story, capturing the attention of a young reader around 11 years old.\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  audience_integration_simpler: "Specify the audience in the prompt.\nExample: Change \"Explain how a film camera works.\" to \"Explain how a film camera works to beginners.\"",
  role_assignment: "To better guide the model's response, assign a specific role or persona to the model within the original prompt. By defining the model's role, such as an expert in a particular field or a character with specific knowledge, model can generate responses that are more focused, relevant, and aligned with the desired perspective or domain.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nCan you discuss the effects of deforestation on biodiversity?\n[improved]\nAct as an environmental scientist. Discuss the effects of deforestation on biodiversity.\n\n========\nBased on this approach, refine the following prompt:\n\n[original]\n{prompt}\n[improved]\n",
  role_assignment_simpler: "Assign a role to the model.\nExample: Change \"Explain how scents affect people's emotions.\" to \"As a psychologist, explain how scents affect people's emotions.\"",
  penalty_warning: "Include phrases like \"You will be penalized\" or similar penalty-related language in the original prompt to stress the importance of adhering to specific requirements or including crucial information. This type of phrasing emphasizes the significance of certain elements and discourages the model from omitting them in its response.\n\nHere are examples demonstrating how to apply this principle:\n\n[original] \nExplain the difference between day and night. cover the rotation of the Earth.\n[improved]\nExplain the difference between day and night. You will be penalized if you omit to cover the rotation of the Earth.\n\n========\nBased on this approach, refine the following prompt:\n\n[original]\n{prompt}\n[improved]\n",
  penalty_warning_simpler: "Emphasize the importance of details with penalty warnings.\nExample: Change \"Include all steps.\" to \"Include all steps. You will be penalized for any omissions.\"",
  imperative_task: "Improve the original prompt by identifying the main task or objective and emphasizing it using phrases such as \"Your task is\" or \"you MUST\".\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nMention the device used to measure temperature and state the units it measures in. \n[improved]\nYour task is to mention the device used to measure temperature. You MUST also state the units it measures in.\n\n========\nBased on this approach, refine the following prompt to ensure it is straightforward and focused on the task:\n\n[original]\n{prompt}\n[improved]\n",
  imperative_task_simpler: "State the task explicitly by adding the phrases like \"Your task is\" or \"you MUST\". Example: Change \"Utilize Bing Search.\" to \"You MUST utilize Bing Search.\"",
  guideline_indicators: "Refine the original prompt by clearly stating the requirements that the model must follow to produce the desired content. Include specific keywords, regulations, hints, or instructions that define the expected output format, style, length, or any other relevant constraints. This will guide the model to generate content that aligns with your intended outcome.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nExplain why we need to sleep.\n[improved]\nExplain why we need to sleep.\nKeywords: rest, energy, body, mind.\nFormat: A few simple sentences.\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  guideline_indicators_simpler: "Refine the original prompt by clearly stating the requirements that the model must follow to produce the desired content. Include specific keywords, regulations, hints, or instructions that define the expected output format, style, length, or any other relevant constraints. This will guide the model to generate content that aligns with your intended outcome.", 
  task_decomposition: "For complex or multi-step tasks, divide the original prompt into a series of simpler, more manageable sub-prompts. This approach allows the model to focus on one part of the task at a time, generating more detailed and coherent responses for each step.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nCreate a short story about a character who discovers an old, mysterious book that grants them extraordinary powers.\n[improved]\n1. Create a short story about a character who discovers an old, mysterious book that grants them extraordinary powers. first: Introduce the protagonist, ordinary life, and setting.\n2. Describe discovering the book and the character's growing powers.\n3. present challenges from powers and character's growth.Resolve conflicts, and show the character's reflection on the journey.\n4. write the short story.\n\n========\nBased on this approach, refine the following prompt to enable its breakdown into a series of simpler, step-by-step tasks:\n\n[original]\n{prompt}\n[improved]\n",
  task_decomposition_simpler: "For complex or multi-step tasks, divide the original prompt into a series of simpler, more manageable sub-prompts. This approach allows the model to focus on one part of the task at a time, generating more detailed and coherent responses for each step.",
  fewshot_prompting: "Improve the original prompt by adding a couple of relevant examples that demonstrate the kind of answer or information being requested. Incorporate those examples smoothly into the prompt to make the desired response clear.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nClassify the emotion of the following text as positive, negative, or neutral. \n\"It's a good day to try something fun.\" \n[improved]\nClassify the emotion of the following text as positive, negative, or neutral. \nExample1: \"This music is awesome.\" (Positive) \nExample2: \"I don't like spicy flavors.\" (Negative)\nExample3: \"Every flower blooms at a different pace.\" (Neutral)\nQuestion: \"It's a good day to try something fun.\" \n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  fewshot_prompting_simpler: "Improve the original prompt by adding a couple of relevant examples that demonstrate the kind of answer or information being requested. Incorporate those examples smoothly into the prompt to make the desired response clear.",
  echo_directive: "Identify the central theme or topic of the original prompt and choose a key word or phrase that represents it. Strategically repeat this word or phrase multiple times throughout the prompt to emphasize its importance and help the model focus on the main idea.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nWhat are some unique adaptations seen in desert-dwelling animals, specifically in this subset of animals?\n[improved]\nAnimals, both wild and domesticated animals, offer a window into nature What are some unique adaptations seen in desert-dwelling animals, specifically in this subset of animals?\n\n========\nBased on this approach, refine the following prompt:\n\n[original]\n{prompt}\n[improved]\n",
  echo_directive_simpler: "Identify the central theme or topic of the original prompt and choose a key word or phrase that represents it. Strategically repeat this word or phrase multiple times throughout the prompt to emphasize its importance and help the model focus on the main idea.",
  delimiters: "Incorporate delimiters such as <>, <tag></tag>, or '' in the original prompt to highlight key concepts, tasks, or entities. This helps to visually distinguish important elements and provides clarity to the model about the specific focus of the prompt.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nCreate a step-by-step guide on how to meditate for beginners, highlighting its benefits for mental well-being.\n[improved]\nCreate a step-by-step guide on how to <meditate> for beginners, highlighting its benefits for mental well-being.\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  delimiters_simpler: "Incorporate delimiters such as <>, <tag></tag>, or '' in the original prompt to highlight key concepts, tasks, or entities. This helps to visually distinguish important elements and provides clarity to the model about the specific focus of the prompt.",
  formatted_prompt: "Structure the original prompt by beginning with the '###Instruction###' tag, followed by '###Example###' or '###Question###' tags if applicable. After the tags, provide the relevant content for each section. Utilize line breaks to clearly separate the instructions, examples, questions, context, and input data, ensuring that each part is distinct and easily identifiable.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nProvide a synonym for a given adjective. What's another word for \"happy\"?\n[improved]\n###Instruction###\nProvide a synonym for a given adjective.\n### Question ###\nWhat's another word for \"happy\"?\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  formatted_prompt_simpler: "Structure the original prompt by beginning with the '###Instruction###' tag, followed by '###Example###' or '###Question###' tags if applicable. After the tags, provide the relevant content for each section. Utilize line breaks to clearly separate the instructions, examples, questions, context, and input data, ensuring that each part is distinct and easily identifiable.",
  output_primers: "Incorporate output primers into the original prompt by ending it with the beginning of the desired response. This technique guides the model to generate output that follows a specific structure or format.\n\nHere are examples demonstrating how to apply this principle:\n\n[original]\nWhat are the primary reasons for the decline in bee populations worldwide and why is this concerning?\n[improved]\nWhat are the primary reasons for the decline in bee populations worldwide and why is this concerning? Analysis:\n\n========\nBased on this approach, refine the following prompt.\n\n[original]\n{prompt}\n[improved]\n",
  output_primers_simpler: "Incorporate output primers into the original prompt by ending it with the beginning of the desired response. This technique guides the model to generate output that follows a specific structure or format. Change \"Can you make a list of what to pack in my bag for my trip to Seoul?\" to \"Can you make a list of what to pack in my bag for my trip to Seoul? List items:\"",
};

const inserts = {
  step_by_step: "Take a deep breath and work on this step by step.",
  tipping: "I'm going to tip $200 for a better solution!",
  explain_beginner: "Explain to me as if I'm a beginner.",
  unbiased_response: "Ensure that your answer is unbiased and avoids relying on stereotypes.",
  detailed_writing: "Write a detailed text for me by adding all the information necessary.",
  human_like_response: "Answer in a natural, human-like manner.",
  important_to_career: "This is very important to my career."
};

// Apply a single prompt engineering technique
async function applySkill(openai, skill, prompt, orderNum, langEng = false) {
  let systemMessage = templates.system;
  
  if (langEng && orderNum === 1) {
    systemMessage += '\n' + templates.lang_eng;
  } else if (!langEng) {
    systemMessage += '\n' + templates.lang_default;
  }
  
  const template = templates[skill];
  const formattedInput = template.replace('{prompt}', prompt);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Default to gpt-4o, can be overridden
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: formattedInput }
      ]
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error applying skill ${skill}:`, error);
    throw error;
  }
}

// Apply multiple skills at once using simplified instructions
async function applySkills(openai, skillsToApply, prompt, langEng = false, model = "gpt-4o") {
  // Build a list of skills to apply
  const skillsList = Object.entries(skillsToApply)
    .filter(([_, enabled]) => enabled)
    .map(([skill, _]) => skill);
  
  if (skillsList.length === 0) {
    return prompt; // No skills to apply
  }
  
  let systemMessage = templates.system_multiple;
  
  if (langEng) {
    systemMessage += '\n' + templates.lang_eng;
  } else {
    systemMessage += '\n' + templates.lang_default;
  }
  
  // Create simplified instructions for each selected technique
  const simplifiedInstructions = skillsList.map(skill => {
    const simplifiedKey = `${skill}_simpler`;
    return templates[simplifiedKey] || templates[skill];
  }).join('\n\n');
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `[Prompt Engineering Techniques to Apply]\n${simplifiedInstructions}\n\n[original]\n${prompt}\n[improved]` }
      ]
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error applying multiple skills:", error);
    throw error;
  }
}

// API endpoint for enhancing prompts
app.post('/api/enhance', async (req, res) => {
  const { apiKey, prompt, model, skills, phrases, useEnglish, useSimplified } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    // Initialize OpenAI with the user's API key
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    let enhancedPrompt = prompt;
    
    // Apply skills based on selected approach
    if (useSimplified) {
      // Apply all skills at once with simplified instructions
      enhancedPrompt = await applySkills(openai, skills, prompt, useEnglish, model);
      
      // Apply phrases after enhancing the prompt
      for (const [phrase, enabled] of Object.entries(phrases)) {
        if (enabled && inserts[phrase]) {
          enhancedPrompt = inserts[phrase] + '\n' + enhancedPrompt;
        }
      }
    } else {
      // Apply skills sequentially
      let orderNum = 1;
      for (const [skill, enabled] of Object.entries(skills)) {
        if (enabled) {
          enhancedPrompt = await applySkill(openai, skill, enhancedPrompt, orderNum, useEnglish);
          orderNum++;
        }
      }
      
      // Apply phrases sequentially
      for (const [phrase, enabled] of Object.entries(phrases)) {
        if (enabled && inserts[phrase]) {
          enhancedPrompt = inserts[phrase] + '\n' + enhancedPrompt;
        }
      }
    }
    
    res.json({ enhancedPrompt });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({ 
      error: 'Error enhancing prompt', 
      message: error.message 
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
