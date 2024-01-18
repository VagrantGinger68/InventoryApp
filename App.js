import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';

const window = Dimensions.get('window');

export default function App() {
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [imageName, setImageName] = useState('');
  const [saveLocation, setSaveLocation] = useState(FileSystem.documentDirectory);
  const [photoCount, setPhotoCount] = useState(1);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (imageName.trim() === '') {
      Alert.alert('Error', 'Please enter an item name before taking a picture.');
      return;
    }

    const currentPhotoCount = capturedImages.length + 1;
    setPhotoCount(currentPhotoCount);

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImages([...capturedImages, { uri: photo.uri, name: `${imageName}_${currentPhotoCount}` }]);
      setIsCameraVisible(false);
    }
  };

  const closeCamera = () => {
    setCapturedImages([]);
    setIsCameraVisible(false);
    setPhotoCount(1);
  };

  const pickSaveLocation = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.type === 'success' && result.uri) {
        setSaveLocation(result.uri);
        Alert.alert('Success', `Selected save location: ${result.uri}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to pick save location: ${error.message}`);
    }
  };

  const saveImagesToGallery = async () => {
    if (capturedImages.length > 0) {
      try {
        const itemFolderName = `${saveLocation}${imageName}/`;
        await FileSystem.makeDirectoryAsync(itemFolderName, { intermediates: true });

        const savedImagePaths = await Promise.all(
          capturedImages.map(async ({ uri, name }, index) => {
            const savedImagePath = await saveImage(uri, name, itemFolderName);
            return savedImagePath;
          })
        );

        Alert.alert(
          'Success',
          `Images saved successfully at:\n${savedImagePaths.join('\n')}`
        );

        setCapturedImages([]);
        setSaveLocation(FileSystem.documentDirectory);
        setPhotoCount(1);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please take pictures before saving.');
    }
  };

  const saveImage = async (imageUri, imageName, customSaveLocation) => {
    const directory = customSaveLocation || FileSystem.documentDirectory;
    const imagePath = `${directory}${imageName}.jpg`;

    try {
      await FileSystem.copyAsync({ from: imageUri, to: imagePath });
      return imagePath;
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  };

  const changeImageName = (index, newName) => {
    const updatedImages = [...capturedImages];
    updatedImages[index].name = `${imageName}_${index + 1}`;
    setCapturedImages(updatedImages);
  };

  const deleteImage = (index) => {
    const updatedImages = capturedImages.filter((img, i) => i !== index);
    setCapturedImages(updatedImages);

    const renamedImages = updatedImages.map((img, i) => ({
      uri: img.uri,
      name: `${imageName}_${i + 1}`,
    }));
    setCapturedImages(renamedImages);
  };

  const cameraRef = React.createRef();

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isCameraVisible ? (
        <Camera style={styles.camera} ref={cameraRef} type={useFrontCamera ? Camera.Constants.Type.front : Camera.Constants.Type.back}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity onPress={closeCamera} style={styles.closeButton}>
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} style={styles.cameraButton}>
              <Text style={styles.cameraButtonText}>Take Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUseFrontCamera((prev) => !prev)} style={styles.switchCameraButton}>
              <MaterialIcons name="flip-camera-ios" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={[styles.mainContainer, { paddingTop: window.height > 800 ? 50 : 20, paddingBottom: window.height > 800 ? 50 : 20 }]}>
          <Text style={styles.title}>Inventory Tracker</Text>
          <TextInput
            placeholder="Enter item name"
            value={imageName}
            onChangeText={(text) => setImageName(text)}
            style={styles.input}
          />
          <TouchableOpacity onPress={pickSaveLocation} style={styles.button}>
            <Text style={styles.buttonText}>Pick Save Location</Text>
          </TouchableOpacity>
          <Text style={styles.saveLocationText}>Save Location: {saveLocation}</Text>
          {capturedImages.map(({ uri, name }, index) => (
            <View key={index}>
              <Image source={{ uri }} style={styles.image} />
              <TextInput
                placeholder={`Enter new name for photo ${index + 1}`}
                value={name}
                onChangeText={(text) => changeImageName(index, text)}
                style={styles.imageNameInput}
              />
              <TouchableOpacity onPress={() => deleteImage(index)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={() => setIsCameraVisible(true)} style={styles.button}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveImagesToGallery} style={styles.button}>
            <Text style={styles.buttonText}>Save Images</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 50,
  },
  closeButton: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: 'red',
    borderRadius: 50,
    marginRight: 20,
  },
  cameraButton: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  cameraButtonText: {
    fontSize: 20,
  },
  switchCameraButton: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'blue',
    borderRadius: 50,
    marginLeft: 20,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '80%',
  },
  saveLocationText: {
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  imageNameInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '80%',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    marginVertical: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    padding: 20,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});