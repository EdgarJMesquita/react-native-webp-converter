import * as WebP from 'react-native-webp-converter';

type Sample = {
  imagePng: string;
  imageWebp: string;
  economy: string;
  quality: number;
  type: WebP.Type;
  imagePngSize: string;
  imageWebpSize: string;
  preset: WebP.Preset;
};

type Config = Pick<Sample, 'quality' | 'type' | 'preset'>;
