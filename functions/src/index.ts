import * as functions from 'firebase-functions'
const admin = require('firebase-admin')
admin.initializeApp()
const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const fs = require('fs')

exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object) => {
    const fileBucket = object.bucket
    const filePath = object.name
    const fileName = filePath!.split('/').pop()
    const contentType = object.contentType

    if (fileName!.startsWith('thumb_')) {
      console.log('Already a Thumbnail.')
      return
    }

    const bucket = admin.storage().bucket(fileBucket)
    const tempFilePath = path.join(os.tmpdir(), fileName)
    const metadata = {
      contentType: contentType,
    }
    await bucket.file(filePath).download({ destination: tempFilePath })
    console.log('Image downloaded locally to', tempFilePath)
    // Generate a thumbnail using ImageMagick.
    await spawn('convert', [
      tempFilePath,
      '-auto-orient',
      '-thumbnail',
      '1200x1200>',
      tempFilePath,
    ])
    console.log('Thumbnail created at', tempFilePath)
    const thumbFileName = `thumb_${fileName}`
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName)
    await bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    })

    console.log('finish: ', tempFilePath)
    return fs.unlinkSync(tempFilePath)
  })
