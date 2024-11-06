
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNWebpConverterSpec.h"

@interface WebpConverter : NSObject <NativeWebpConverterSpec>
#else
#import <React/RCTBridgeModule.h>

@interface WebpConverter : NSObject <RCTBridgeModule>
#endif

@end
