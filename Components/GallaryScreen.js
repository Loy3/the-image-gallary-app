import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ImageBackground } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import cardImg from "../assets/bg.png";
import logo from "../assets/logo.jpg";
import viewImg from "../assets/open.png";

import gallaryImgNav from "../assets/gallaryOff.png";
import camImgNav from "../assets/cameraOff2.png";
import exitImgNav from "../assets/power.png";
import closeBtnImg from "../assets/close.png";
import deleteBtnImg from "../assets/delete.png";

const GallaryScreen = () => {
    const db = SQLite.openDatabase('db.gallaryDb');
    const [gallary, setGallary] = useState([]);
    const [viewer, setViewer] = useState(false);
    const [gallaryToView, setGallaryToView] = useState(null);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const dayOfMonth = today.getDate();
    const monthOfYear = monthsOfYear[today.getMonth()];
    const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${monthOfYear}`;

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
                    setGallary(results.rows._array)
                    console.log(results.rows._array);
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
                        let existingLocations = [...gallary].filter(res => res.id !== id);
                        setGallary(existingLocations);
                    }
                },
                (txObj, error) => console.log(error)
            );
        });
        setViewer(false);
    }

    if (gallary === []) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        )
    }

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
                        {/* {console.log("gallary", gallary)} */}
                        <View style={{ borderBottomColor: '#7a7a7a', borderBottomWidth: 2, marginTop: 30, }} />

                        <View style={styles.cardCont}>
                            {gallary.map((gal, index) => (
                                <View key={index} style={styles.column}>
                                    <ImageBackground source={cardImg} style={styles.card}>
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
                            // source={{ uri: `file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540dev_loy%252Fthe-image-gallary-app/Camera/de181c75-5beb-409d-a70a-e0952c6e1b3a.jpg` }}
                        />
                        <View style={styles.detailsCont}>
                            <Text style={styles.locationd}>{gallaryToView.location}</Text>
                            {/* <Text style={styles.locationd}>Location</Text> */}
                            <Text style={styles.dated}>{gallaryToView.date}</Text>
                            {/* <Text style={styles.dated}>date</Text> */}
                        </View>

                        <View style={styles.removeBtnCont}>
                            <TouchableOpacity style={styles.removeBtn} onPress={() => deleteGallary(3)}>
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
                        {/* <View style={styles.wrap}> */}
                        <View style={styles.btn1}>
                            <Image
                                style={styles.btnImg}
                                source={gallaryImgNav}
                            />
                        </View>
                        {/* <Text>Gallary</Text> */}
                        {/* </View> */}
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
                </ImageBackground>
                :
                null
            }
        </View>
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
        marginTop: 60,
        marginBottom: 20,
        marginLeft: 10
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "500"
    },
    logoCont: {
        position: "absolute",
        top: 40,
        right: 5,
        backgroundColor: "#e5e2dd",
        borderRadius: 100
    },
    logo: {
        width: 100,
        height: 100,
        objectFit: "fill",
        borderRadius: 100,
        margin: 5
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
        height: 400,
        borderRadius: 10
    },
    img: {
        position: "absolute",
        height: "75%",
        width: "90%",
        objectFit: "cover",
        // borderRadius: 30,
        marginHorizontal: "5%",
        marginTop: "5%",
        zIndex: 10
    },
    bgColor: {
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 1,
        backgroundColor: "#fbfbf7",
        opacity: 0.4,
        // borderRadius: 30
    },
    textCont: {
        position: "absolute",
        zIndex: 10,
        bottom: 20,
        left: 10
    },
    location: {
        color: "#7a7a7a",
        fontSize: 18,
        marginTop: 10,
        marginLeft: 10
    },
    date: {
        color: "#9e9e9e",
        marginLeft: 12
    },
    viewBtn: {
        width: 75,
        height: 75,
        borderRadius: 100,
        position: "absolute",
        backgroundColor: "#c5c5c5",
        zIndex: 10,
        bottom: 30,
        right: 20,

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
        backgroundColor: "yellow",
        position: "absolute",
        bottom: 0,
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


    viewScreen: {
        // backgroundColor: "red",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // marginVertical: 10,
        // width: 380,
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


/*

               
                
                */