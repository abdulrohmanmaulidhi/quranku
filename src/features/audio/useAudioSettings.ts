import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import { DEFAULT_RECITER_ID, isReciterId, type ReciterId } from "./reciters";
import {
  AUDIO_RATES,
  REPEAT_MODES,
  isAudioRate,
  isRepeatMode,
  type AudioRate,
  type RepeatMode,
} from "./playback";

export const RECITER_SETTING_KEY = "audio.reciter";
export const RATE_SETTING_KEY = "audio.rate";
export const REPEAT_SETTING_KEY = "audio.repeat";

export { AUDIO_RATES, REPEAT_MODES };

function useStoredValue<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): [T, (next: T) => void] {
  const [optimistic, setOptimistic] = useState<T | null>(null);

  const row = useLiveQuery(async () => {
    try {
      return await db.settings.get(key);
    } catch {
      return undefined;
    }
  }, [key]);

  const storedValue = row?.value;
  const stored = isValid(storedValue) ? storedValue : fallback;
  const value = optimistic ?? stored;

  const write = useCallback(
    (next: T) => {
      if (!isValid(next)) return;
      setOptimistic(next);
      void db.settings
        .put({ key, value: next })
        .then(() => setOptimistic(null))
        .catch(() => setOptimistic(null));
    },
    [isValid, key],
  );

  return [value, write];
}

export interface AudioSettings {
  reciterId: ReciterId;
  setReciterId: (id: string) => void;
  rate: AudioRate;
  setRate: (rate: AudioRate) => void;
  repeat: RepeatMode;
  setRepeat: (repeat: RepeatMode) => void;
}

export function useAudioSettings(): AudioSettings {
  const [reciterId, writeReciter] = useStoredValue<ReciterId>(
    RECITER_SETTING_KEY,
    DEFAULT_RECITER_ID,
    isReciterId,
  );
  const [rate, setRate] = useStoredValue<AudioRate>(RATE_SETTING_KEY, 1, isAudioRate);
  const [repeat, setRepeat] = useStoredValue<RepeatMode>(REPEAT_SETTING_KEY, "off", isRepeatMode);

  const setReciterId = useCallback(
    (id: string) => {
      if (isReciterId(id)) writeReciter(id);
    },
    [writeReciter],
  );

  return { reciterId, setReciterId, rate, setRate, repeat, setRepeat };
}
