'use client'

import React from 'react';

const TennisCourtAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-full max-w-md">
        {/* Tennis Court */}
        <svg
          viewBox="0 0 400 200"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Court Background */}
          <rect x="20" y="20" width="360" height="160" fill="#4a7c59" stroke="#fff" strokeWidth="2" />

          {/* Center Line */}
          <line x1="200" y1="20" x2="200" y2="180" stroke="#fff" strokeWidth="2" />

          {/* Service Boxes */}
          <line x1="20" y1="100" x2="380" y2="100" stroke="#fff" strokeWidth="2" />
          <line x1="110" y1="20" x2="110" y2="180" stroke="#fff" strokeWidth="2" />
          <line x1="290" y1="20" x2="290" y2="180" stroke="#fff" strokeWidth="2" />

          {/* Net */}
          <line x1="200" y1="10" x2="200" y2="30" stroke="#333" strokeWidth="3" />
          <line x1="200" y1="170" x2="200" y2="190" stroke="#333" strokeWidth="3" />
          <rect x="198" y="30" width="4" height="140" fill="#333" opacity="0.6" />

          {/* Net mesh pattern */}
          <g opacity="0.3">
            {[...Array(14)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="198"
                y1={30 + i * 10}
                x2="202"
                y2={30 + i * 10}
                stroke="#333"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Animated Tennis Ball */}
          <circle r="6" fill="#d4ff00" stroke="#333" strokeWidth="1">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path="M 80,100 Q 150,60 200,100 T 320,100"
            />
          </circle>

          {/* Ball shadow */}
          <ellipse rx="8" ry="3" fill="#000" opacity="0.2">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path="M 80,165 L 200,165 L 320,165"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Players (simplified) */}
          {/* Left Player */}
          <g>
            <ellipse cx="60" cy="175" rx="8" ry="4" fill="#000" opacity="0.2" />
            <circle cx="60" cy="160" r="8" fill="#ff6b35" />
            <rect x="56" y="168" width="8" height="12" fill="#ff6b35" />
          </g>

          {/* Right Player */}
          <g>
            <ellipse cx="340" cy="175" rx="8" ry="4" fill="#000" opacity="0.2" />
            <circle cx="340" cy="160" r="8" fill="#ff6b35" />
            <rect x="336" y="168" width="8" height="12" fill="#ff6b35" />
          </g>
        </svg>

        {/* Loading Text */}
        <div className="text-center mt-6">
          <p className="text-lg font-bold text-gray-700 uppercase tracking-wide">
            Analyse en cours
          </p>
          <div className="flex justify-center items-center space-x-1 mt-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TennisCourtAnimation;
