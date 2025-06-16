import React from 'react';

const LSAIGLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 16.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
        <path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
      </svg>
      <h1 className="text-2xl font-semibold text-primary font-headline">LSAIG</h1>
    </div>
  );
};

export default LSAIGLogo;
