import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 48 : 42;

  return (
    <div className="flex items-center gap-3">
      {/* Brand Icon matching DigiSathi / Clarify Care mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 shadow-xs"
        aria-hidden="true"
      >
        {/* Deep Evergreen Squircle Background */}
        <rect width="64" height="64" rx="18" fill="#1E3A34" />
        {/* Cream Concentric Arc */}
        <path
          d="M48 32C48 23.1634 40.8366 16 32 16C23.1634 16 16 23.1634 16 32C16 37.8927 19.1866 43.0416 24 45.7944"
          stroke="#EFEEEA"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Warm Ochre Focus Center Disc */}
        <circle cx="32" cy="32" r="7.5" fill="#C05621" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1E3A34]">
              DigiSathi
            </span>
            <span className="text-[12px] font-bold tracking-wider text-[#C05621] uppercase">
              Care
            </span>
          </div>
          <span className="text-[13px] font-medium text-[#414846] hidden sm:inline-block -mt-1">
            Calm document support for seniors & families
          </span>
        </div>
      )}
    </div>
  );
};
