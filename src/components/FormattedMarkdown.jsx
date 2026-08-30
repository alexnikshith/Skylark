import React from 'react';

/**
 * Lightweight, robust Markdown renderer for formatting Agent responses cleanly.
 * Converts headings, bold text, bullet lists, blockquotes, and code tags into rich styled JSX elements.
 */
export default function FormattedMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="space-y-1.5 my-2 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start text-xs text-slate-200 leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5 mr-2 shadow-sm shadow-cyan-400"></span>
              <div>{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(index);
      return;
    }

    // Headings H3 (###)
    if (trimmed.startsWith('### ')) {
      flushList(index);
      const text = trimmed.replace('### ', '');
      elements.push(
        <h3 key={index} className="text-base font-extrabold text-white tracking-tight mt-4 mb-2 flex items-center gap-2 border-b border-slate-800 pb-1.5">
          {renderInline(text)}
        </h3>
      );
      return;
    }

    // Headings H4 (####)
    if (trimmed.startsWith('#### ')) {
      flushList(index);
      const text = trimmed.replace('#### ', '');
      elements.push(
        <h4 key={index} className="text-xs font-bold uppercase tracking-wider text-cyan-400 mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInline(text)}
        </h4>
      );
      return;
    }

    // Blockquotes (>)
    if (trimmed.startsWith('> ')) {
      flushList(index);
      const text = trimmed.replace('> ', '');
      elements.push(
        <div key={index} className="my-3 p-3.5 bg-gradient-to-r from-blue-950/40 to-slate-900 border-l-4 border-cyan-400 rounded-r-xl text-xs text-slate-200 italic shadow-sm">
          {renderInline(text)}
        </div>
      );
      return;
    }

    // Bullet Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    }

    // Regular paragraphs
    flushList(index);
    elements.push(
      <p key={index} className="text-xs text-slate-300 leading-relaxed my-1.5">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList('end');

  return <div className="space-y-1">{elements}</div>;
}

// Inline formatting parser: **bold**, *italic*, `code`
function renderInline(text) {
  if (!text) return '';

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Code `text`
    const codeMatch = remaining.match(/`(.*?)`/);

    let firstMatch = null;
    let type = null;

    if (boldMatch && (!codeMatch || boldMatch.index < codeMatch.index)) {
      firstMatch = boldMatch;
      type = 'bold';
    } else if (codeMatch) {
      firstMatch = codeMatch;
      type = 'code';
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    const index = firstMatch.index;
    if (index > 0) {
      parts.push(remaining.substring(0, index));
    }

    if (type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {firstMatch[1]}
        </strong>
      );
    } else if (type === 'code') {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-mono border border-slate-700">
          {firstMatch[1]}
        </code>
      );
    }

    remaining = remaining.substring(index + firstMatch[0].length);
  }

  return parts;
}
