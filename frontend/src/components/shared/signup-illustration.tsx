"use client";

import "./signup-illustration.css";

export default function SignupIllustration() {
  return (
    <div className="illustration-container">
      <svg viewBox="0 0 680 900" xmlns="http://www.w3.org/2000/svg">
        <g className="layer-bg">
          <rect x="0" y="0" width="680" height="900" fill="#222222" />
        </g>

        <g className="layer-grid" opacity="0.3">
          <line x1="40" y1="120" x2="640" y2="120" stroke="#333333" strokeWidth="0.5" />
          <line x1="40" y1="240" x2="640" y2="240" stroke="#333333" strokeWidth="0.5" />
          <line x1="40" y1="360" x2="640" y2="360" stroke="#333333" strokeWidth="0.5" />
          <line x1="40" y1="480" x2="640" y2="480" stroke="#333333" strokeWidth="0.5" />
          <line x1="40" y1="600" x2="640" y2="600" stroke="#333333" strokeWidth="0.5" />
          <line x1="40" y1="720" x2="640" y2="720" stroke="#333333" strokeWidth="0.5" />
        </g>

        <g className="layer-dots" opacity="0.12">
          <circle cx="120" cy="160" r="3" fill="#2EC4B6" />
          <circle cx="200" cy="310" r="2.5" fill="#E8A838" />
          <circle cx="520" cy="200" r="3.5" fill="#2EC4B6" />
          <circle cx="560" cy="440" r="2" fill="#E8A838" />
          <circle cx="100" cy="520" r="3" fill="#E8A838" />
          <circle cx="580" cy="650" r="2.5" fill="#2EC4B6" />
          <circle cx="160" cy="700" r="2" fill="#2EC4B6" />
          <circle cx="480" cy="130" r="2" fill="#E8A838" />
        </g>

        <path
          className="layer-curves"
          d="M80 700 Q160 680 200 620 Q240 560 300 520 Q360 480 400 400 Q440 320 500 260 Q560 200 600 160"
          fill="none"
          stroke="#2EC4B6"
          strokeWidth="2.5"
          opacity="0.15"
        />
        <path
          className="layer-curves-delayed"
          d="M100 720 Q180 690 230 640 Q280 590 340 540 Q400 490 440 410 Q480 330 530 270 Q580 210 620 170"
          fill="none"
          stroke="#E8A838"
          strokeWidth="2"
          opacity="0.2"
        />

        {/* Progress arcs around coach */}
        <g className="layer-arcs">
          {/* Strength arc — top left */}
          <path
            d="M272 290 A75 75 0 0 1 340 235"
            fill="none"
            stroke="#2EC4B6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Consistency arc — top right */}
          <path
            d="M340 235 A75 75 0 0 1 408 290"
            fill="none"
            stroke="#E8A838"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Volume arc — bottom */}
          <path
            d="M280 360 A75 75 0 0 1 400 360"
            fill="none"
            stroke="#2EC4B6"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.25"
          />
        </g>

        {/* Milestone dots along progress curves */}
        <g className="layer-milestones">
          <circle className="milestone-1" cx="200" cy="620" r="5" fill="#2EC4B6" opacity="0.5" />
          <circle className="milestone-2" cx="300" cy="520" r="5" fill="#2EC4B6" opacity="0.6" />
          <circle className="milestone-3" cx="400" cy="400" r="6" fill="#E8A838" opacity="0.5" />
          <circle className="milestone-4" cx="500" cy="260" r="5" fill="#E8A838" opacity="0.6" />
          <circle className="milestone-5" cx="600" cy="160" r="7" fill="#2EC4B6" opacity="0.7" />
          {/* Star at the top milestone — goal reached */}
          <text x="600" y="140" textAnchor="middle" fontSize="14" fill="#E8A838" opacity="0.6">&#x2605;</text>
        </g>

        <g className="layer-glow1">
          <circle className="glow-outer" cx="340" cy="380" r="260" fill="#E8A838" opacity="0.06" />
          <circle className="glow-inner" cx="340" cy="380" r="180" fill="#E8A838" opacity="0.06" />
        </g>

        <g className="layer-coach">
          <circle cx="340" cy="310" r="68" fill="#1a1a1a" opacity="0.7" />
          <circle cx="340" cy="310" r="68" fill="none" stroke="#E8A838" strokeWidth="1.5" opacity="0.5" />
          <circle cx="340" cy="286" r="14" fill="none" stroke="#E8A838" strokeWidth="2" />
          <path d="M318 338 Q318 314 340 310 Q362 314 362 338" fill="none" stroke="#E8A838" strokeWidth="2" />
          <line x1="328" y1="262" x2="340" y2="252" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="340" y1="262" x2="340" y2="248" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="352" y1="262" x2="340" y2="252" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g className="icon-float1">
          <g transform="translate(150, 440)">
            <rect x="-24" y="-24" width="48" height="48" rx="12" fill="#1a1a1a" />
            <path d="M-8 4 L0 -10 L8 4" fill="none" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="0" y1="-8" x2="0" y2="10" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        <g className="icon-float2">
          <g transform="translate(530, 440)">
            <rect x="-24" y="-24" width="48" height="48" rx="12" fill="#1a1a1a" />
            <circle cx="0" cy="-2" r="10" fill="none" stroke="#2EC4B6" strokeWidth="2" />
            <polyline points="-4,-2 -1,2 6,-6" fill="none" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>

        <g className="icon-float3">
          <g transform="translate(340, 540)">
            <rect x="-24" y="-24" width="48" height="48" rx="12" fill="#1a1a1a" />
            <path d="M-8 6 L-8 -6 L8 -6 L8 6 M-12 6 L12 6" fill="none" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#2EC4B6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-4" y1="2" x2="2" y2="2" stroke="#2EC4B6" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>

        <g className="layer-dashes" opacity="0.4">
          <line x1="220" y1="415" x2="290" y2="350" stroke="#333333" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1="460" y1="415" x2="390" y2="350" stroke="#333333" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1="340" y1="516" x2="340" y2="400" stroke="#333333" strokeWidth="0.5" strokeDasharray="4 3" />
        </g>

        <g className="layer-brand">
          <text x="340" y="660" textAnchor="middle" fontFamily="'DM Serif Display', Georgia, serif" fontSize="38" fontWeight="400" letterSpacing="1" fill="#FFFFFF">PRIME COACH</text>
        </g>

        <g className="layer-tagline">
          <text x="340" y="695" textAnchor="middle" fontFamily="'Manrope', 'Segoe UI', sans-serif" fontSize="13" letterSpacing="4" fill="#C5D0E6">ELEVATE YOUR POTENTIAL</text>
        </g>

        <g className="layer-divider" opacity="0.25">
          <line x1="160" y1="728" x2="280" y2="728" stroke="#E8A838" strokeWidth="0.7" />
          <circle cx="290" cy="728" r="2" fill="#E8A838" />
          <circle cx="390" cy="728" r="2" fill="#E8A838" />
          <line x1="400" y1="728" x2="520" y2="728" stroke="#E8A838" strokeWidth="0.7" />
          <text x="340" y="732" textAnchor="middle" fontFamily="'Manrope', sans-serif" fontSize="11" fill="#E8A838">&#x2726;</text>
        </g>

        <g className="layer-cta" opacity="0.5">
          <rect x="215" y="760" width="250" height="44" rx="22" fill="none" stroke="#E8A838" strokeWidth="1.2" />
          <text x="340" y="787" textAnchor="middle" fontFamily="'Manrope', 'Segoe UI', sans-serif" fontSize="13" fontWeight="500" letterSpacing="2" fill="#E8A838">BEGIN YOUR JOURNEY</text>
        </g>

      </svg>
    </div>
  );
}
