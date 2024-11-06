import { useCallback, useEffect, useState } from 'react';
import * as WebP from 'react-native-webp-converter';

const defaultConfig: WebP.WebpConfig = {
  quality: 80,
  type: WebP.Type.LOSSY,
  preset: WebP.Preset.DEFAULT,
};

/**
 * ### Easily call useConverter for rapid conversion
 * @param inputPath
 * @param config `WebP.WebpConfig`
 */
export function useConverter(
  inputPath: string | undefined | null,
  { quality, type, preset } = defaultConfig
) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<any>();
  const [isLoading, setLoading] = useState(false);

  const convert = useCallback(async () => {
    try {
      if (!inputPath) return;

      setLoading(true);
      const outputPath = inputPath.replace(/\.\w+$/, '.webp');

      await WebP.convertImage(inputPath, outputPath, {
        quality,
        type,
        preset,
      });
      setLoading(false);
      setUri(outputPath);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [inputPath, type, quality, preset]);

  useEffect(() => {
    convert();
  }, [convert]);

  useEffect(() => {
    setError(undefined);
  }, [inputPath]);

  return {
    uri,
    error,
    isLoading,
  };
}
