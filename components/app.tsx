'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { Toaster } from 'sonner';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { SessionView } from '@/components/session-view';
import { Welcome } from '@/components/welcome';
import useConnectionDetails from '@/hooks/useConnectionDetails';
import type { AppConfig } from '@/lib/types';

// Only motion-wrap Welcome (or even skip it if you like)
// If you keep it, you can let Motion infer props.
const MotionWelcome = motion.create(Welcome);

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const room = useMemo(() => new Room(), []);
  const [sessionStarted, setSessionStarted] = useState(false);

  const [language, setLanguage] = useState<'en' | 'kn' | 'hi'>('en');

  const handleLanguageChange = (lang: 'en' | 'kn' | 'hi') => {
    setLanguage(lang);
    if (room.state === 'connected') {
      try {
        room.localParticipant.setMetadata(JSON.stringify({ language: lang }));
      } catch (e) {
        console.warn('setMetadata failed:', e);
      }
    }
  };

  const { fetchConnectionDetails } = useConnectionDetails();

  useEffect(() => {
    const onDisconnected = () => setSessionStarted(false);
    const onMediaDevicesError = (error: Error) => {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room]);

  useEffect(() => {
    let aborted = false;
    if (sessionStarted && room.state === 'disconnected') {
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: appConfig.isPreConnectBufferEnabled,
        }),
        fetchConnectionDetails().then(async (connectionDetails) => {
          await room.connect(connectionDetails.serverUrl, connectionDetails.participantToken);
          try {
            room.localParticipant.setMetadata(JSON.stringify({ language }));
          } catch (e) {
            console.warn('setMetadata (post-connect) failed:', e);
          }
        }),
      ]).catch((error) => {
        if (aborted) return;
        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
    return () => {
      aborted = true;
      room.disconnect();
    };
  }, [room, sessionStarted, fetchConnectionDetails, appConfig.isPreConnectBufferEnabled, language]);

  const { startButtonText } = appConfig;

  return (
    <>
      <MotionWelcome
        key="welcome"
        startButtonText={startButtonText}
        onStartCall={() => setSessionStarted(true)}
        disabled={sessionStarted}
        language={language}
        onLanguageChange={handleLanguageChange}
        initial={{ opacity: 0 }}
        animate={{ opacity: sessionStarted ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'linear', delay: sessionStarted ? 0 : 0.5 }}
      />

      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />

        {/* ✅ Wrap the custom component in a motion.div container */}
        <motion.div
          key="session-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: sessionStarted ? 1 : 0 }}
          transition={{ duration: 0.5, ease: 'linear', delay: sessionStarted ? 0.5 : 0 }}
        >
          <SessionView
            appConfig={appConfig}
            disabled={!sessionStarted}
            sessionStarted={sessionStarted}
            language={language}
          />
        </motion.div>
      </RoomContext.Provider>

      <Toaster />
    </>
  );
}
