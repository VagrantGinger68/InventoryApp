// utils.js
import RNFS from 'react-native-fs';

export const saveImage = async (imageUri, imageName, defaultSaveLocation) => {
  const directory = defaultSaveLocation || RNFS.DocumentDirectoryPath;
  const imagePath = `${directory}/${imageName}.jpg`;

  try {
    await RNFS.copyFile(imageUri, imagePath);
    return imagePath;
  } catch (error) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
};
