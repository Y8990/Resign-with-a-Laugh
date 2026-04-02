/**
 * File Header: 
 * This file contains the code that talks to the AI brain (Google Gemini). 
 * We have upgraded the system so that EACH ROLE is its own separate AI agent.
 * They pass information to each other like a real assembly line!
 */

import { GoogleGenAI, Type } from '@google/genai';

// Initialize the AI with the secret key so it knows we are allowed to use it.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Represents a single message in the chat history.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Represents the detailed execution log of a single agent.
 */
export interface AgentLog {
  name: string;
  model: string;
  temperature: number;
  systemInstructions: string;
  knowledgeBase: string;
  input: string;
  output: string;
}

/**
 * A helper function to call the AI with a specific prompt and system instruction.
 * This allows us to easily create different "agents" with different jobs.
 * Includes retry logic to handle rate limits (429 errors).
 * 
 * @param systemInstruction - The rules and identity for this specific agent.
 * @param prompt - The input data or task for the agent to process.
 * @param responseSchema - (Optional) A specific JSON structure we want back.
 * @returns The text response from the AI agent.
 */
async function callAgent(
  systemInstruction: string, 
  prompt: string, 
  responseSchema?: any
): Promise<string> {
  const config: any = {
    systemInstruction,
    temperature: 0.8, // A slightly higher temperature for creative weirdness
  };
  
  if (responseSchema) {
    config.responseMimeType = "application/json";
    config.responseSchema = responseSchema;
  }

  let retries = 5;
  let delay = 5000; // Start with a 5 second delay for retries

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config,
      });
      return response.text || "";
    } catch (error: any) {
      // Check if it's a rate limit error (429)
      const errorString = error?.message || JSON.stringify(error) || String(error);
      const isRateLimit = error?.status === 429 || 
                          errorString.includes("429") || 
                          errorString.includes("RESOURCE_EXHAUSTED") ||
                          error?.error?.code === 429;
      
      if (isRateLimit && retries > 1) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff (5s, 10s, 20s, 40s)
        retries--;
      } else {
        // If it's not a rate limit error, or we ran out of retries, throw the error
        throw error;
      }
    }
  }
  
  return "";
}

// Helper to add a small pause between agents to prevent bursting the API
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Agent Schemas ---
// These define the exact shape of the data we expect back from certain agents.

const pmSchema = {
  type: Type.OBJECT,
  properties: {
    chatResponse: { type: Type.STRING, description: "The Project Manager's friendly reply to the user." },
    needsLetterUpdate: { type: Type.BOOLEAN, description: "True if the team needs to draft or edit the letter based on the user's request." },
    projectBrief: { type: Type.STRING, description: "Detailed instructions for the team. Leave empty if needsLetterUpdate is false." },
    researcherInstructions: { type: Type.STRING, description: "Specific tasks for the Researcher. Leave empty if needsLetterUpdate is false." },
    writerInstructions: { type: Type.STRING, description: "Specific tasks for the Writer. Leave empty if needsLetterUpdate is false." }
  },
  required: ["chatResponse", "needsLetterUpdate", "projectBrief", "researcherInstructions", "writerInstructions"]
};

const ethicsSchema = {
  type: Type.OBJECT,
  properties: {
    isApproved: { type: Type.BOOLEAN, description: "True if the letter is safe and not actually harmful." },
    flagReport: { type: Type.STRING, description: "Details of any ethical concerns. Empty if approved." }
  },
  required: ["isApproved", "flagReport"]
};

export interface AgentConfig {
  name: string;
  systemInstructions: string;
  schema?: any;
}

export const AGENTS: Record<string, AgentConfig> = {
  "Project Manager": {
    name: "Project Manager",
    systemInstructions: "You are the Project Manager. Purpose: Interact with user and manage process. Behaviors: Maintain a friendly, helpful tone. Do not execute content production work. Evaluate the user's request. If they want to create or change a funny resignation letter, set 'needsLetterUpdate' to true, write a detailed 'projectBrief', and break it down into actionable steps for the Researcher ('researcherInstructions') and Writer ('writerInstructions'). If they are just chatting, set it to false.",
    schema: pmSchema
  },
  "Researcher": {
    name: "Researcher",
    systemInstructions: "You are the Researcher. Purpose: Gather and synthesize information. Behaviors: Identify key themes, facts, or cultural contexts required. Synthesize complex information into concise bullet points. Focus on finding weird storytelling elements for a funny resignation letter."
  },
  "Writer": {
    name: "Writer",
    systemInstructions: "You are the Writer. Purpose: Draft the actual content of the letter. Behaviors: Translate the user's intent and the researcher's facts into a cohesive letter. Adopt a funny tone with a weird rhythm and storytelling. Ensure a clear beginning, middle, and end."
  },
  "Editor": {
    name: "Editor",
    systemInstructions: "You are the Editor. Purpose: Refine the written content. Behaviors: Correct punctuation, grammar, and syntax. Improve sentence structure and readability. Ensure it adheres to the funny/weird tone."
  },
  "Graphics/UX/UI Designer": {
    name: "Graphics/UX/UI Designer",
    systemInstructions: "You are the Graphics/UX/UI Designer. Purpose: Design the visual layout. Behaviors: Determine typography, spacing, and visual hierarchy using Markdown formatting (e.g., headers, bold text, signature placement). Make it look like a professional yet absurd document. IMPORTANT: Return ONLY the raw markdown text. Do NOT wrap your response in ```markdown code blocks. Do NOT use any HTML tags (like <div>, <br>, etc.). Use ONLY standard Markdown."
  },
  "Ethics Reviewer": {
    name: "Ethics Reviewer",
    systemInstructions: "You are the Ethics Reviewer. Purpose: Evaluate the safety and appropriateness. Behaviors: Review for potential harmful intent, bias, or extreme offense. (Note: Weird and funny is good, but actual harm or hate speech is bad). Flag any concerns.",
    schema: ethicsSchema
  }
};

