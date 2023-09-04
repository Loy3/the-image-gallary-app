import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Camera, useCameraDevices } from 'expo-camera'

const CameraScreen = () => {
    

    const camera = useRef(null);
    const devices = useCameraDevices();
    const device = devices.back;
    // let camera = new Camera();
    const [hasPermission, setHasPermission] = useState(false);
    const [startCamera, setStartCamera] = useState(false);

    // useEffect(() => {
    //     (async () => {
    //         const { status } = await Camera.requestCameraPermissionsAsync();
    //         setHasPermission(status === 'granted' ? true : false);
    //     })
    // }, [])

    async function startCameraFunction() {
        const { status } = await Camera.requestCameraPermissionsAsync()
        if (status === 'granted') {
            // start the camera
            setStartCamera(true)
            console.log('Access granted')
        } else {
            console.log('Access denied')
        }
    }

    async function takePicture() {
        if (!camera) return
        const photo = await camera.takePictureAsync()

    }

    return (
        <View style={styles.container}>
            {/* <View
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Camera
                    style={{ flex: 1, width: "100%" }}
                    type="back"
                    ref={(r) => {
                        camera = r
                        }}
                ></Camera>

                <TouchableOpacity
                    onPress={startCameraFunction}
                    style={{
                        width: 130,
                        borderRadius: 4,
                        backgroundColor: '#14274e',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 40
                    }}
                >
                    <Text
                        style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        Take picture
                    </Text>
                </TouchableOpacity>
            </View> */}

            {startCamera ? (
                <View>
                    <Camera
                        style={{ flex: 1, width: "100%" }}
                        type={Camera.Constants.Type.back}
                        ref={camera}
                    ></Camera>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            flexDirection: 'row',
                            flex: 1,
                            width: '100%',
                            padding: 20,
                            justifyContent: 'space-between'
                        }}
                    >
                        <View
                            style={{
                                alignSelf: 'center',
                                flex: 1,
                                alignItems: 'center'
                            }}
                        >
                            <TouchableOpacity
                                onPress={takePicture}
                                style={{
                                    width: 70,
                                    height: 70,
                                    bottom: 0,
                                    borderRadius: 50,
                                    backgroundColor: '#fff'
                                }}
                            />
                        </View>
                    </View>
                </View>

            ) : (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress={startCameraFunction}
                        style={{
                            width: 130,
                            borderRadius: 4,
                            backgroundColor: '#14274e',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 40
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Take picture
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <StatusBar style="auto" />
        </View>
    )
}



export default CameraScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
})