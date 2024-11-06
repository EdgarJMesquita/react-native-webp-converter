package com.webpconverter

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.FileOutputStream
import java.io.IOException

class WebpConverterModule internal constructor(context: ReactApplicationContext) :
  WebpConverterSpec(context) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  override fun convertImageToWebp(
    inputPath: String?,
    outputPath: String?,
    quality: Double,
    type: Double,
    preset: Double,
    promise: Promise?
  ) {

    CoroutineScope(Dispatchers.IO).launch {
      val bitmap = BitmapFactory.decodeFile(inputPath)

      if (bitmap == null) {
        promise?.reject("Error", "Could not load from $inputPath")
        return@launch
      }

      try {
        FileOutputStream(outputPath).use { outputStream ->
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val selectedQuality =
              if (type.toInt() == 1) Bitmap.CompressFormat.WEBP_LOSSY else Bitmap.CompressFormat.WEBP_LOSSLESS

            bitmap.compress(selectedQuality, quality.toInt(), outputStream)

          } else {
            bitmap.compress(Bitmap.CompressFormat.WEBP, quality.toInt(), outputStream)
          }

          promise?.resolve(outputPath)
        }
      } catch (e: IOException) {
        promise?.reject("Error", e.message)
      }
    }
  }

  companion object {
    const val NAME = "WebpConverter"
  }
}