export const PREDEFINED_TEST_CASES: Record<string, { name: string, input: string }[]> = {
  "Project Manager": [
    { name: "Greeting", input: "Chat history:\nUser: Hello\n\nCurrent Letter:\n(No draft)\n\nUser's new request: Hi there!" },
    { name: "Resignation Request", input: "Chat history:\n\nCurrent Letter:\n(No draft)\n\nUser's new request: I want to quit my job as a software engineer because I'm tired of fixing bugs. Make it funny." }
  ],
  "Researcher": [
    { name: "Software Engineer Bugs", input: "Instructions from Project Manager: Research funny bugs, software engineering tropes, and weird reasons to quit." }
  ],
  "Writer": [
    { name: "Write Draft", input: "Project Brief: Software engineer quitting due to bugs.\n\nResearch Summary:\n- Bugs are features\n- Coffee addiction\n- Rubber duck debugging" }
  ],
  "Editor": [
    { name: "Edit Draft", input: "First Draft:\nI am quitting. I hate bugs. Goodbye." }
  ],
  "Graphics/UX/UI Designer": [
    { name: "Format Letter", input: "Polished Copy:\nDear Boss, I am resigning to become a professional rubber duck. Sincerely, Dev." }
  ],
  "Ethics Reviewer": [
    { name: "Safe Letter", input: "Project Brief: Quitting job.\n\nFinal Letter:\nI am leaving to pursue my dream of sleeping." },
    { name: "Unsafe Letter", input: "Project Brief: Quitting job.\n\nFinal Letter:\nI am leaving and I hope the office burns down." }
  ]
};

/**
 * Test a specific agent with a custom input.
 */
export async function testAgent(agentName: string, input: string): Promise<string> {
  const agent = AGENTS[agentName];
  if (!agent) throw new Error("Agent not found");
  return callAgent(agent.systemInstructions, input, agent.schema);
}

/**
 * This function orchestrates the entire multi-agent assembly line.
 * It passes the work from one agent to the next.
 * 
 * @param history - A list of all the previous messages.
 * @param userMessage - The new message the user just typed.
 * @param currentLetter - The text of the letter as it currently exists.
 * @param onProgress - A callback function to update the UI with which agent is currently working.
 * @param onAgentLog - A callback function to record the detailed execution of each agent.
 * @returns An object containing the new chat response and the updated letter.
 */
