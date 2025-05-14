# Prompt Enhancer

A web application that helps you enhance your prompts using various prompt engineering techniques. The app uses OpenAI's GPT models to improve your prompts by applying different techniques like clarity enhancement, context addition, constraints, examples, chain of thought, few-shot learning, and role play.

## Features

- Apply multiple prompt engineering techniques to enhance your prompts
- Choose from basic and advanced techniques
- Add style options to customize the output
- Support for multiple OpenAI models
- Option to force English output
- Simplified mode for faster processing
- Local storage of API key
- Modern and responsive UI

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rohit/a.git
cd a
```

2. Install server dependencies:

```bash
npm install
```

3. Install client dependencies:

```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
```

## Usage

1. Start the development server:

```bash
npm run dev
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

2. Open your browser and navigate to `http://localhost:3000`

3. Enter your OpenAI API key in the settings dialog

4. Enter your prompt and select the desired enhancement techniques

5. Click "Enhance Prompt" to get the improved version

## Available Techniques

### Basic Techniques

- Clarity Enhancement: Make the prompt more specific and remove ambiguity
- Context Addition: Add relevant context to make the prompt more comprehensive
- Constraints: Add specific constraints and requirements
- Examples: Add relevant examples to illustrate expected output

### Advanced Techniques

- Chain of Thought: Encourage step-by-step reasoning
- Few-Shot Learning: Add input-output examples to guide the response
- Role Play: Frame as a conversation with a specific expert role

### Style Options

- Be Specific
- Be Concise
- Be Creative
- Be Technical
- Be Simple
- Be Professional
- Be Friendly
- Be Formal
- Be Casual
- Be Structured

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Prompt Engineering Techniques

The app supports the following prompt engineering techniques:

### Prompt Structure and Clarity

- **Audience Integration**: Specify the intended audience
- **Affirmative Sentencing**: Use positive directives instead of negative language
- **Output Primers**: Guide the response format by starting the output
- **Delimiters**: Use visual markers to highlight key concepts
- **Formatted Prompt**: Structure prompts with clear section tags

### Specificity and Information

- **Few-Shot Prompting**: Include examples of desired input/output pairs
- **Guideline Indicators**: Specify keywords, format requirements, constraints

### Content and Language Style

- **No Politeness**: Remove unnecessary polite phrases for conciseness
- **Imperative Task**: Use phrases like "Your task is" or "You MUST"
- **Penalty Warning**: Emphasize requirements with penalty language
- **Role Assignment**: Assign a specific role to the model
- **Echo Directive**: Repeat key terms for emphasis

### Complex Tasks

- **Task Decomposition**: Break complex tasks into simpler steps
