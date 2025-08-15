
import React from 'react';
import { cn } from '@/lib/utils';

interface LSAIGLogoProps {
  variant?: 'default' | 'terminal';
}

const LSAIGLogo: React.FC<LSAIGLogoProps> = ({ variant = 'default' }) => {
  const isTerminal = variant === 'terminal';

  return (
    <div className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(isTerminal ? 'text-green-500' : 'text-primary')}
      >
        <style>
          {`
            .orbit-lsaig {
              stroke: currentColor;
              stroke-width: 0.85; /* Adjusted for better visibility */
              fill: none;
              transform-origin: 14px 14px; /* Center of the 28x28 viewBox */
              stroke-linecap: round; /* Makes the ends of the dashes rounded */
              stroke-dasharray: 15 41; /* Length of visible dash and gap */
            }
            .nucleus-lsaig {
              fill: currentColor;
            }

            /* Master rotation animation (around the SVG's center point for the orbits) */
            @keyframes rotateOrbitMasterLsaig {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            /* Drawing animation: moves the dash along the path */
            @keyframes drawLineLsaig {
              to { stroke-dashoffset: -56; } /* Animates from initial 0 to -56, making the dash travel one full circumference */
            }

            /* Individual orbit animations */
            .orbit-1-lsaig {
              /* Rotates around the SVG center + draws its line segment */
              animation:
                rotateOrbitMasterLsaig 12s linear infinite, /* Slower rotation */
                drawLineLsaig 2s linear infinite; /* Consistent, slightly slower draw speed */
            }
            .orbit-2-lsaig {
              transform: rotate(60deg); /* Initial static rotation offset */
              /* Rotates around the SVG center + draws its line segment */
              animation:
                rotateOrbitMasterLsaig 10s linear infinite, /* Different speed, same direction */
                drawLineLsaig 2s linear infinite 0.3s; /* Consistent draw speed, slightly delayed */
            }
            .orbit-3-lsaig {
              transform: rotate(120deg); /* Initial static rotation offset */
              /* Rotates around the SVG center + draws its line segment */
              animation:
                rotateOrbitMasterLsaig 15s linear infinite, /* Different speed, same direction */
                drawLineLsaig 2s linear infinite 0.6s; /* Consistent draw speed, more delayed */
            }
          `}
        </style>
        {/* Ellipses are defined, their initial transforms set them apart, and animations handle rotation and drawing */}
        <ellipse className="orbit-lsaig orbit-1-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <ellipse className="orbit-lsaig orbit-2-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <ellipse className="orbit-lsaig orbit-3-lsaig" cx="14" cy="14" rx="12" ry="5"/>
        <circle className="nucleus-lsaig" cx="14" cy="14" r="2.5"/>
      </svg>
      <h1 className={cn(
        "text-2xl font-semibold",
        isTerminal ? 'text-green-500 font-code' : 'text-primary font-headline'
      )}>
        LSAIG
      </h1>
    </div>
  );
};

export default LSAIGLogo;
