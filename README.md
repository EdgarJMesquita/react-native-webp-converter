# react-native-webp-converter

Easily convert PNG and JPG images to WebP format for improved image optimization and performance in React Native applications.

WebP is a modern image format that provides superior compression, saving on file size without compromising quality, making it ideal for mobile apps where performance and storage are key.

## Features

- **PNG/JPG to WebP** conversion.
- Custom hook `useConverter()` for easy in-component conversion.
- `convertImage()` method for more controlled use cases.
- Configurable options for **quality**, **type** (lossy/lossless), and **preset**.

## Demo

<a href="./docs/assets/quality-5.png?raw=true">
  <img src="./docs/assets/quality-5.png" width="49%">
</a>
<a href="./docs/assets/quality-40.png?raw=true">
 <img src="./docs/assets/quality-40.png" width="49%">
</a>
<a href="./docs/assets/quality-80.png?raw=true">
 <img src="./docs/assets/quality-80.png" width="49%">
</a>

## Installation

```sh
npm install react-native-webp-converter
```

or

```sh
yarn add react-native-webp-converter
```

## Usage

### Using `convertImage` Directly

For customized use cases, such as downloading an image first or managing paths manually, use `convertImage`.

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

### Using the `useConverter` Hook

The `useConverter` hook converts images in your React Native component and handles loading/error states.

#### 1. Automatic Conversion on Mount

```tsx
import * as WebP from 'react-native-webp-converter';
import { StyleSheet, Image, ActivityIndicator, Text } from 'react-native';

export default function App() {
  const image = WebP.useConverter('my-local-image.png');

  if (image.isLoading) return <ActivityIndicator />;

  if (image.error) return <Text>{image.error?.message}</Text>;

  return (
    <Image
      style={StyleSheet.absoluteFill}
      source={{ uri: `file://${image.uri}` }}
    />
  );
}
```

#### 2. Manual Conversion with `convert()`

```tsx
import * as WebP from 'react-native-webp-converter';
import { StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { useEffect } from 'react';

export default function App() {
  const image = WebP.useConverter();

  useEffect(() => {
    image.convert('my-local-image.png');
  }, []);

  if (image.isLoading) return <ActivityIndicator />;
  if (image.error) return <Text>{image.error?.message}</Text>;

  return (
    <Image
      style={StyleSheet.absoluteFill}
      source={{ uri: `file://${image.uri}` }}
    />
  );
}
```

## Configuration Options

| Property  | Type          | Default               | Description                                                                         |
| --------- | ------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `quality` | `number`      | `80`                  | Compression quality for the WebP image (0-100).                                     |
| `type`    | `WebP.Type`   | `WebP.Type.LOSSY`     | Compression type: `LOSSY` or `LOSSLESS`.                                            |
| `preset`  | `WebP.Preset` | `WebP.Preset.DEFAULT` | iOS only. Sets encoding preset based on image type: `PICTURE`, `ICON`, `TEXT`, etc. |

## API

```tsx
import * as WebP from 'react-native-webp-converter';
```

### Methods

#### `convertImage(inputPath: string, outputPath: string, config: WebPConfig): Promise<string>`

Converts an image to WebP format.

- **`inputPath`**: Path to the input image file.
- **`outputPath`**: Desired path for the output WebP file.
- **`config`**: Configuration options.
- **Returns**: `Promise<string>` resolving to the output path of the converted image.

### Hooks

#### `useConverter(inputPathOnMount?: string, configOnMount?: WebPConfig)`

This hook converts images within a React Native component and returns:

- **`uri`**: `string | null` - The path of the converted image.
- **`error`**: `any` - Any error encountered during conversion.
- **`isLoading`**: `boolean` - Indicates if conversion is in progress.
- **`convert`**: `(inputPath: string, config: WebPConfig)=>Promise<void>` - Manually trigger conversion.

### Example Config Object

```ts
const config: WebP.WebPConfig = {
  quality: 80,
  type: WebP.Type.LOSSY,
  preset: WebP.Preset.PICTURE,
};
```

## Interfaces

### `WebPConfig`

Defines the configuration for image conversion.

```ts
type WebPConfig = {
  quality: number; // Compression quality (0-100)
  type: Type; // Compression type: LOSSY or LOSSLESS
  preset?: Preset; // iOS only: image type preset, e.g., PICTURE, ICON
};
```

- **`quality`** (`number`): Defines the compression quality.

  - **Lossy**: Represents visual quality; higher values produce better quality.
  - **Lossless**: Indicates compression efficiency; higher values result in smaller files.

- **`type`** (`Type`): Sets compression type:

  - **`Type.LOSSY`** - Lossy compression.
  - **`Type.LOSSLESS`** - Lossless compression.

- **`preset`** (`Preset`, optional, iOS only): Adjusts compression settings based on image type:
  - **`Preset.DEFAULT`**: Standard preset.
  - **`Preset.PICTURE`**: Ideal for portraits or indoor shots.
  - **`Preset.PHOTO`**: Best for natural outdoor photography.
  - **`Preset.DRAWING`**: Suited for line art or drawings.
  - **`Preset.ICON`**: For small, colorful icons.
  - **`Preset.TEXT`**: For images containing text.

### Enums

#### `Type`

Compression types for image conversion.

```ts
enum Type {
  LOSSY = 1,
  LOSSLESS = 2,
}
```

#### `Preset`

Specifies the compression preset based on image type.

```ts
enum Preset {
  DEFAULT = 0, // Default preset
  PICTURE = 1, // Portrait or indoor shots
  PHOTO = 2, // Outdoor, natural photos
  DRAWING = 3, // Drawings or high-contrast images
  ICON = 4, // Small, colorful images (icons)
  TEXT = 5, // Text-like images
}
```

## Contributing

To contribute, see the [contributing guide](CONTRIBUTING.md) for setup and pull request guidelines.

## License

Licensed under the MIT License.

---
