#import "WebpConverter.h"
#import <libwebp/encode.h>

@implementation WebpConverter
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(convertImageToWebp:(NSString *)inputPath
                          outputPath:(NSString *)outputPath
                             quality:(double)quality
                                type:(double)type
                              preset:(NSInteger)preset
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        NSString *inputFilePath = [self removeFileScheme:inputPath];
        NSString *outputFilePath = [self removeFileScheme:outputPath];

        UIImage *inputImage = [self loadImageFromPath:inputFilePath];
        if (!inputImage) {
            reject(@"image_load_error", [NSString stringWithFormat:@"Could not load from %@", inputPath], nil);
            return;
        }

        CGImageRef imageRef = [inputImage CGImage];
        size_t width = CGImageGetWidth(imageRef);
        size_t height = CGImageGetHeight(imageRef);

        WebPConfig config;
        if (![self configureWebP:&config withQuality:quality type:type preset:preset reject:reject]) {
            return;
        }

        WebPPicture picture;
        if (![self initializePicture:&picture width:width height:height imageRef:imageRef reject:reject]) {
            return;
        }

        if (![self writeWebPToFile:outputFilePath picture:&picture config:&config reject:reject]) {
            return;
        }

        WebPPictureFree(&picture);
        resolve(outputPath);
    });
}

#pragma mark - Helper Methods

- (NSString *)removeFileScheme:(NSString *)inputPath {
    NSString *prefix = @"file://";
    if ([inputPath hasPrefix:prefix]) {
        return [inputPath substringFromIndex:prefix.length];
    }
    return inputPath;
}

- (UIImage *)loadImageFromPath:(NSString *)path {
    return [UIImage imageWithContentsOfFile:path];
}

- (BOOL)configureWebP:(WebPConfig *)config
          withQuality:(double)quality
                 type:(double)type
               preset:(NSInteger)preset
               reject:(RCTPromiseRejectBlock)reject
{
    WebPPreset presetValue = (WebPPreset)preset;
    if (!WebPConfigPreset(config, presetValue, (float)quality) || !WebPValidateConfig(config)) {
        reject(@"config_error", @"Failed to initialize or validate WebP config", nil);
        return NO;
    }
    config->lossless = type;
    return YES;
}

- (BOOL)initializePicture:(WebPPicture *)picture 
                    width:(size_t)width
                   height:(size_t)height
                 imageRef:(CGImageRef)imageRef
                   reject:(RCTPromiseRejectBlock)reject
{
    if (!WebPPictureInit(picture)) {
        reject(@"picture_init_error", @"Failed to initialize WebP picture", nil);
        return NO;
    }
    picture->width = (int)width;
    picture->height = (int)height;

    CFDataRef rawData = CGDataProviderCopyData(CGImageGetDataProvider(imageRef));
    if (!rawData || !WebPPictureImportRGBA(picture, CFDataGetBytePtr(rawData), (int)(4 * width))) {
        if (rawData) CFRelease(rawData);
        WebPPictureFree(picture);
        reject(@"data_error", @"Failed to process image data", nil);
        return NO;
    }
    CFRelease(rawData);
    return YES;
}

- (BOOL)writeWebPToFile:(NSString *)outputPath 
                picture:(WebPPicture *)picture
                 config:(WebPConfig *)config
                 reject:(RCTPromiseRejectBlock)reject
{
    FILE *file = fopen([outputPath UTF8String], "wb");
    if (!file) {
        WebPPictureFree(picture);
        reject(@"file_open_error", [NSString stringWithFormat:@"Failed to open file at %@", outputPath], nil);
        return NO;
    }

    picture->writer = CustomFileWriter;
    picture->custom_ptr = file;

    if (!WebPEncode(config, picture)) {
        fclose(file);
        reject(@"encoding_error", @"Failed to encode image to WebP", nil);
        return NO;
    }

    fclose(file);
    return YES;
}

int CustomFileWriter(const uint8_t *data, size_t data_size, const WebPPicture *picture) {
    FILE *file = (FILE *)picture->custom_ptr;
    return (fwrite(data, 1, data_size, file) == data_size) ? 1 : 0;
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeWebpConverterSpecJSI>(params);
}
#endif

@end
