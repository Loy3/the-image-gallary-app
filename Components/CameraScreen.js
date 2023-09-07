import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

import * as SQLite from 'expo-sqlite';

import * as FileSystem from 'expo-file-system';

import prevBtn from "../assets/previous.png";
import camFlipImg from "../assets/flip.png";
import cardImg from "../assets/bg.png";
import logo from "../assets/logo.jpg";

import gallaryImgNav from "../assets/gallaryOff.png";
import camImgNav from "../assets/cameraOff2.png";
import exitImgNav from "../assets/power.png";

const CameraScreen = ({ navigation }) => {
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
        //         console.log('Table deleted successfully');
        //     },
        //         error => {
        //             console.log('Error deleting table:', error);
        //         });
        // });
        db.transaction((tx) => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT, location TEXT, date TEXT)"
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
    let base64String = "";
    async function storeGallary() {
        console.log(curCity);
        // const base64Image = await FileSystem.readAsStringAsync(photo.base64, { encoding: 'base64' });
        // let img = "the image";
        // // base64String = URL.createObjectURL(photo);
        // convertToBlob(photo, function (dataUrl) {
        //     console.log('RESULT:', dataUrl)
        //     img = dataUrl;

        // })
        // console.log(photo.uri);
        // const blob = await convertToBlob(photo.base64);
        // if (blob !== null) {
        //     console.log("We got our blob", blob);
        //     db.transaction(tx => {
        //         tx.executeSql('INSERT INTO images (image, location, date) values (?,?,?)', [blob, curCity, formattedDate],
        //             (txObj, results) => {
        //                 let existingLocations = [...location];
        //                 existingLocations.push({ id: results.insertId, image: photo, location: curCity });
        //                 setLocation(existingLocations)
        //             },
        //             (txObj, error) => console.log("Error", error)
        //         );
        //     },
        //         (t, error) => { console.log("db error insertUser"); console.log(error); },
        //         (t, success) => {
        //             console.log("success");
        //         }
        //     )
        // } else {
        //     console.log("Mission failed");
        // }


        const imageUri = photo.uri;
        db.transaction(tx => {
            tx.executeSql('INSERT INTO images (image, location, date) values (?,?,?)', [imageUri, curCity, formattedDate],
                (txObj, results) => {
                    let existingLocations = [...location];
                    existingLocations.push({ id: results.insertId, image: photo, location: curCity });
                    setLocation(existingLocations)
                    toGallary();
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

    function returnToScreen() {
        setStartCamera(false)
    }
    // async function convertToBlob(base64Image) {
    //     console.log("Our base64Image", base64Image);
    //     try {
    //         const fileUri = FileSystem.cacheDirectory + 'image.jpg';
    //         await FileSystem.writeAsStringAsync(fileUri, base64Image, {
    //             encoding: FileSystem.EncodingType.Base64,
    //         });
    //         const blob = await FileSystem.readAsStringAsync(fileUri, {
    //             encoding: FileSystem.EncodingType.Base64,
    //         });
    //         console.log("Blob so far", blob);

    //         return blob;
    //     } catch (error) {
    //         console.log('Error converting image to blob:', error);
    //         return null;
    //     }
    // };




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

    function toGallary() {
        navigation.navigate("Gallary");
    }

    if (photo) {
        return (
            <View style={styles.imgCont}>
                <View style={styles.return2}>
                    <TouchableOpacity style={styles.returnBtnCont2} onPress={() => setPhoto("")}>
                        <Image source={prevBtn} style={styles.returnBtn2} />
                    </TouchableOpacity>
                </View>
                <Image
                    style={styles.img}
                    source={{
                        uri: "data:image/jpg;base64," + photo.base64
                    }}
                //   /  source={{ uri: `file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540dev_loy%252Fthe-image-gallary-app/Camera/de181c75-5beb-409d-a70a-e0952c6e1b3a.jpg` }}
                />
                <Text style={styles.location}>{curCity}</Text>
                <Text style={styles.date}>{formattedDate}</Text>

                <View style={styles.btnContainer}>
                    <View style={styles.btns}>
                        <TouchableOpacity
                            style={styles.retake}
                            onPress={() => setPhoto("")}
                        >
                            <Text style={{ color: "#3b3b3b", fontWeight: "500" }}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.retake}
                            onPress={() => storeGallary()}
                        >
                            <Text style={{ color: "#3b3b3b", fontWeight: "500" }}>Use Image</Text>
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
                        <ImageBackground source={cardImg} style={styles.return}>
                            <TouchableOpacity style={styles.returnBtnCont} onPress={() => returnToScreen()}>
                                <Image source={prevBtn} style={styles.returnBtn} />
                            </TouchableOpacity>
                        </ImageBackground>

                        <Camera
                            type={cameraType}
                            ref={camera}
                            style={styles.camera}
                        >

                        </Camera>
                        <ImageBackground source={cardImg}
                            style={{
                                // position: 'absolute',
                                bottom: 0,
                                flexDirection: 'row',
                                // flex: 1,
                                width: "100%",
                                height: "5%"
                                // justifyContent: 'space-between'
                            }}>
                            <View style={styles.toGallaryCont} >
                                <TouchableOpacity style={styles.toGallaryBtn} onPress={() => toGallary()}>
                                    <Image source={logo} style={styles.toGallary} />
                                </TouchableOpacity>

                            </View>
                            <View
                                style={styles.captureCont}>

                                <View style={styles.capture}>
                                    <TouchableOpacity
                                        onPress={takePicture}
                                        style={styles.captureBtn}
                                    />
                                </View>
                            </View>

                            <View style={styles.flip}>
                                <View style={styles.flipCont}>
                                    <TouchableOpacity
                                        onPress={handleCam}
                                        style={styles.flipBtn}
                                    >
                                        <Image source={camFlipImg} style={styles.camFlip} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ImageBackground>

                    </View>

                ) : (
                    <>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: '#fffffe',
                                justifyContent: 'center',
                                alignItems: 'center',
                                // width: "100%",
                                // height: "100%"
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
                                    height: 40,
                                    marginTop: 150
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
                        {/* <ImageBackground style={styles.btmNav} source={cardImg}>
                            <View style={styles.btn1Cont}>
                                {/* <View style={styles.wrap}> *}
                                <View style={styles.btn1}>
                                    <Image
                                        style={styles.btnImg}
                                        source={gallaryImgNav}
                                    />
                                </View>
                                {/* <Text>Gallary</Text> *}
                                {/* </View> *}
                            </View>
                            <View style={styles.btn2Cont}>

                                <View style={styles.btn2}>
                                    <Image
                                        style={styles.btnCamImg}
                                        source={camImgNav}
                                    />
                                </View>

                            </View>
                            <View style={styles.btn3Cont}>
                                <View style={styles.btn3}>
                                    <Image
                                        style={styles.btnImg}
                                        source={exitImgNav}
                                    />
                                </View>

                            </View>
                        </ImageBackground> */}
                    </>
                )}


            </View>
        </>
    );

}



export default CameraScreen

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        backgroundColor: '#fffffe',
        alignItems: 'center',
        justifyContent: 'center',
        position: "absolute",
        zIndex: 99,
        width: "100%",
        height: "100%"
    },
    container: {
        flex: 1,
        // backgroundColor: 'yellow',
        alignItems: 'center',
        justifyContent: 'center',
    },
    return: {
        marginTop: 30,
        width: "100%",
        height: 90,
        backgroundColor: "yellow"
    },
    returnBtnCont: {
        marginTop: 30,
        marginLeft: 10
    },
    returnBtn: {
        width: 35,
        height: 35
    },
    toGallaryCont: {
        width: 125,
        height: "100%",
        alignContent: "center",
        justifyContent: "center",
        // backgroundColor: "yellow"
    },
    toGallaryBtn: {
        width: 70,
        height: 70,
        backgroundColor: "#3b3b3b",
        borderRadius: 100,
        marginHorizontal: 27.5,
        marginTop: 100
    },
    toGallary: {
        width: 60,
        height: 60,
        objectFit: "fill",
        margin: 5,
        borderRadius: 100
    },
    captureCont: {
        width: 150,
        height: "100%",
        alignContent: "center",
        justifyContent: "center",
        // backgroundColor: "pink"
    },
    capture: {
        width: 90,
        height: 90,
        padding: 5,
        backgroundColor: "#3b3b3b",
        borderRadius: 100,
        marginHorizontal: 30,
        marginTop: 100
    },
    captureBtn: {
        width: 80,
        height: 80,
        bottom: 0,
        borderRadius: 50,
        backgroundColor: '#fff',
    },
    camera: {
        marginTop: 0,
        // position:"absolute",
        width: "100%",
        height: "76%",
        objectFit: "cover"
    },

    absFill: {
        marginTop: 30,
        width: 350,
        height: 450
    },
    flip: {
        width: 125,
        height: "100%",
        alignContent: "center",
        justifyContent: "center",
        // backgroundColor: "yellow"
    },
    flipCont: {
        width: 70,
        height: 70,
        backgroundColor: "#3b3b3b",
        borderRadius: 100,
        marginHorizontal: 27.5,
        marginTop: 100
    },
    flipBtn: {
        width: 60,
        height: 60,
        margin: 5,
        borderRadius: 100,
        backgroundColor: '#fffffe',
        alignContent: "center",
        justifyContent: "center",
    },
    camFlip: {
        width: 35,
        height: 35,
        margin: 12.5
    },


    camBtn: {
        width: 130,
        height: 130,
        margin: 10,
        backgroundColor: "green"
    },

    imgCont: {
        marginTop: 60,
        width: "100%",
        height: "100%"
    },
    return2: {
        position: "absolute",
        top: 30,
        left: 10,
        zIndex: 10,
        backgroundColor: "#fffffe",
        width: 35,
        height: 35,
        borderRadius: 100
    },

    returnBtn2: {
        width: 35,
        height: 35
    },
    img: {
        // marginTop: 30,
        width: "100%",
        height: "75%",
        objectFit: "cover"
    },
    backBtn: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        margin: 30
    },
    btnContainer: {
        position: "absolute",
        bottom: 70,
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        height: "auto",
        // marginHorizontal: 30
    },
    btns: {
        flexDirection: "row",

    },
    retake: {
        backgroundColor: "#fffffe",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        // borderRadius: 10,
        borderWidth: 3,
        borderColor: "#3b3b3b",
        width: "47%",
        marginLeft: 5
    },


    paragraph: {
        marginTop: 30
    },
    location: {
        color: "#7a7a7a",
        fontSize: 18,
        marginTop: 10,
        marginLeft: 20
    },
    date: {
        color: "#9e9e9e",
        marginLeft: 20
    },


    btmNav: {
        height: 80,
        width: "100%",
        backgroundColor: "yellow",
        position: "absolute",
        bottom: 0,
        left: 0,
        flexDirection: "row"
    },
    btn1Cont: {
        // backgroundColor: "green",
        width: "30%",
        height: "100%",
        alignItems: "center"
    },
    btn2Cont: {
        // backgroundColor: "purple",
        width: "40%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    wrap: {
        // width: "62%",
        // height: 100,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "absolute",
        top: -30,
        borderRadius: 100,
        // borderBottomRightRadius: 100,
        // borderTopLeftRadius:80,
        // borderTopRightRadius: 80

    },
    btn3Cont: {
        // backgroundColor: "green",
        width: "30%",
        height: "100%",
        alignItems: "center"
    },

    btn1: {
        // backgroundColor: "blue",
        height: 70,
        width: 70,
        marginVertical: 15,
        // marginHorizontal: 10,
        borderRadius: 100
    },
    btnImg: {
        height: 50,
        width: 50,
    },
    btnCamImg: {
        height: 60,
        width: 60,
    },
    btn2: {
        backgroundColor: "#fffffe",
        // height: 90,
        // width: 90,
        // marginVertical: 5,
        // // marginHorizontal: 5,
        // borderRadius: 80,
        borderWidth: 3,
        borderColor: "#9b9b9b",
        borderTopLeftRadius: 90,
        borderTopRightRadius: 90,
        borderBottomLeftRadius: 90,
        borderBottomRightRadius: 90,
        height: "110%",
        width: "90%",
        marginVertical: 15,
        // marginHorizontal: 10,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: -35
    },
    btn3: {
        // backgroundColor: "blue",
        height: 60,
        width: 60,
        marginVertical: 15,
        // marginHorizontal: 10,
        borderRadius: 100
    },
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