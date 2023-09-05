import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

import * as SQLite from 'expo-sqlite';

import * as FileSystem from 'expo-file-system';

const CameraScreen = () => {
    const db = SQLite.openDatabase('db.gallaryDb');

    const camera = useRef();
    const [hasPermission, setHasPermission] = useState(false);
    const [startCamera, setStartCamera] = useState(false);
    const [photo, setPhoto] = useState("");
    // let { loader } = false;
    const [loader, setloader] = useState(false);
    const [cameraType, setCameraType] = useState("back");

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const dayOfMonth = today.getDate();
    const monthOfYear = monthsOfYear[today.getMonth()];
    const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${monthOfYear}`;

    //   const [forceUpdate, forceUpdateId] = useForceUpdate();

    const [location, setLocation] = useState([]);
    // const [errorMsg, setErrorMsg] = useState(null);

    // let text = 'Waiting..';

    const [curCity, setCurCity] = useState("")

    useEffect(() => {
        // db.transaction(tx => {
        //     tx.executeSql('DROP TABLE IF EXISTS images;', [], (tx, resultSet) => {
        //       console.log('Table deleted successfully');
        //     },
        //     error => {
        //       console.log('Error deleting table:', error);
        //     });
        //   });
        db.transaction((tx) => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image BLOB, location TEXT, date TEXT)"
            );
        });

        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM images", null,
                (txObj, results) => {
                    setLocation(results.rows._array)
                    console.log(results.rows._array);
                },
                (txObj, error) => console.log(error)
            );
        });
    }, []);

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            // console.log(location.coords.longitude);
            getCityFromLocation(location.coords.latitude, location.coords.longitude);
            // setLocation(location);
        })();
    }, []);
    useEffect(() => {
        // deleteGallary(1);
        // deleteGallary(2);
        // (async () => {
        //     const { status } = await Camera.requestCameraPermissionsAsync();
        //     setHasPermission(status === 'granted' ? true : false);
        // })
        // (async () => {
        //     const { status } = await Camera.requestCameraPermissionsAsync()
        //     if (status === 'granted') {
        //         // start the camera
        //         setStartCamera(true)
        //         console.log('Access granted')
        //     } else {
        //         console.log('Access denied')
        //     }
        // })
        // startCameraFunction();
        if (photo) {
            setloader(false);
            // console.log(location.coords.latitude);
        }
    }, [photo])

    //Flip camera
    function handleCam() {
        if (cameraType === "back") {
            setCameraType("front");
        } else {
            setCameraType("back");
        }
    }

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
        // if (!camera) return
        // const photo = await camera.takePictureAsync()

        const options = {
            base64: true,
            exif: false,
            quality: 1
        }
        setloader(true);
        const pic = await camera.current.takePictureAsync(options);
        setPhoto(pic);
        // console.log("Picture", pic);
    }

    //get city
    async function getCityFromLocation(latitude, longitude) {
        let city = null;
        try {
            const myLocation = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (myLocation.length > 0) {
                city = myLocation[0].city;
                // console.log('City:', city);
                // You can now use the city variable in your application
                // text = city;
                // console.log(myLocation[0]/);
                setCurCity(city)
            }

        } catch (error) {
            console.error(error);
        }
        // return city
    }

    //Store data to sqlite
    async function storeGallary() {
        console.log(curCity);
        // const base64Image = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });

        db.transaction(tx => {
            tx.executeSql('INSERT INTO images (image, location, date) values (?,?,?)', [photo.base64, curCity, formattedDate],
                (txObj, results) => {
                    let existingLocations = [...location];
                    existingLocations.push({ id: results.insertId, image: photo, location: curCity });
                    setLocation(existingLocations)
                },
                (txObj, error) => console.log("Error", error)
            );
        },
            (t, error) => { console.log("db error insertUser"); console.log(error); },
            (t, success) => {
                console.log("success");
            }
        )
    }

    //Delete
    function deleteGallary(id) {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM images WHERE id = ?', [id],
                (txObj, results) => {
                    if (results.rowsAffected > 0) {
                        let existingLocations = [...location].filter(res => res.id !== id);
                        setLocation(existingLocations);
                    }
                },
                (txObj, error) => console.log(error)
            );
        });
    }


    /*Store image
    const saveImageToDisk = async (imageUri) => {
      const { uri } = await FileSystem.downloadAsync(imageUri, FileSystem.documentDirectory + 'images/');
      return uri;
    };
    */


    // if (errorMsg) {
    //     text = errorMsg;
    // } else if (location) {
    //     let arr = []
    //     const city = JSON.stringify(location);
    //     arr.push(city);
    //     // console.log(location.coords.longitude);

    //     getCityFromLocation(location.coords.latitude, location.coords.longitude);
    //     // getCityFromLocation

    //     text = arr[0];

    // }

    // if (loader) {
    //     return (

    //     )
    // }

    if (photo) {
        return (
            <View style={styles.imgCont}>
                <Text style={styles.paragraphs}>{curCity}</Text>
                <Image
                    style={styles.img}
                    source={{
                        uri: "data:image/jpg;base64," + photo.base64
                    }}
                />
                <View style={styles.btnContainer}>
                    <View style={styles.btns}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#000",
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#fff",
                                width: 100,
                            }}
                            onPress={() => setPhoto("")}
                        >
                            <Text style={{ color: "#fff", fontWeight: "500" }}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: "#000",
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#fff",
                                width: 100,
                            }}
                            onPress={() => storeGallary()}
                        >
                            <Text style={{ color: "#fff", fontWeight: "500" }}>Use Image</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </View>
        )
    }




    return (

        <>
            {loader ?
                <View style={styles.loader}>
                    <Text>Hold It...</Text>
                </View>
                :
                null
            }

            <View
            // style={{
            //     flex: 1,
            //     backgroundColor: '#fff',
            //     justifyContent: 'center',
            //     alignItems: 'center'
            // }}
            >
                {/* <View style={styles.container}>
                {/* <Camera
                    type="back"
                    ref={camera}
                    style={styles.camera}
                >

                </Camera> /}

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
                        {/* <Camera
                        style={{ flex: 1, width: "100%" }}
                        type={Camera.Constants.Type.back}
                        ref={camera}
                    ></Camera> */}
                        <Camera
                            type={cameraType}
                            ref={camera}
                            style={styles.camera}
                        >

                        </Camera>
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
                            <View
                                style={{
                                    alignSelf: 'center',
                                    flex: 1,
                                    alignItems: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={handleCam}
                                    style={{
                                        width: 70,
                                        height: 70,
                                        bottom: 0,
                                        borderRadius: 50,
                                        backgroundColor: 'yellow'
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

                        <Text style={styles.paragraph}>{curCity}</Text>
                    </View>
                )}


            </View>
        </>
    );

}



export default CameraScreen

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: "absolute",
        zIndex: 99,
        width: 380,
        height: 500
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        marginTop: 30,
        width: 350,
        height: 450
    },
    absFill: {
        marginTop: 30,
        width: 350,
        height: 450
    },
    btnContainer: {
        justifyContent: "flex-end",
        alignItems: "center",
        width: 150,
        height: 150,
    },
    camBtn: {
        width: 130,
        height: 130,
        margin: 10,
        backgroundColor: "green"
    },
    imgCont: {
        marginTop: 30,
        width: 350,
        height: 450
    },
    img: {
        // marginTop: 30,
        width: 350,
        height: 450
    },
    backBtn: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        margin: 30
    },
    btns: {
        flexDirection: "row"
    },

    paragraph: {
        marginTop: 30
    },
    paragraphs: {
        paddingBottom: 10
    }
})

 // const camera = useRef(null);
    // const devices = useCameraDevices();
    // const device = devices.back;
    // // let camera = new Camera();
    // const [hasPermission, setHasPermission] = useState(false);
    // const [startCamera, setStartCamera] = useState(false);

    // // useEffect(() => {
    // //     (async () => {
    // //         const { status } = await Camera.requestCameraPermissionsAsync();
    // //         setHasPermission(status === 'granted' ? true : false);
    // //     })
    // // }, [])

    // async function startCameraFunction() {
    //     const { status } = await Camera.requestCameraPermissionsAsync()
    //     if (status === 'granted') {
    //         // start the camera
    //         setStartCamera(true)
    //         console.log('Access granted')
    //     } else {
    //         console.log('Access denied')
    //     }
    // }

    // async function takePicture() {
    //     if (!camera) return
    //     const photo = await camera.takePictureAsync()

    // }

    // return (
    //     <View style={styles.container}>
    //         {/* <View
    //             style={{
    //                 flex: 1,
    //                 backgroundColor: '#fff',
    //                 justifyContent: 'center',
    //                 alignItems: 'center'
    //             }}
    //         >
    //             <Camera
    //                 style={{ flex: 1, width: "100%" }}
    //                 type="back"
    //                 ref={(r) => {
    //                     camera = r
    //                     }}
    //             ></Camera>

    //             <TouchableOpacity
    //                 onPress={startCameraFunction}
    //                 style={{
    //                     width: 130,
    //                     borderRadius: 4,
    //                     backgroundColor: '#14274e',
    //                     flexDirection: 'row',
    //                     justifyContent: 'center',
    //                     alignItems: 'center',
    //                     height: 40
    //                 }}
    //             >
    //                 <Text
    //                     style={{
    //                         color: '#fff',
    //                         fontWeight: 'bold',
    //                         textAlign: 'center'
    //                     }}
    //                 >
    //                     Take picture
    //                 </Text>
    //             </TouchableOpacity>
    //         </View> */}

    //         {startCamera ? (
    //             <View>
    //                 <Camera
    //                     style={{ flex: 1, width: "100%" }}
    //                     type={Camera.Constants.Type.back}
    //                     ref={camera}
    //                 ></Camera>
    //                 <View
    //                     style={{
    //                         position: 'absolute',
    //                         bottom: 0,
    //                         flexDirection: 'row',
    //                         flex: 1,
    //                         width: '100%',
    //                         padding: 20,
    //                         justifyContent: 'space-between'
    //                     }}
    //                 >
    //                     <View
    //                         style={{
    //                             alignSelf: 'center',
    //                             flex: 1,
    //                             alignItems: 'center'
    //                         }}
    //                     >
    //                         <TouchableOpacity
    //                             onPress={takePicture}
    //                             style={{
    //                                 width: 70,
    //                                 height: 70,
    //                                 bottom: 0,
    //                                 borderRadius: 50,
    //                                 backgroundColor: '#fff'
    //                             }}
    //                         />
    //                     </View>
    //                 </View>
    //             </View>

    //         ) : (
    //             <View
    //                 style={{
    //                     flex: 1,
    //                     backgroundColor: '#fff',
    //                     justifyContent: 'center',
    //                     alignItems: 'center'
    //                 }}
    //             >
    //                 <TouchableOpacity
    //                     onPress={startCameraFunction}
    //                     style={{
    //                         width: 130,
    //                         borderRadius: 4,
    //                         backgroundColor: '#14274e',
    //                         flexDirection: 'row',
    //                         justifyContent: 'center',
    //                         alignItems: 'center',
    //                         height: 40
    //                     }}
    //                 >
    //                     <Text
    //                         style={{
    //                             color: '#fff',
    //                             fontWeight: 'bold',
    //                             textAlign: 'center'
    //                         }}
    //                     >
    //                         Take picture
    //                     </Text>
    //                 </TouchableOpacity>
    //             </View>
    //         )}

    //         <StatusBar style="auto" />
    //     </View>
    // )

/*
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const CameraScreen = () => {
const camera = useRef(null);
const devices = useCameraDevices();
const device = devices.back;
// const [hasPermission, setHasPermission] = useState(false);

const [startCamera, setStartCamera] = useState(false);
const [imgSource, setImgSource] = useState("");

//Give Permission
useEffect(() => {
    givePermission();
}, [])

async function givePermission() {
    const newCamPermission = await Camera.requestCameraPermission();
    console.log(newCamPermission);
}

async function captureImage() {
    if (camera.current !== null) {
        const image = await camera.current.takePhoto({})
        setImgSource(image.path);
        setStartCamera(false);
        console.log(image.path);
    }
}

if (device == null) {
    return <Text>Camera not available</Text>
}


return (
    <View style={styles.container}>

        {startCamera ? (
            <>
                <Camera
                    ref={camera}
                    style={styles.absFill}
                    device={device}
                    isActive={startCamera}
                    photo={true}
                />

                <View style={styles.btnContainer}>
                    <TouchableOpacity
                        style={styles.camBtn}
                        onPress={() => captureImage()}
                    />
                </View>
            </>
        ) : (
            <>
                {imgSource !== "" ? (
                    <Image
                        style={styles.img}
                        source={{
                            uri: `file://'${imgSource}`
                        }}
                    />
                ) : null}

                <View style={styles.backBtn}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#000",
                            padding: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            borderColor: "#fff",
                            width: 100,
                        }}
                        onPress={() => setStartCamera(true)}>
                        <Text style={{ color: "#fff", fontWeight: "500" }}>Back</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.btnContainer}>
                    <View style={styles.btns}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#000",
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#fff",
                                width: 100,
                            }}
                            onPress={() => setStartCamera(true)}>
                            <Text style={{ color: "#fff", fontWeight: "500" }}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: "#000",
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "#fff",
                                width: 100,
                            }}
                            onPress={() => setStartCamera(true)}>
                            <Text style={{ color: "#fff", fontWeight: "500" }}>Use Image</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </>
        )


        }
    </View>
);

}



export default CameraScreen

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
},
absFill: {
    marginTop: 30,
    width: 350,
    height: 450
},
btnContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    width: 150,
    height: 150,
},
camBtn: {
    width: 130,
    height: 130,
    margin: 10,
    backgroundColor: "green"
},
img: {
    marginTop: 30,
    width: 350,
    height: 450
},
backBtn: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 30
},
btns: {
    flexDirection: "row"
},
})

*/