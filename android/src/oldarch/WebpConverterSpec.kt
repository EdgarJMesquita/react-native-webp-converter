package com.webpconverter

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class WebpConverterSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun convertImageToWebp(inputPath: String, outputPath: String, quality: Double, type: Double, preset:Double, promise:Promise)
}
