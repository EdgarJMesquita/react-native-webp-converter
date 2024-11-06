import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-webp-converter' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const WebpConverterModule = isTurboModuleEnabled
  ? require('./NativeWebpConverter').default
  : NativeModules.WebpConverter;

const WebpConverter = WebpConverterModule
  ? WebpConverterModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

function validateArgs(
  inputPath: string,
  outputPath: string,
  config: WebPConfig
) {
  if (!inputPath) {
    throw new Error(`Incorrect inputPath, received: ${inputPath}`);
  }

  if (!outputPath) {
    throw new Error(`Incorrect outputPath, received: ${outputPath}`);
  }

  if (!config) {
    throw new Error(`Incorrect config, received: ${config}`);
  }

  if (config.type !== 1 && config.type !== 2) {
    throw new Error(`Incorrect config.type, received: ${config.type}`);
  }

  if (
    typeof config.quality !== 'number' ||
    config.quality < 0 ||
    config.quality > 100
  ) {
    throw new Error(`Incorrect config.quality, received: ${config.quality}`);
  }

  if (
    typeof config.preset === 'number' &&
    (config.preset < 0 || config.preset > 5)
  ) {
    throw new Error(`Incorrect config.preset, received: ${config.preset}`);
  }
}

/**
 *
 * @param inputPath string
 * @param outputPath string
 * @param config `WebPConfig`
 * @returns Promise<string>
 *
 * @example
 * ```ts
 * import * as fs from 'react-native-fs';
 * import * as WebP from 'react-native-webp-converter';
 *
 * const inputPath = `${fs.CachesDirectoryPath}/my-image.png`;
 *
 * const outputPath = `${fs.CachesDirectoryPath}/my-image-convertido.webp`;
 *
 * await WebP.convertImage(inputPath, outputPath, {
 *    quality: 80,
 *    type: WebP.Type.LOSSY,
 *    preset: WebP.Preset.PICTURE,
 * });
 * ```
 */
export function convertImage(
  inputPath: string,
  outputPath: string,
  config: WebPConfig
): Promise<string> {
  validateArgs(inputPath, outputPath, config);

  if (!config.preset) {
    config.preset = Preset.DEFAULT;
  }

  return WebpConverter.convertImageToWebp(
    inputPath,
    outputPath,
    config.quality,
    config.type,
    config.preset
  );
}

export { useConverter } from './hooks';

export type WebPConfig = {
  /**
   * Defines the quality level for WebP compression.
   *
   * ### Lossy
   * For lossy WebP compression, `quality` represents the visual quality of the image:
   * - **0**: Compresses for smallest file size, with lowest visual quality.
   * - **100**: Compresses for highest visual quality, with largest file size.
   *
   * ### Lossless
   * For lossless WebP compression, `quality` represents the compression effort:
   * - **0**: Compresses quickly, resulting in a larger file size.
   * - **100**: Compresses with maximum effort, resulting in a smaller file size.
   *
   * > Note: The `quality` value is interpreted based on the compression `type`. For `lossy`, it indicates visual quality; for `lossless`, it indicates compression efficiency.
   */
  quality: number;

  /**
   * Sets the WebP compression type.
   * - `WebP.Type.LOSSY`: Lossy compression.
   * - `WebP.Type.LOSSLESS`: Lossless compression.
   */
  type: Type;

  /**
   * iOS only.
   * Sets a preset to adjust compression settings based on different image types.
   * - `WebP.Preset.DEFAULT`: Default preset.
   * - `WebP.Preset.PICTURE`: For photos, such as portraits or indoor shots.
   * - `WebP.Preset.PHOTO`: For outdoor photographs with natural lighting.
   * - `WebP.Preset.DRAWING`: For drawings or line art with high-contrast details.
   * - `WebP.Preset.ICON`: For small, colorful images like icons.
   * - `WebP.Preset.TEXT`: For text-like images.
   *
   * @default WebP.Preset.DEFAULT
   */
  preset?: Preset;
};

export enum Type {
  LOSSY = 1,
  LOSSLESS = 2,
}

export enum Preset {
  /**
   * @description default preset
   */
  DEFAULT = 0,
  /**
   * @description digital picture, like portrait, inner shot
   */
  PICTURE = 1,
  /**
   * @description outdoor photograph, with natural lighting
   */
  PHOTO = 2,
  /**
   * @description hand or line drawing, with high-contrast details
   */
  DRAWING = 3,
  /**
   * @description small-sized colorful images
   */

  ICON = 4,
  /**
   * @description text-like
   */
  TEXT = 5,
}
