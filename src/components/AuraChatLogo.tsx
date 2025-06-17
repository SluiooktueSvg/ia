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
              stroke-linecap: round; /* Makes the ends of the dashes rounded */
              /* Approximate perimeter for rx=12, ry=5 is ~56.
                 A dash of 10px and a gap of 46px (total 56px pattern)
                 will show a 10px line segment moving.
              */
              stroke-dasharray: 10 46;
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
                rotateOrbitMasterLsaig 10s linear infinite,
                drawLineLsaig 1.5s linear infinite;
            }
            .orbit-2-lsaig {
              transform: rotate(60deg); /* Initial static rotation offset */
              /* Rotates around the SVG center (respecting initial transform) + draws its line segment */
              animation:
                rotateOrbitMasterLsaig 8s linear infinite reverse, /* Different speed/direction */
                drawLineLsaig 1.2s linear infinite 0.2s; /* Different speed/delay for drawing */
            }
            .orbit-3-lsaig {
              transform: rotate(120deg); /* Initial static rotation offset */
              /* Rotates around the SVG center (respecting initial transform) + draws its line segment */
              animation:
                rotateOrbitMasterLsaig 12s linear infinite, /* Different speed */
                drawLineLsaig 1.8s linear infinite 0.4s; /* Different speed/delay for drawing */
            }
          `}
        </style>
        {/* Ellipses are defined, their initial transforms set them apart, and animations handle rotation and drawing */}
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
