/**
 * File Header:
 * This file contains the visual component for a single chat bubble.
 * It decides how a message looks depending on whether it was sent by the 
 * user or by the AI Project Manager.
 */

import React from 'react';

/**
 * The properties (settings) that this component needs to work.
 */
interface ChatBubbleProps {
  /** The text of the message */
  text: string;
  /** Who sent the message: 'user' or 'model' (the AI) */
  role: 'user' | 'model';
}

/**
 * A component that draws a single chat message on the screen.
 * 
 * @param props - The settings for this chat bubble (text and role).
 * @returns The visual HTML elements for the chat bubble.
 */
export function ChatBubble({ text, role }: ChatBubbleProps) {
  // If the role is 'user', we align the bubble to the right. 
  // If it's 'model', we align it to the left.
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] p-4 border-[3px] border-[#333333] rounded-xl ${
          isUser 
            ? 'bg-[#333333] text-[#F4EFE6] shadow-[4px_4px_0px_#333333]' 
            : 'bg-white text-[#333333] shadow-[4px_4px_0px_#333333]'
        }`}
      >
        {/* We use a simple paragraph tag to show the text. 
            whitespace-pre-wrap makes sure line breaks are respected. */}
        <p className="text-xl leading-relaxed whitespace-pre-wrap font-sans">
          {text}
        </p>
      </div>
    </div>
  );
}
