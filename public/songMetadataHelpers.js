const fs = require('fs');

function safeStatSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return undefined;
  }
}

function technicalFieldsFromFormat(format, filePath) {
  const fileSizeBytes = safeStatSize(filePath);
  if (!format) {
    return { fileSizeBytes };
  }
  let codecStr;
  const { codec } = format;
  if (typeof codec === 'string') {
    codecStr = codec;
  } else if (Array.isArray(codec)) {
    codecStr = codec.filter(Boolean).join(', ');
  }
  return {
    bitrate: format.bitrate,
    sampleRate: format.sampleRate,
    numberOfChannels: format.numberOfChannels,
    codec: codecStr,
    container: format.container,
    lossless: format.lossless,
    fileSizeBytes,
  };
}

module.exports = {
  safeStatSize,
  technicalFieldsFromFormat,
};
