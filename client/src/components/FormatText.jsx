import React from 'react';

/**
 * FormattedText Component
 * Parses a string containing bullet points denoted by '-' and renders it with proper HTML elements.
 *
 * @param {string} text - The raw text to format.
 * @returns {React.Element} - The formatted React elements.
 */
const FormatText = ({ text }) => {
  if (!text) return null;

  // Split the text into lines and trim each line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements = [];
  let currentList = [];
  let startIndex = 0;

  lines.forEach((line, index) => {
    if (line.startsWith('-')) {
      // If the line starts with '-', it's a list item
      currentList.push(line.slice(1).trim());
    } else {
      // If there's an ongoing list, decide how to render it
      if (currentList.length > 0) {
        if (currentList.length === 1) {
          // Single list item rendered as a paragraph
          elements.push(
            <p key={`p-${startIndex}`} className="mb-2">
              {currentList[0]}
            </p>
          );
        } else {
          // Multiple list items rendered as an unordered list
          elements.push(
            <ul key={`list-${startIndex}`} className="list-disc pl-5 mb-2">
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
      }

      // Render the current line as a paragraph
      elements.push(
        <p key={`p-${index}`} className="mb-2 font-semibold">
          {line}
        </p>
      );
    }
    startIndex = index;
  });

  // Handle any remaining list items after processing all lines
  if (currentList.length > 0) {
    if (currentList.length === 1) {
      elements.push(
        <p key={`p-end`} className="mb-2">
          {currentList[0]}
        </p>
      );
    } else {
      elements.push(
        <ul key={`list-end`} className="list-disc pl-5 mb-2">
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
  }

  return <div>{elements}</div>;
};

export default FormatText;
