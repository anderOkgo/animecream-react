import { useState, useCallback } from 'react';

/**
 * Custom hook for text-to-speech functionality
 * Supports multiple languages and provides toggle functionality
 *
 * Based on the original CakePHP implementation found in animecream.js:
 * - Uses SpeechSynthesisUtterance API
 * - Supports language detection (es-ES, en-US)
 * - Provides toggle functionality to start/stop speech
 * - Handles speech synthesis errors gracefully
 */
export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const speak = useCallback(
    (text, language = 'es-ES') => {
      // Stop any current speech
      if (currentUtterance) {
        window.speechSynthesis.cancel();
        setCurrentUtterance(null);
        setIsSpeaking(false);
      }

      if (!text || text.trim() === '') {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentUtterance(utterance);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    },
    [currentUtterance]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  }, []);

  const toggle = useCallback(
    (text, language = 'es-ES') => {
      if (isSpeaking) {
        stop();
      } else {
        speak(text, language);
      }
    },
    [isSpeaking, speak, stop]
  );

  return {
    isSpeaking,
    speak,
    stop,
    toggle,
  };
};
