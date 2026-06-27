import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {text}
    </div>
  );
}
