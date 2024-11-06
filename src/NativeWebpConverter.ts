import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  convertImageToWebp(
    inputPath: string,
    outputPath: string,
    quality: number,
    type: number,
    preset: Int32
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WebpConverter');
