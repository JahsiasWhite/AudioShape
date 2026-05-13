const path = require('path');
const {
  addDirectoryImagesForAudioFiles,
  listImageFilesInAlbumDir,
} = require('../../public/songMetadataHelpers');

function dirent(name, isFile = true) {
  return {
    name,
    isFile: () => isFile,
  };
}

describe('songMetadataHelpers', () => {
  it('lists supported image files in one album directory', async () => {
    const albumDir = path.join('C:', 'Music', 'Album');
    const readdirImpl = jest.fn().mockResolvedValue([
      dirent('cover.jpg'),
      dirent('folder.PNG'),
      dirent('notes.txt'),
      dirent('subfolder', false),
    ]);

    await expect(listImageFilesInAlbumDir(albumDir, readdirImpl)).resolves.toEqual([
      path.join(albumDir, 'cover.jpg'),
      path.join(albumDir, 'folder.PNG'),
    ]);
  });

  it('scans only unique folders that contain audio files', async () => {
    const albumA = path.join('C:', 'Music', 'Album A');
    const albumB = path.join('C:', 'Music', 'Album B');
    const imageMap = {};
    const readdirImpl = jest
      .fn()
      .mockResolvedValueOnce([dirent('cover.jpg')])
      .mockResolvedValueOnce([dirent('folder.png')]);

    await addDirectoryImagesForAudioFiles(
      [
        path.join(albumA, 'one.mp3'),
        path.join(albumA, 'two.flac'),
        path.join(albumB, 'three.wav'),
      ],
      imageMap,
      { readdirImpl },
    );

    expect(readdirImpl).toHaveBeenCalledTimes(2);
    expect(readdirImpl).toHaveBeenCalledWith(albumA, { withFileTypes: true });
    expect(readdirImpl).toHaveBeenCalledWith(albumB, { withFileTypes: true });
    expect(imageMap).toEqual({
      [albumA]: [path.join(albumA, 'cover.jpg')],
      [albumB]: [path.join(albumB, 'folder.png')],
    });
  });
});
