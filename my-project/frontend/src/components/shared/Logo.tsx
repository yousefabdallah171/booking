"use client";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 220, height = 52 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 52"
      width={width}
      height={height}
      className={className}
      aria-label="Yousef Abdallah"
      role="img"
    >
      {/* Mark: bordered square with YA — always brand green */}
      <rect
        x="0" y="6" width="40" height="40" rx="10" ry="10"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <text
        x="20" y="33"
        fontFamily="Syne, var(--font-display), sans-serif"
        fontWeight="800"
        fontSize="16"
        fill="var(--color-brand)"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        YA
      </text>

      {/* Wordmark: adapts to theme */}
      <text
        x="52" y="30"
        fontFamily="Syne, var(--font-display), sans-serif"
        fontWeight="800"
        fontSize="20"
        fill="currentColor"
        textAnchor="start"
        letterSpacing="-0.5"
      >
        Yousef
      </text>

      {/* Subtext: muted */}
      <text
        x="53" y="43"
        fontFamily="Syne, var(--font-display), sans-serif"
        fontWeight="700"
        fontSize="10"
        fill="currentColor"
        opacity="0.38"
        textAnchor="start"
        letterSpacing="2"
      >
        ABDALLAH
      </text>
    </svg>
  );
}
