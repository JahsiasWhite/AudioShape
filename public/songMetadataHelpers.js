const fs = require('fs');
const path = require('path');

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

async function listImageFilesInAlbumDir(
  albumDir,
  readdirImpl = fs.promises.readdir,
) {
  let entries;
  try {
    entries = await readdirImpl(albumDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const allowed = new Set(['.jpg', '.jpeg', '.png']);
  const images = [];
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (allowed.has(ext)) {
      images.push(path.join(albumDir, ent.name));
    }
  }
  return images;
}

async function addDirectoryImagesForAudioFiles(audioFiles, imageMap, options = {}) {
  const readdirImpl = options.readdirImpl || fs.promises.readdir;
  const audioDirs = [...new Set(audioFiles.map((file) => path.dirname(file)))];

  await Promise.all(
    audioDirs.map(async (audioDir) => {
      if (Object.prototype.hasOwnProperty.call(imageMap, audioDir)) return;
      imageMap[audioDir] = await listImageFilesInAlbumDir(audioDir, readdirImpl);
    }),
  );

  return imageMap;
}

module.exports = {
  addDirectoryImagesForAudioFiles,
  listImageFilesInAlbumDir,
  safeStatSize,
  technicalFieldsFromFormat,
};
