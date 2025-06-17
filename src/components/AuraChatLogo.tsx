import React from 'react';

const LSAIGLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary" // This ensures currentColor is applied from parent
      >
        <style>
          {`
            .orbit-lsaig {
              stroke: currentColor;
              stroke-width: 0.85; /* Adjusted for better visibility */
              fill: none;
              transform-origin: 14px 14px; /* Center of the 28x28 viewBox */
            }
            .nucleus-lsaig {
              fill: currentColor;
            }
            @keyframes rotateOrbitLsaig {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            /* Applied to the ellipse elements themselves */
            .orbit-1-lsaig {
              animation: rotateOrbitLsaig 10s linear infinite;
            }
            .orbit-2-lsaig {
              transform: rotate(60deg); /* Initial static rotation */
              animation: rotateOrbitLsaig 8s linear infinite reverse; /* Rotates around its own center */
            }
            .orbit-3-lsaig {
              transform: rotate(120deg); /* Initial static rotation */
              animation: rotateOrbitLsaig 12s linear infinite; /* Rotates around its own center */
            }
          `}
        </style>
        {/* Ellipses are drawn then transformed */}
        <ellipse className="orbit-lsaig orbit-1-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <ellipse className="orbit-lsaig orbit-2-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <ellipse className="orbit-lsaig orbit-3-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <circle className="nucleus-lsaig" cx="14" cy="14" r="2.5"/>
      </svg>
      <h1 className="text-2xl font-semibold text-primary font-headline">LSAIG</h1>
    </div>
  );
};

export default LSAIGLogo;
