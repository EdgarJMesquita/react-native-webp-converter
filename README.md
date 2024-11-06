# react-native-webp-converter

Easily convert PNG and JPG images to WebP format for better image optimization and performance in React Native applications.

## Features

- Supports **PNG** and **JPG** to **WebP** conversion.
- Offers a custom hook `useConverter()` for easy image conversion within components.
- Provides a direct `convertImage()` method for flexibility in use.
- Configurable **quality**, **type** (lossy or lossless), and **preset** options.

## Installation

Install the library using either `npm` or `yarn`:

```sh
npm install react-native-webp-converter
```

or

```sh
yarn add react-native-webp-converter
```

## Usage

### Using the `useConverter` Hook

The `useConverter` hook allows you to convert an image file easily and handle loading/error states within your component.

```tsx
import * as WebP from 'react-native-webp-converter';
import { StyleSheet, Image, ActivityIndicator, Text } from 'react-native';

export default function App() {
  const image = WebP.useConverter('my-local-image.png');

  if (image.isLoading) return <ActivityIndicator />;

  if (image.error) return <Text>{image.error?.message}</Text>;

  return <Image style={StyleSheet.absoluteFill} source={{ uri: image.uri! }} />;
}
```

### Using `convertImage` Directly

For more customized scenarios, such as downloading an image first or managing paths manually, use `convertImage`.

```ts
import * as WebP from 'react-native-webp-converter'
import * as fs from 'react-native-fs';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet } from 'react-native';

export default function App() {
  const [convertedImage, setConvertedImage] = useState('');

  const convertImage = useCallback(async () => {

    const inputPath = `path-to-my-local-image.png`;
    const outputPath = `${fs.CachesDirectoryPath}/my-image-converted.webp`;

    // Actually convert the image with desired configuration
    await WebP.convertImage(inputPath, outputPath, {
      quality: 80,
      type: WebP.Type.LOSSY,
      preset: WebP.Preset.PICTURE,
    });

    setConvertedImage(outputPath);
  }, []);

  useEffect(() => {
    convertImage();
  }, []);

  if (!convertedImage) return <ActivityIndicator />;

  return (
    <Image
      source={{ uri: `file://${convertedImage}` }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  );
}
```

## Configuration Options

| Property  | Type          | Default               | Description                                                                                                    |
| --------- | ------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `quality` | `number`      | `80`                  | Sets the compression quality for the WebP image (0-100).                                                       |
| `type`    | `WebP.Type`   | `WebP.Type.LOSSY`     | Sets the compression type: `LOSSY` or `LOSSLESS`.                                                              |
| `preset`  | `WebP.Preset` | `WebP.Preset.DEFAULT` | iOS only. Sets the encoding preset for optimizing specific types of images, like `PICTURE`, `ICON`, or `TEXT`. |

## API

### `useConverter(inputPath: string, config?: WebPConfig)`

A hook to convert images directly in your React component.

- **`inputPath`**: The path to the input image file.
- **`config`**: Optional configuration for quality, type, and preset.
- Returns an object with properties:
  - **`isLoading`**: `boolean`, `true` while the conversion is in progress.
  - **`error`**: `any`, any error that occurred during conversion.
  - **`uri`**: `string | null`, the output path of the converted image.

### `convertImage(inputPath: string, outputPath: string, config: WebPConfig): Promise<string>`

A function to manually handle image conversion.

- **`inputPath`**: The path to the input image file.
- **`outputPath`**: Desired path for the output WebP file.
- **`config`**: Configuration options.
- **Returns**: `Promise<string>` resolving to the output path of the converted image.

### Example Config Object

```ts
const config: WebP.WebpConfig = {
  quality: 80,
  type: WebP.Type.LOSSY,
  preset: WebP.Preset.PICTURE,
};
```

## Contributing

If you'd like to contribute to this project, please see the [contributing guide](CONTRIBUTING.md) for instructions on setting up the repository, coding standards, and submitting pull requests.

## License

This project is licensed under the MIT License.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
