import React from 'react';
import { KEYWORD_REGEX_PATTERN } from '../../utils/keywordUtils';

interface KeywordHighlighterProps {
  text: string | null | undefined;
}

export const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({ text }) => {
  if (text === null || text === undefined || text === '') {
    return <span className="text-slate-400 dark:text-slate-600">—</span>;
  }

  const str = String(text);
  const matchRegex = new RegExp(`(${KEYWORD_REGEX_PATTERN})`, 'i');
  if (!matchRegex.test(str)) {
    return <span>{str}</span>;
  }

  const splitRegex = new RegExp(`(${KEYWORD_REGEX_PATTERN})`, 'gi');
  const testSingle = new RegExp(`^(${KEYWORD_REGEX_PATTERN})$`, 'i');
  const parts = str.split(splitRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (testSingle.test(part)) {
          return (
            <mark
              key={i}
              className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold px-0.5 rounded-xs"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default KeywordHighlighter;
