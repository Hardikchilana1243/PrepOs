import React from 'react';

interface ProblemDescriptionProps {
  statement: string;
}

export function ProblemDescription({ statement }: ProblemDescriptionProps) {
  // Split into paragraphs by double newlines or clean lines
  const paragraphs = statement
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Helper to highlight backticked inline code snippets cleanly
  const renderFormattedText = (text: string) => {
    // Regex splits by backticks: `code`
    const parts = text.split(/`([^`]+)`/g);
    return parts.map((part, index) => {
      // Odd indices are the captured inline code segments
      if (index % 2 === 1) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200/60 font-semibold"
          >
            {part}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-slate-800">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="whitespace-pre-line">
          {renderFormattedText(p)}
        </p>
      ))}
    </div>
  );
}
