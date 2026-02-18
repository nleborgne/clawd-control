"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

type VoiceInputProps = {
  onResult: (value: string) => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

export function VoiceInput({ onResult }: VoiceInputProps) {
  function handleClick() {
    const ctor =
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition ??
      (window as Window & { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition;

    if (!ctor) {
      return;
    }

    const recognition = new ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
    };
    recognition.start();
  }

  return (
    <Button size="icon" variant="ghost" onClick={handleClick}>
      <Mic className="h-4 w-4" />
    </Button>
  );
}
