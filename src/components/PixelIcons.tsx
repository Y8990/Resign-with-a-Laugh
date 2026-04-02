/**
 * File Header:
 * This file contains custom pixel-art style icons used throughout the application.
 * These are SVG (Scalable Vector Graphics) components that can be styled with CSS.
 */

import React from 'react';

/**
 * PixelSend Icon
 * 
 * A pixel-art style icon representing a "send" action (like a paper plane or arrow).
 * 
 * @param {Object} props - The properties for the icon.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const PixelSend = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h2v16H4V4zm2 2h2v12H6V6zm2 2h2v8H8V8zm2 2h2v4h-2v-4zm2 0h2v4h-2v-4zm2-2h2v8h-2V8zm2-2h2v12h-2V6zm2-2h2v16h-2V4z" />
  </svg>
);

/**
 * PixelLoader Icon
 * 
 * A pixel-art style icon representing a loading state (like an hourglass or spinner).
 * 
 * @param {Object} props - The properties for the icon.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const PixelLoader = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2h12v4H6V2zm2 4h8v2H8V6zm2 2h4v2h-4V8zm0 2h4v4h-4v-4zm-2 4h8v2H8v-2zm-2 2h12v4H6v-4z" />
  </svg>
);

/**
 * PixelFileText Icon
 * 
 * A pixel-art style icon representing a text document or file.
 * 
 * @param {Object} props - The properties for the icon.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const PixelFileText = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2h12v4h4v16H4V2zm2 2v16h12V8h-4V4H6zm2 4h6v2H8V8zm0 4h8v2H8v-2zm0 4h8v2H8v-2z" />
  </svg>
);

/**
 * PixelActivity Icon
 * 
 * A pixel-art style icon representing activity, a heartbeat, or a system process.
 * 
 * @param {Object} props - The properties for the icon.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const PixelActivity = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10h4v2h2v-4h2V4h2v4h2v8h2v4h2v-4h2v-2h4v-2h-4v2h-2v4h-2v-4h-2V6h-2V4h-2v4h-2v4H6v-2H2v2z" />
  </svg>
);

/**
 * PixelX Icon
 * 
 * A pixel-art style icon representing a "close" or "cancel" action (an X shape).
 * 
 * @param {Object} props - The properties for the icon.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const PixelX = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h4v4h4v4h4v-4h4V4h4v4h-4v4h-4v4h4v4h4v4h-4v-4h-4v-4h-4v4H8v4H4v-4h4v-4h4v-4H8V8H4V4z" />
  </svg>
);
