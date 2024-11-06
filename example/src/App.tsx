import { useEffect, useState } from 'react';
import {
  Text,
  ScrollView,
  View,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';

import * as fs from 'react-native-fs';
import * as WebP from 'react-native-webp-converter';
import { styles } from './styles';
import type { Config, Sample } from './types';
import { extractFileName, formatBytes, mapEnumToName } from './utils';
import { initialSamples } from './constants';

export default function App() {
  const [samples, setSamples] = useState<Sample[]>([]);

  async function convert(
    config: Config,
    index: number
  ): Promise<Sample | null> {
    try {
      const toFile = `${fs.CachesDirectoryPath}/original-${index + 1}.png`;

      await fs.downloadFile({
        fromUrl: 'https://github.com/EdgarJMesquita.png',
        toFile,
      }).promise;

      const outputPath = `${fs.CachesDirectoryPath}/converted-${index + 1}.webp`;

      await WebP.convertImage(toFile, outputPath, {
        quality: config.quality,
        type: config.type,
        preset: config.preset,
      });

      console.log('Success! outputPath: ', outputPath);

      const pngStat = await fs.stat(toFile);
      const webpStat = await fs.stat(outputPath);

      const economy = `Economy: ${formatBytes(
        pngStat.size - webpStat.size
      )} or ${Math.floor(100 - (webpStat.size / pngStat.size) * 100)}% smaller`;

      return {
        quality: config.quality,
        type: config.type,
        economy,
        imagePng: toFile,
        imageWebp: outputPath,
        imagePngSize: formatBytes(pngStat.size),
        imageWebpSize: formatBytes(webpStat.size),
        preset: config.preset,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  useEffect(() => {
    (async () => {
      for (let i = 0; i < initialSamples.length; i++) {
        const sample = await convert(initialSamples[i]!, i);
        if (sample) {
          setSamples((state) => [...state, sample]);
        }
      }
    })();
  }, []);

  const height = Dimensions.get('window').height / 2;
  const width = Dimensions.get('window').width * 0.95;

  if (!samples.length) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      {samples.map((sample, index) => (
        <View style={{ width }} key={index}>
          <ImageBackground
            source={{ uri: `file://${sample.imagePng}` }}
            style={[{ height }, styles.imageContainer]}
            resizeMode="cover"
          >
            <View style={styles.container2}>
              <Text style={styles.text}>
                Name: {extractFileName(sample.imagePng)}
              </Text>
              <Text style={styles.text}>Size: {sample.imagePngSize}</Text>
            </View>
          </ImageBackground>

          <ImageBackground
            source={{ uri: `file://${sample.imageWebp}` }}
            style={[{ height }, styles.imageContainer]}
            resizeMode="cover"
          >
            <View style={styles.container2}>
              <Text style={styles.text}>
                Name: {extractFileName(sample.imageWebp)}
              </Text>
              <Text style={styles.text}>Size: {sample.imageWebpSize}</Text>
              <Text style={styles.text}>{sample.economy}</Text>
              <Text style={styles.text}>Quality: {sample.quality}%</Text>
              <Text style={styles.text}>
                Type: {sample.type === 1 ? 'WEBP_LOSSY' : 'WEBP_LOSSLESS'}
              </Text>
              {Platform.OS === 'ios' && (
                <Text style={styles.text}>
                  Preset: {mapEnumToName[sample.preset]}
                </Text>
              )}
            </View>
          </ImageBackground>
        </View>
      ))}
    </ScrollView>
  );
}
