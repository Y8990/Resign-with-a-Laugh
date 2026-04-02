/**
 * File Header:
 * This is the main screen of our application. It sets up the layout:
 * the chat on the left side, and the letter document on the right side.
 * It also handles the state (memory) of the chat and the letter.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ChatBubble } from './components/ChatBubble';
import { SystemDiagram } from './components/SystemDiagram';
import { PixelSend, PixelLoader, PixelFileText, PixelActivity, PixelX } from './components/PixelIcons';
import { generateLetterResponse, ChatMessage, AgentLog, AGENTS, PREDEFINED_TEST_CASES, testAgent } from './services/geminiService';

/**
 * App Component
 * 
 * This is the main React component that renders the entire application.
 * It manages the state for the chat, the letter draft, and the agent inspection modal.
 * 
 * @returns {JSX.Element} The rendered application.
 */
export default function App() {
  // We use "state" to remember things that change while the app is running.
  // This remembers all the messages in the chat.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hi there! I'm your Project Manager. I lead a team of writers, researchers, and editors. Tell me a bit about your job and why you want to resign, and we'll craft a hilariously weird resignation letter for you.",
    },
  ]);
  
  // This remembers what the user is currently typing in the input box.
  const [inputValue, setInputValue] = useState('');
  
  // This remembers the current draft of the letter.
  const [letterDraft, setLetterDraft] = useState('');
  
  // This remembers if the AI team is currently working (loading).
  const [isLoading, setIsLoading] = useState(false);

  // This remembers WHICH agent is currently working, so we can show the user.
  const [currentAgent, setCurrentAgent] = useState<string>('');
  
  // This stores the detailed logs of all agents that ran in the last request.
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  
  // This controls whether the Agent Inspection Modal is open or closed.
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Tab State
  const [activeTab, setActiveTab] = useState<'logs' | 'testing' | 'diagram'>('logs');
  
  // Testing Platform State
  const [selectedAgent, setSelectedAgent] = useState<string>('Project Manager');
  const [testInput, setTestInput] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  
  // This helps us automatically scroll to the bottom of the chat.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * scrollToBottom
   * 
   * A helper function that smoothly scrolls the chat window to the very bottom
   * so the user can always see the newest messages.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * handleSendMessage
   * 
   * This function is called when the user clicks the send button or presses Enter.
   * It takes their message, adds it to the chat, and asks the AI team to work on it.
   * It also handles showing the loading animation and updating the letter draft.
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', text: inputValue };
    
    // Add the user's message to the chat history immediately so they see it.
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setCurrentAgent('Project Manager'); // Start with the PM
    setAgentLogs([]); // Clear previous agent logs for the new request

    try {
      // Ask the AI team to process the request. 
      // We pass a special function (callback) that updates the currentAgent state.
      const response = await generateLetterResponse(
        messages, 
        newUserMessage.text, 
        letterDraft,
        (agentName) => setCurrentAgent(agentName),
        (log) => setAgentLogs((prev) => [...prev, log]) // Save each agent's log as it finishes
      );
      
      // Add the Project Manager's response to the chat.
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.chatResponse },
      ]);
      
      // Update the letter document if the team made changes.
      if (response.letterDraft) {
        setLetterDraft(response.letterDraft);
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "Oops, my team hit a snag on the assembly line. Let's try that again." },
      ]);
    } finally {
      // We are done loading, so we can turn off the loading animation.
      setIsLoading(false);
      setCurrentAgent('');
    }
  };

  /**
   * handleKeyDown
   * 
   * This function allows the user to press the Enter key to send a message
   * instead of having to click the send button.
   * 
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event object.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  /**
   * handleRunTest
   * 
   * Handles running a manual test for a specific agent in the Agent Platform modal.
   * It sends the custom input to the selected agent and displays the result.
   */
  const handleRunTest = async () => {
    if (!testInput.trim() || isTesting) return;
    
    setIsTesting(true);
    setTestOutput('');
    
    try {
      const result = await testAgent(selectedAgent, testInput);
      setTestOutput(result);
    } catch (error) {
      console.error("Test failed:", error);
      setTestOutput("Error running test. Please check the console or try again.");
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * handleSelectTestCase
   * 
   * Handles selecting a predefined test case from the dropdown menu in the testing platform.
   * It automatically fills the input box with the test case text.
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event from the dropdown.
   */
  const handleSelectTestCase = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setTestInput(value);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#E8E4DB] p-4 sm:p-8 font-sans text-[#333333]">
      <div className="flex flex-col w-full max-w-7xl h-full max-h-[900px] bg-[#F4EFE6] border-[3px] border-[#333333] rounded-2xl shadow-[8px_8px_0px_#333333] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-[#333333] bg-[#F4EFE6]">
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-[#333333]"></div>
            <div className="w-4 h-4 rounded-full border-[2px] border-[#333333]"></div>
            <div className="w-4 h-4 rounded-full border-[2px] border-[#333333]"></div>
          </div>
          <div className="font-bold text-xl tracking-tight uppercase">Resign with a Laugh</div>
          <div className="w-16"></div> {/* Spacer to balance the dots */}
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT PANE: Chat Interface */}
          <div className="w-1/3 flex flex-col border-r-[3px] border-[#333333] bg-[#F4EFE6] z-10">
            
            {/* Chat Header */}
            <div className="p-6 border-b-[3px] border-[#333333] bg-[#F4EFE6] flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight uppercase">Project Manager</h2>
                <p className="text-lg text-[#333333]/80 mt-1">Your agentic team</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="p-2 border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] bg-white text-[#333333] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#333333] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center gap-2 rounded-xl"
                title="Inspect Agents"
              >
                <PixelActivity className="w-6 h-6" />
              </button>
            </div>

        {/* Chat Messages Area */}
        <div 
          className="flex-1 overflow-y-auto p-6 scroll-smooth relative"
        >
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#333333 2px, transparent 2px)', 
                 backgroundSize: '16px 16px',
                 backgroundPosition: '0 0'
               }} 
          />
          <div className="relative z-10">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble role={msg.role} text={msg.text} />
              </motion.div>
            ))}
            
            {/* Loading Indicator showing the current agent */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3 text-[#333333] p-4 bg-white border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] mb-4 max-w-[85%] rounded-xl"
              >
                <PixelLoader className="w-6 h-6 animate-spin" />
                <span className="text-xl font-bold uppercase">
                  {currentAgent ? `${currentAgent} is working...` : 'The team is gathering...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-white border-t-[3px] border-[#333333]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell the Project Manager..."
              className="w-full pl-4 pr-16 py-3 bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_#333333] transition-all text-xl rounded-xl"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-2 bg-[#333333] text-[#F4EFE6] border-[3px] border-[#333333] hover:bg-white hover:text-[#333333] disabled:opacity-50 disabled:hover:bg-[#333333] disabled:hover:text-[#F4EFE6] transition-colors rounded-xl"
              aria-label="Send message"
            >
              <PixelSend className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Document Mockup */}
      <div className="w-2/3 p-8 lg:p-12 bg-[#F4EFE6] overflow-y-auto relative">
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#333333 2px, transparent 2px)', 
               backgroundSize: '16px 16px',
               backgroundPosition: '0 0'
             }} 
        />

        <div className="w-full max-w-3xl mx-auto">
          {letterDraft ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white w-full min-h-[850px] shadow-[8px_8px_0px_#333333] p-12 lg:p-16 border-[3px] border-[#333333] relative z-10 mb-12 rounded-2xl"
            >
              <div className="prose prose-sm sm:prose-base max-w-none text-[#333333] font-sans leading-relaxed text-xl">
                <Markdown>{letterDraft}</Markdown>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-[#333333]/30 space-y-4 min-h-[850px] border-[3px] border-dashed border-[#333333]/30 bg-white/50 relative z-10 rounded-2xl">
              <PixelFileText className="w-16 h-16" />
              <p className="text-2xl font-bold tracking-tight uppercase">Your letter will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Inspection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#333333]/20 backdrop-blur-sm p-4 sm:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-5xl max-h-full shadow-[12px_12px_0px_#333333] flex flex-col overflow-hidden border-[4px] border-[#333333] rounded-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b-[4px] border-[#333333] flex justify-between items-center bg-[#F4EFE6]">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 uppercase">
                    <PixelActivity className="w-6 h-6" />
                    Agent Platform
                  </h2>
                  <div className="flex bg-[#333333] p-1 gap-1 rounded-xl">
                    <button
                      onClick={() => setActiveTab('logs')}
                      className={`px-4 py-1.5 text-lg font-bold uppercase transition-colors rounded-lg ${
                        activeTab === 'logs' ? 'bg-white text-[#333333]' : 'text-[#F4EFE6] hover:bg-white/20'
                      }`}
                    >
                      Execution Logs
                    </button>
                    <button
                      onClick={() => setActiveTab('testing')}
                      className={`px-4 py-1.5 text-lg font-bold uppercase transition-colors rounded-lg ${
                        activeTab === 'testing' ? 'bg-white text-[#333333]' : 'text-[#F4EFE6] hover:bg-white/20'
                      }`}
                    >
                      Testing Platform
                    </button>
                    <button
                      onClick={() => setActiveTab('diagram')}
                      className={`px-4 py-1.5 text-lg font-bold uppercase transition-colors rounded-lg ${
                        activeTab === 'diagram' ? 'bg-white text-[#333333]' : 'text-[#F4EFE6] hover:bg-white/20'
                      }`}
                    >
                      System Diagram
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-white border-[3px] border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-[#F4EFE6] transition-colors shadow-[2px_2px_0px_#333333] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none rounded-xl"
                >
                  <PixelX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {agentLogs.length === 0 ? (
                      <div className="text-center text-[#333333]/50 py-12 border-[3px] border-dashed border-[#333333]/30 rounded-2xl">
                        <PixelActivity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-xl uppercase font-bold">No agents have run yet. Send a message to start the pipeline!</p>
                      </div>
                    ) : (
                      agentLogs.map((log, index) => (
                        <div key={index} className="border-[3px] border-[#333333] shadow-[6px_6px_0px_#333333] overflow-hidden bg-white mb-6 rounded-2xl">
                          <div className="bg-[#F4EFE6] px-4 py-3 border-b-[3px] border-[#333333]">
                            <h3 className="font-bold text-2xl uppercase">{log.name}</h3>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                              <div><span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">Model</span> {log.model}</div>
                              <div><span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">Temperature</span> {log.temperature}</div>
                              <div><span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">Knowledge Base</span> {log.knowledgeBase}</div>
                            </div>
                            
                            <div>
                              <span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">System Instructions</span>
                              <div className="bg-[#F4EFE6] p-3 text-lg font-mono text-[#333333] whitespace-pre-wrap max-h-40 overflow-y-auto border-[3px] border-[#333333] shadow-[inset_4px_4px_0px_rgba(22,23,23,0.1)] rounded-xl">
                                {log.systemInstructions}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">Input</span>
                                <div className="bg-[#F4EFE6] p-3 text-lg font-mono text-[#333333] whitespace-pre-wrap max-h-60 overflow-y-auto border-[3px] border-[#333333] shadow-[inset_4px_4px_0px_rgba(22,23,23,0.1)] rounded-xl">
                                  {log.input}
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-[#333333] block text-sm uppercase tracking-wider mb-1">Output</span>
                                <div className="bg-[#F4EFE6] p-3 text-lg font-mono text-[#333333] whitespace-pre-wrap max-h-60 overflow-y-auto border-[3px] border-[#333333] shadow-[inset_4px_4px_0px_rgba(22,23,23,0.1)] rounded-xl">
                                  {log.output}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'testing' && (
                  <div className="flex flex-col h-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Controls & Input */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xl font-bold text-[#333333] mb-1 uppercase">Select Agent</label>
                          <select 
                            value={selectedAgent}
                            onChange={(e) => {
                              setSelectedAgent(e.target.value);
                              setTestInput('');
                              setTestOutput('');
                            }}
                            className="w-full p-2.5 bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_#333333] transition-all text-xl rounded-xl"
                          >
                            {Object.keys(AGENTS).map(agentName => (
                              <option key={agentName} value={agentName}>{agentName}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xl font-bold text-[#333333] mb-1 uppercase">Predefined Test Cases</label>
                          <select 
                            onChange={handleSelectTestCase}
                            className="w-full p-2.5 bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_#333333] transition-all text-xl rounded-xl"
                            defaultValue=""
                          >
                            <option value="" disabled>Select a test case...</option>
                            {PREDEFINED_TEST_CASES[selectedAgent]?.map((tc, idx) => (
                              <option key={idx} value={tc.input}>{tc.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xl font-bold text-[#333333] mb-1 uppercase">Custom Input</label>
                          <textarea 
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder="Enter custom input for the agent..."
                            className="w-full p-3 bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[4px_4px_0px_#333333] focus:outline-none focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_#333333] transition-all text-xl font-mono h-48 resize-none rounded-xl"
                          />
                        </div>

                        <button
                          onClick={handleRunTest}
                          disabled={isTesting || !testInput.trim()}
                          className="w-full py-3 bg-[#333333] text-[#F4EFE6] border-[3px] border-[#333333] font-bold text-xl uppercase hover:bg-white hover:text-[#333333] shadow-[4px_4px_0px_#333333] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:hover:bg-[#333333] disabled:hover:text-[#F4EFE6] flex items-center justify-center gap-2 rounded-xl"
                        >
                          {isTesting ? <PixelLoader className="w-6 h-6 animate-spin" /> : <PixelSend className="w-6 h-6" />}
                          {isTesting ? 'Running Test...' : 'Run Test'}
                        </button>
                      </div>

                      {/* Right Column: Output */}
                      <div className="flex flex-col">
                        <label className="block text-xl font-bold text-[#333333] mb-1 uppercase">Agent Output</label>
                        <div className="flex-1 bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[inset_4px_4px_0px_rgba(22,23,23,0.1)] p-4 overflow-y-auto font-mono text-xl text-[#333333] min-h-[300px] whitespace-pre-wrap rounded-xl">
                          {testOutput || <span className="text-[#333333]/40 italic">Output will appear here...</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'diagram' && (
                  <div className="flex flex-col h-full">
                    <SystemDiagram />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
