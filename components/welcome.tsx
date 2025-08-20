'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

/** ✅ Export the props type so app.tsx can import it */
export interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
  language: 'en' | 'kn' | 'hi';
  onLanguageChange: (lang: 'en' | 'kn' | 'hi') => void;
}

/** Optional: include native <div> props (className, etc) */
export type WelcomeComponentProps = React.ComponentPropsWithoutRef<'div'> & WelcomeProps;

/** ✅ Use forwardRef instead of reading `ref` from props */
export const Welcome = React.forwardRef<HTMLDivElement, WelcomeComponentProps>(
  ({ disabled, startButtonText, onStartCall, language, onLanguageChange, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        inert={disabled}
        className={`fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center ${className ?? ''}`}
        {...rest}
      >
        <img
          src="/bosch_logo_embedded.svg"
          alt="Bosch Logo"
          width={180}
          height={180}
          className="mb-4"
        />

        <img src="/allion_img.png" alt="Allion Logo" width={250} height={200} className="mb-4" />

        <p className="text-fg1 max-w-prose pt-1 leading-6 font-medium">
          Chat live with your voice AI agent
        </p>

        {/* Language selection */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => onLanguageChange('en')}
            className={`px-4 py-2 ${
              language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            English
          </Button>
          <Button
            onClick={() => onLanguageChange('kn')}
            className={`px-4 py-2 ${
              language === 'kn' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            ಕನ್ನಡ
          </Button>
          <Button
            onClick={() => onLanguageChange('hi')}
            className={`px-4 py-2 ${
              language === 'hi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            हिंदी
          </Button>
        </div>

        <Button variant="primary" size="lg" onClick={onStartCall} className="mt-6 w-64 font-mono">
          {startButtonText}
        </Button>

        <p className="text-fg1 fixed bottom-5 left-1/2 w-full max-w-prose -translate-x-1/2 pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            Voice AI quickstart
          </a>
          .
        </p>
      </div>
    );
  }
);
Welcome.displayName = 'Welcome';
