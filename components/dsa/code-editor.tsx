'use client';

import React, { useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  onSubmit,
  disabled = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = lines.length;

  // Synchronize scroll between textarea and line gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter -> Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onRun();
      return;
    }

    // Ctrl+Shift+Enter or Cmd+Shift+Enter -> Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onSubmit();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value: currentVal } = textarea;

    // Tab key: Indent 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        const updated =
          currentVal.substring(0, selectionStart) +
          '    ' +
          currentVal.substring(selectionEnd);
        onChange(updated);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
        });
      } else {
        // Shift+Tab: Unindent
        const linesBefore = currentVal.substring(0, selectionStart).split('\n');
        const currentLine = linesBefore[linesBefore.length - 1];
        if (currentLine.startsWith('    ')) {
          const lineStartIdx = selectionStart - currentLine.length;
          const updated =
            currentVal.substring(0, lineStartIdx) +
            currentLine.substring(4) +
            currentVal.substring(selectionStart);
          onChange(updated);
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(
              lineStartIdx,
              selectionStart - 4
            );
          });
        }
      }
      return;
    }

    // Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault();
      const closeChar = pairs[e.key];
      const updated =
        currentVal.substring(0, selectionStart) +
        e.key +
        closeChar +
        currentVal.substring(selectionEnd);
      onChange(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      });
      return;
    }
  };

  return (
    <div className="relative flex-1 flex min-h-0 bg-[#0F172A] text-slate-100 overflow-hidden font-mono text-xs sm:text-sm">
      {/* Line Numbers Gutter */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="w-10 sm:w-12 py-3 pr-2 text-right text-slate-500 bg-[#0B1120] select-none overflow-hidden shrink-0 border-r border-slate-800/80 font-mono text-xs leading-6"
      >
        {Array.from({ length: Math.max(lineCount, 15) }).map((_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Lightweight Monospace Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="flex-1 w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-blue-600/40 whitespace-pre overflow-x-auto disabled:opacity-60"
        placeholder="// Write your solution here..."
        aria-label="Code editor"
      />
    </div>
  );
}
