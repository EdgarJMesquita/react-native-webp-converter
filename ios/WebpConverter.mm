#import "WebpConverter.h"
#import <UIKit/UIKit.h>
#import <libwebp/decode.h>
#import <libwebp/encode.h>

@implementation WebpConverter
RCT_EXPORT_MODULE()

// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_EXPORT_METHOD(convertImageToWebp:(NSString *)inputPath
                  outputPath:(NSString *)outputPath
                     quality:(double)quality
                        type:(double)type
                      preset:(NSInteger)preset
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject)
{
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        // Load the input image
        UIImage *inputImage = [UIImage imageWithContentsOfFile:inputPath];
        if (!inputImage) {
            reject(@"image_load_error", [NSString stringWithFormat:@"Could not load from %@", inputPath], nil);
            return;
        }
       
        // Prepare to encode the image to WebP
        CGImageRef imageRef = [inputImage CGImage];
        size_t width = CGImageGetWidth(imageRef);
        size_t height = CGImageGetHeight(imageRef);
       
        // Initialize WebP configuration and set quality/type
        WebPConfig config;
       
        WebPPreset presetValue = (WebPPreset) preset;
      
        if (!WebPConfigPreset(&config, presetValue, (float)quality) || !WebPValidateConfig(&config)) {
            reject(@"config_error", @"Failed to initialize or validate WebP config", nil);
            return;
        }
       
        config.lossless = (type == 2) ? 1 : 0;

        // Initialize WebPPicture and import RGB data
        WebPPicture picture;
        if (!WebPPictureInit(&picture)) {
            reject(@"picture_init_error", @"Failed to initialize WebP picture", nil);
            return;
        }
        picture.width = (int)width;
        picture.height = (int)height;

        // Copy the image data into the WebPPicture
        CFDataRef rawData = CGDataProviderCopyData(CGImageGetDataProvider(imageRef));
        if (!rawData) {
            WebPPictureFree(&picture);
            reject(@"data_error", @"Failed to obtain raw image data", nil);
            return;
        }
        if (!WebPPictureImportRGBA(&picture, CFDataGetBytePtr(rawData), (int)(4 * width))) {
            CFRelease(rawData);
            WebPPictureFree(&picture);
            reject(@"data_import_error", @"Failed to import RGBA data into WebP picture", nil);
            return;
        }
        CFRelease(rawData);

        // Use WebPMemoryWriter to encode the WebP data
        WebPMemoryWriter writer;
        WebPMemoryWriterInit(&writer);
        picture.writer = WebPMemoryWrite;
        picture.custom_ptr = &writer;

        // Perform the encoding
        int encodeSuccess = WebPEncode(&config, &picture);
        WebPPictureFree(&picture);

        if (!encodeSuccess) {
            WebPMemoryWriterClear(&writer);
            reject(@"encoding_error", @"Failed to encode image to WebP", nil);
            return;
        }

        // Convert the encoded data to NSData
        NSData *webpData = [NSData dataWithBytes:writer.mem length:writer.size];

        // Write NSData to file
        NSError *fileError = nil;
        BOOL success = [webpData writeToFile:outputPath options:NSDataWritingAtomic error:&fileError];
        WebPMemoryWriterClear(&writer);

        if (!success) {
            reject(@"file_save_error", @"Failed to save WebP image to output path", fileError);
        } else {
            resolve(outputPath);
        }
    });
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