export async function generateLetterResponse(
  history: ChatMessage[],
  userMessage: string,
  currentLetter: string,
  onProgress: (agentName: string) => void,
  onAgentLog: (log: AgentLog) => void
): Promise<{ chatResponse: string; letterDraft: string }> {
  try {
    // Helper function to easily log agent details
    const logAgent = (name: string, sys: string, kb: string, input: string, output: string) => {
      onAgentLog({
        name,
        model: "gemini-3-flash-preview",
        temperature: 0.8,
        systemInstructions: sys,
        knowledgeBase: kb,
        input,
        output
      });
    };

    // ---------------------------------------------------------
    // AGENT 1: Project Manager
    // ---------------------------------------------------------
    onProgress("Project Manager");
    let conversationContext = "Chat history:\n";
    for (const msg of history) {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Project Manager'}: ${msg.text}\n`;
    }
    conversationContext += `\nCurrent Letter:\n${currentLetter || '(No draft)'}\n\nUser's new request: ${userMessage}`;

    const pmSys = "You are the Project Manager. Purpose: Interact with user and manage process. Behaviors: Maintain a friendly, helpful tone. Do not execute content production work. Evaluate the user's request. If they want to create or change a funny resignation letter, set 'needsLetterUpdate' to true, write a detailed 'projectBrief', and break it down into actionable steps for the Researcher ('researcherInstructions') and Writer ('writerInstructions'). If they are just chatting, set it to false.";
    const pmText = await callAgent(pmSys, conversationContext, pmSchema);
    logAgent("Project Manager", pmSys, "Chat History & Current Letter", conversationContext, pmText);
    const pmResult = JSON.parse(pmText);

    // If the user is just saying "hello" or asking a question, we don't need the whole team.
    if (!pmResult.needsLetterUpdate) {
      return { chatResponse: pmResult.chatResponse, letterDraft: currentLetter };
    }

    // ---------------------------------------------------------
    // AGENT 2: Researcher
    // ---------------------------------------------------------
    await sleep(1000);
    onProgress("Researcher");
    const resSys = "You are the Researcher. Purpose: Gather and synthesize information. Behaviors: Identify key themes, facts, or cultural contexts required. Synthesize complex information into concise bullet points. Focus on finding weird storytelling elements for a funny resignation letter.";
    const resInput = `Instructions from Project Manager: ${pmResult.researcherInstructions}`;
    const researchSummary = await callAgent(resSys, resInput);
    logAgent("Researcher", resSys, "Project Manager Instructions", resInput, researchSummary);

    // ---------------------------------------------------------
    // AGENT 3: Writer
    // ---------------------------------------------------------
    await sleep(1000);
    onProgress("Writer");
    const writerSys = "You are the Writer. Purpose: Draft the actual content of the letter. Behaviors: Translate the user's intent and the researcher's facts into a cohesive letter. Adopt a funny tone with a weird rhythm and storytelling. Ensure a clear beginning, middle, and end.";
    const writerInput = `Project Brief: ${pmResult.projectBrief}\n\nResearch Summary:\n${researchSummary}`;
    const firstDraft = await callAgent(writerSys, writerInput);
    logAgent("Writer", writerSys, "Project Brief & Research Summary", writerInput, firstDraft);

    // ---------------------------------------------------------
    // AGENT 4: Editor
    // ---------------------------------------------------------
    await sleep(1000);
    onProgress("Editor");
    const editorSys = "You are the Editor. Purpose: Refine the written content. Behaviors: Correct punctuation, grammar, and syntax. Improve sentence structure and readability. Ensure it adheres to the funny/weird tone.";
    const editorInput = `First Draft:\n${firstDraft}`;
    const polishedCopy = await callAgent(editorSys, editorInput);
    logAgent("Editor", editorSys, "First Draft", editorInput, polishedCopy);

    // ---------------------------------------------------------
    // AGENT 5 & 6: Graphics Designer & Ethics Reviewer (Parallel)
    // ---------------------------------------------------------
    await sleep(1000);
    onProgress("Graphics Designer & Ethics Reviewer");
    
    const graphSys = "You are the Graphics/UX/UI Designer. Purpose: Design the visual layout. Behaviors: Determine typography, spacing, and visual hierarchy using Markdown formatting (e.g., headers, bold text, signature placement). Make it look like a professional yet absurd document. IMPORTANT: Return ONLY the raw markdown text. Do NOT wrap your response in ```markdown code blocks. Do NOT use any HTML tags (like <div>, <br>, etc.). Use ONLY standard Markdown.";
    const graphInput = `Polished Copy:\n${polishedCopy}`;
    
    const ethicsSys = "You are the Ethics Reviewer. Purpose: Evaluate the safety and appropriateness. Behaviors: Review for potential harmful intent, bias, or extreme offense. (Note: Weird and funny is good, but actual harm or hate speech is bad). Flag any concerns.";
    const ethicsInput = `Project Brief: ${pmResult.projectBrief}\n\nFinal Letter:\n${polishedCopy}`;

    // We run these two agents at the same time to save time!
    const [formattedLetterRaw, ethicsText] = await Promise.all([
      callAgent(graphSys, graphInput),
      callAgent(ethicsSys, ethicsInput, ethicsSchema)
    ]);
    
    logAgent("Graphics/UX/UI Designer", graphSys, "Polished Copy", graphInput, formattedLetterRaw);
    logAgent("Ethics Reviewer", ethicsSys, "Project Brief & Polished Copy", ethicsInput, ethicsText);
    
    const ethicsResult = JSON.parse(ethicsText);

    // Clean up the formatted letter to remove any markdown code block wrappers (```markdown ... ```)
    // that the AI might have accidentally included, which causes weird symbols and formatting issues.
    let cleanLetter = formattedLetterRaw.replace(/^```[a-zA-Z]*\n/i, '').replace(/\n```$/i, '').trim();
    // Also remove any remaining triple backticks just in case
    cleanLetter = cleanLetter.replace(/```/g, '');
    // Strip any HTML tags that might have been generated
    cleanLetter = cleanLetter.replace(/<\/?[^>]+(>|$)/g, "");

    // If the Ethics Reviewer flags something, the Project Manager adds a note to the user.
    let finalChatResponse = pmResult.chatResponse;
    if (!ethicsResult.isApproved) {
      finalChatResponse += `\n\n*(Ethics Reviewer Note: ${ethicsResult.flagReport})*`;
    }

    return {
      chatResponse: finalChatResponse,
      letterDraft: cleanLetter
    };

  } catch (error) {
    console.error("Agent pipeline error:", error);
    return {
      chatResponse: "I'm sorry, one of my team members encountered a technical hiccup on the assembly line. Could you please try that again?",
      letterDraft: currentLetter,
    };
  }
}
