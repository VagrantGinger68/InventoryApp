// AddItemScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { saveImage } from './utils';

const AddItemScreen = () => {
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [defaultSaveLocation, setDefaultSaveLocation] = useState('');

  const takePicture = async (camera) => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      setCapturedImage(data.uri);
      setIsCameraVisible(false);
    }
  };

  const saveImageToGallery = async () => {
    if (capturedImage && imageName.trim() !== '') {
      try {
        const savedImagePath = await saveImage(capturedImage, imageName, defaultSaveLocation);
        Alert.alert('Success', `Image saved successfully at: ${savedImagePath}`);
        setCapturedImage(null);
        setImageName('');
        setDefaultSaveLocation('');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please enter a name for the image.');
    }
  };

  return (
    <View>
      {isCameraVisible ? (
        <View style={{ flex: 1 }}>
          <RNCamera
            style={{ flex: 1 }}
            type={RNCamera.Constants.Type.back}
            captureAudio={false}
          >
            {({ camera, status }) => {
              if (status !== 'READY') return <Text>Waiting...</Text>;
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => takePicture(camera)}
                    style={{
                      padding: 20,
                      backgroundColor: 'white',
                      borderRadius: 50,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>Take Picture</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </RNCamera>
        </View>
      ) : (
        <View>
          <Text>Add Item Screen</Text>
          <TextInput
            placeholder="Enter image name"
            value={imageName}
            onChangeText={(text) => setImageName(text)}
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              padding: 10,
              marginVertical: 10,
            }}
          />
          <TextInput
            placeholder="Enter default save location"
            value={defaultSaveLocation}
            onChangeText={(text) => setDefaultSaveLocation(text)}
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              padding: 10,
              marginVertical: 10,
            }}
          />
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={{ width: 200, height: 200, marginVertical: 10 }}
            />
          )}
          <TouchableOpacity
            onPress={() => setIsCameraVisible(true)}
            style={{
              padding: 20,
              backgroundColor: 'blue',
              borderRadius: 5,
              marginTop: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveImageToGallery}
            style={{
              padding: 20,
              backgroundColor: 'green',
              borderRadius: 5,
              marginTop: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>Save Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AddItemScreen;
