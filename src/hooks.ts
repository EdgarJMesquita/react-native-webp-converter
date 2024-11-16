import { useEffect, useState } from 'react';
import * as WebP from 'react-native-webp-converter';

const defaultConfig: WebP.WebPConfig = {
  quality: 80,
  type: WebP.Type.LOSSY,
  preset: WebP.Preset.DEFAULT,
};

/**
 * ### Easily call useConverter for rapid conversion
 * @param inputPathOnMount (optional) Path to the input image for immediate conversion on mount
 * @param configOnMount Configuration settings for WebP conversion
 * @returns `{ uri, error, isLoading, convert }`
 * @deprecated
 * ### Example
 * ```tsx
 * import * as WebP from 'react-native-webp-converter';
 * import { StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
 *
 * export default function App() {
 *    const image = WebP.useConverter('my-local-image.png');
 *
 *    if (image.isLoading) return <ActivityIndicator />;
 *
 *    if (image.error) return <Text>{image.error?.message}</Text>;
 *
 *    return <Image style={StyleSheet.absoluteFill} source={{ uri: image.uri! }} />;
 * }
 * ```
 *
 * or
 *
 * ```tsx
 * import * as WebP from 'react-native-webp-converter';
 * import { StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
 *
 * export default function App() {
 *    const image = WebP.useConverter();
 *
 *    useEffect(()=>{
 *       image.convert('my-local-image.png')
 *    },[])
 *
 *    if (image.isLoading) return <ActivityIndicator />;
 *
 *    if (image.error) return <Text>{image.error?.message}</Text>;
 *
 *    return <Image style={StyleSheet.absoluteFill} source={{ uri: image.uri! }} />;
 * }
 * ```
 */
export function useConverter(
  inputPathOnMount?: string,
  configOnMount = defaultConfig
) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<any>();
  const [isLoading, setLoading] = useState(false);

  /**
   * ### Manually initiate image conversion
   * @param inputPath - Path to the image to convert
   * @param config - Configuration options for WebPConfig conversion
   * @returns `void`
   */
  const convert = async (
    inputPath: string,
    config = defaultConfig
  ): Promise<void> => {
    try {
      if (!inputPath) {
        console.warn('Missing argument for inputPath');
        return;
      }

      setLoading(true);
      const outputPath = inputPath.replace(/\.\w+$/, `-${Date.now()}.webp`);

      await WebP.convertImage(inputPath, outputPath, config);
      setLoading(false);
      setUri(outputPath);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!inputPathOnMount) return;
    convert(inputPathOnMount, {
      quality: configOnMount.quality,
      type: configOnMount.type,
      preset: configOnMount.preset,
    });
  }, [
    inputPathOnMount,
    configOnMount.type,
    configOnMount.quality,
    configOnMount.preset,
  ]);

  useEffect(() => {
    setError(undefined);
  }, [inputPathOnMount]);

  return {
    uri,
    error,
    isLoading,
    convert,
  };
}
