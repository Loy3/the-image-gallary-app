import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ImageBackground, BackHandler, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import cardImg from "../assets/bg.png";
import logo from "../assets/logo.jpg";
import viewImg from "../assets/open.png";

import gallaryImgNav from "../assets/gallaryOff.png";
import camImgNav from "../assets/cameraOff2.png";
import exitImgNav from "../assets/door.png";
import closeBtnImg from "../assets/close.png";
import deleteBtnImg from "../assets/delete.png";

const GallaryScreen = ({ navigation }) => {
    const db = SQLite.openDatabase('db.gallaryDb');
    const [gallary, setGallary] = useState([]);
    const [viewer, setViewer] = useState(false);
    const [gallaryToView, setGallaryToView] = useState(null);
    const [latestImg, setLatestImg] = useState(null);


    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const dayOfMonth = today.getDate();
    const monthOfYear = monthsOfYear[today.getMonth()];
    const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${monthOfYear}`;

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT, location TEXT, date TEXT)"
            );
        });

        db.transaction((tx) => {
            tx.executeSql(
                "SELECT * FROM images", null,
                (txObj, results) => {
                    setGallary(results.rows._array)
                    // console.log(results.rows._array);
                    setLatestImg(results.rows._array[results.rows._array.length - 1])
                },
                (txObj, error) => console.log(error)
            );
        });
    }, []);

    function openViewer(data) {
        setGallaryToView(data);
        setViewer(true);
    }
    function closeViewer() {
        setViewer(false);
    }

    //Delete
    function deleteGallary(id) {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM images WHERE id = ?', [id],
                (txObj, results) => {
                    if (results.rowsAffected > 0) {
                        let existingGallaries = [...gallary].filter(res => res.id !== id);
                        setGallary(existingGallaries);
                        setLatestImg(existingGallaries[existingGallaries.length - 1]);
                    }
                },
                (txObj, error) => console.log(error)
            );
        });
        setViewer(false);
    }

    const handleExitApp = () => {
        BackHandler.exitApp();
    };
    function toCamera() {
        navigation.navigate("Camera");
    }

    // const renderGallary = ({ item }) => {
    //     return (
    //         <View style={styles.column}>
    //             <ImageBackground source={cardImg} style={styles.card}>
    //                 <View style={styles.bgColor}></View>
    //                 <Image
    //                     style={styles.img}
    //                     source={{
    //                         uri: `${item.image}`
    //                     }}
    //                 />

    //                 <View style={styles.textCont}>
    //                     <Text style={styles.location}>{item.location}</Text>
    //                     <Text style={styles.date}>{item.date}</Text>
    //                 </View>
    //                 <View style={styles.viewBtn}>
    //                     <TouchableOpacity style={styles.vBtn} onPress={() => openViewer(item)}>
    //                         <Image
    //                             style={styles.viewBtnImg}
    //                             source={viewImg}
    //                         />
    //                     </TouchableOpacity>
    //                 </View>
    //             </ImageBackground>
    //         </View>
    //     );
    // };

    // if (gallary === []) {
    //     return (
    //         <View style={styles.container}>
    //             <Text>Loading...</Text>
    //         </View>
    //     )
    // }

    return (
        <View style={styles.container}>

            <ScrollView scrollEnabled={true} >
                {viewer === false ?

                    <View style={styles.gallCont}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Gallary</Text>
                            <Text>{formattedDate}</Text>
                        </View>

                        <View style={styles.logoCont}>
                            <Image
                                style={styles.logo}
                                source={logo}
                            />
                        </View>

                        <View style={{ borderBottomColor: '#000', borderBottomWidth: 2, marginTop: 30, }} />

                        {latestImg !== null ?
                            <View style={styles.latestCont}>
                                <View style={styles.latestTopCont}>
                                    <Image source={{ uri: `${latestImg.image}` }} style={styles.latestTopImg} />
                                    <View style={styles.latestTopTxtCont}>
                                        <Text style={styles.latestTopLocation}>New</Text>
                                        <Text style={styles.latestTopDate}>Newly added photo.</Text>
                                    </View>
                                </View>
                                <Image source={{ uri: `${latestImg.image}` }} style={styles.latestMainImg} />

                                <View style={styles.newCont}>
                                    <Text style={styles.newTitle}>{latestImg.location}</Text>
                                    <Text style={styles.newText}>{latestImg.date}</Text>
                                </View>
                            </View>
                            : null
                        }
                        <View style={{ borderBottomColor: '#000', borderBottomWidth: 2, marginTop: 40, }} />

                        <View style={styles.cardCont}>
                            {gallary.map((gal, index) => (
                                <View key={index} style={styles.column}>
                                    <ImageBackground source={cardImg} style={[styles.card, { borderRadius: 100 }]}>
                                        <View style={styles.bgColor}></View>
                                        <Image
                                            style={styles.img}
                                            source={{
                                                uri: `${gal.image}`
                                            }}
                                        />

                                        <View style={styles.textCont}>
                                            <Text style={styles.location}>{gal.location}</Text>
                                            <Text style={styles.date}>{gal.date}</Text>
                                        </View>
                                        <View style={styles.viewBtn}>
                                            <TouchableOpacity style={styles.vBtn} onPress={() => openViewer(gal)}>
                                                <Image
                                                    style={styles.viewBtnImg}
                                                    source={viewImg}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </ImageBackground>
                                </View>
                            ))}

                            {/* <FlatList
                                data={gallary}
                                renderItem={renderGallary}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={2}
                            /> */}

                        </View>

                    </View>
                    :
                    <View style={styles.viewScreen}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => closeViewer()}>
                            <Image
                                style={styles.closeBtnImg}
                                source={closeBtnImg}
                            />
                        </TouchableOpacity>
                        <Image
                            style={styles.viewImg}
                            source={{
                                uri: `${gallaryToView.image}`
                            }}
                        />
                        <View style={styles.detailsCont}>
                            <Text style={styles.locationd}>{gallaryToView.location}</Text>
                            <Text style={styles.dated}>{gallaryToView.date}</Text>
                        </View>

                        <View style={styles.removeBtnCont}>
                            <TouchableOpacity style={styles.removeBtn} onPress={() => deleteGallary(gallaryToView.id)}>
                                <Image
                                    style={styles.removeBtnImg}
                                    source={deleteBtnImg}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                }


            </ScrollView>
            {viewer === false ?

                <ImageBackground style={styles.btmNav} source={cardImg}>
                    <View style={styles.btn1Cont}>
                        <View style={styles.btn1}>
                            <Image
                                style={styles.btnImg}
                                source={gallaryImgNav}
                            />
                            <Text style={styles.btnText}>Gallary</Text>
                        </View>
                    </View>
                    <View style={styles.btn2Cont}>

                        <TouchableOpacity style={styles.btn2} onPress={() => toCamera()}>
                            <Image
                                style={styles.btnCamImg}
                                source={camImgNav}
                            />
                            <Text style={styles.btnText}>Camera</Text>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.btn3Cont}>
                        <TouchableOpacity style={styles.btn3} onPress={() => handleExitApp()}>
                            <Image
                                style={styles.btnImgE}
                                source={exitImgNav}
                            />
                            <Text style={styles.btnText}>Close</Text>
                        </TouchableOpacity>

                    </View>
                </ImageBackground>
                :
                null
            }
        </View >
    )
}

export default GallaryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fffffe",
        paddingTop: 30,
        alignItems: "center",
        position: "relative"
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
        marginLeft: 10
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "500"
    },
    logoCont: {
        position: "absolute",
        top: 30,
        right: 5,
        backgroundColor: "#000",
        borderRadius: 100
    },
    logo: {
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 100,
        margin: 4
    },

    latestCont: {
        marginTop: 40
    },
    latestTopCont: {
        flexDirection: "row"
    },
    latestTopImg: {
        width: 70,
        height: 70,
        objectFit: "cover",
        borderWidth: 3,
        borderColor: "#000",
        borderRadius: 100
    },
    latestTopTxtCont: {},
    latestTopLocation: {
        color: "#7a7a7a",
        fontSize: 15,
        marginTop: 10,
        marginLeft: 15
    },
    latestTopDate: {
        color: "#9e9e9e",
        marginLeft: 13,
        fontSize: 14
    },
    latestMainImg: {
        width: "100%",
        height: 250,
        objectFit: "cover",
        marginTop: 30,
        borderRadius: 20
    },
    newCont: {
        marginTop: 10
    },
    newTitle: {
        color: "#7a7a7a",
        fontSize: 18,
        marginTop: 5,
        // marginLeft: 10
    },
    newText: {
        color: "#9e9e9e",
        // marginLeft: 12,
        fontSize: 14
    },

    cardCont: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
        // width: 380,
        maxWidth: 480,
        minWidth: 370,
        marginTop: 30,
        marginBottom: 150

    },
    column: {
        width: "100%",
        // backgroundColor: "yellow",
        // maxWidth: 480,
        // minWidth: 350,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: "100%",
        marginVertical: 10,
        height: 200,
        borderRadius: 10
    },
    img: {
        position: "absolute",
        height: 170,
        width: "92%",
        objectFit: "cover",
        // borderRadius: 30,
        marginHorizontal: "4%",
        marginVertical: 15,
        zIndex: 10
    },
    bgColor: {
        position: "absolute",
        height: 170,
        width: "92%",
        zIndex: 20,
        backgroundColor: "gray",
        opacity: 0.6,
        marginHorizontal: "4%",
        marginVertical: 15,
        // borderRadius: 30
    },
    textCont: {
        position: "absolute",
        zIndex: 10,
        bottom: 20,
        left: 10,
        zIndex: 30
    },
    location: {
        color: "white",
        fontSize: 18,
        marginTop: 10,
        marginLeft: 10
    },
    date: {
        color: "whitesmoke",
        marginLeft: 10,
        fontStyle: "italic",
        fontSize: 12
    },
    viewBtn: {
        width: 75,
        height: 75,
        borderRadius: 100,
        position: "absolute",
        backgroundColor: "#c5c5c5",
        zIndex: 30,
        bottom: 30,
        right: 30,

        // ffa96b color for border
    },
    viewBtnImg: {
        width: 50,
        height: 50,
        marginTop: -10
        // margin: 5
    },
    vBtn: {
        backgroundColor: "#fffffe",
        width: "90%",
        height: "90%",
        margin: "5%",
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center"

    },
    btmNav: {
        height: 80,
        width: "100%",
        // backgroundColor: "yellow",
        position: "absolute",
        bottom: 0,
        flexDirection: "row"
    },
    btn1Cont: {
        // backgroundColor: "green",
        width: "30%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
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
        alignItems: "center",
        justifyContent: "center"
    },

    btn1: {
        // backgroundColor: "blue",
        height: 70,
        width: 70,
        // marginVertical: 20,
        // marginHorizontal: 10,
        borderRadius: 100,
        justifyContent: "center",
        alignContent: 'center',
    },
    btnImg: {
        height: 30,
        width: 30,
        marginHorizontal: 20,
    },
    btnImgE: {
        height: 34,
        width: 34,
        marginHorizontal: 18,
    },
    btnCamImg: {
        height: 40,
        width: 40,
        marginHorizontal: 15,
    },
    btn2: {

        height: 70,
        width: 70,
        justifyContent: "center",
        alignContent: 'center',
    },
    btn3: {
        // backgroundColor: "blue",
        height: 70,
        width: 70,

        justifyContent: "center",
        alignContent: 'center',
    },

    btnText: {
        width: "100%",
        textAlign: "center",
        fontWeight: "bold",
        color: "#9b9b9b",
        marginTop: 3
    },

    viewScreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

        maxWidth: 480,
        minWidth: "100%",
        minHeight: "100%"
    },
    viewImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        top: 0
    },
    closeBtn: {
        width: 50,
        height: 50,
        backgroundColor: "#fffffe",
        borderWidth: 3,
        borderColor: "black",
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center"
    },
    closeBtnImg: {
        width: 20,
        height: 20
    },

    removeBtnCont: {
        position: "absolute",
        width: 90,
        height: 90,
        backgroundColor: "#f4b2b0",
        position: "absolute",
        bottom: 60,
        right: 30,
        borderRadius: 100
    },
    removeBtn: {
        width: 80,
        height: 80,
        backgroundColor: "#fffffe",
        margin: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 100
    },
    removeBtnImg: {
        width: 50,
        height: 50
    },

    detailsCont: {
        position: "absolute",
        bottom: 20,
        marginTop: 30,
        left: "5%",
        width: "90%",
        backgroundColor: "#fffffe",
        padding: 20,
        borderRadius: 50
    },

})
