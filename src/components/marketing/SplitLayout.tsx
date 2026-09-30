import React from 'react';

interface SplitLayoutProps {
  formSide?: 'left' | 'right';
  aside: React.ReactNode;
  children: React.ReactNode;
}

export function SplitLayout({ formSide = 'right', aside, children }: SplitLayoutProps) {
  const isFormLeft = formSide === 'left';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-bg text-text">
      {/* Tool Panel (aside) */}
      <div
        className={`w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 ${
          isFormLeft ? 'lg:order-2 lg:border-l-2' : 'lg:order-1 lg:border-r-2'
        } border-border`}
        style={{ backgroundColor: 'var(--color-sheet)' }}
      >
        <div className="my-auto w-full flex flex-col justify-center">
          {aside}
        </div>
      </div>

      {/* Form Panel (children) */}
      <div
        className={`w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 ${
          isFormLeft ? 'lg:order-1' : 'lg:order-2'
        }`}
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-[420px] my-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
