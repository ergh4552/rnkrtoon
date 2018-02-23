import { Actions } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import { PermissionsAndroid } from 'react-native';


import {
    PERMISSION_REQUEST,
    LOCATION_CHANGED,
    LOCATION_CIRCLE_CHANGED,
    LOCATION_RESOLVING,
    LOCATION_TIMEDOUT,
    NEAREST_RECYCLING_POINTS
} from './types';

const lajiluettelo = [
    ['100', 'Sekajäte'],
    ['101', 'Bio - ja puutarhajäte'],
    ['102', 'Energiajäte'],
    ['103', 'Paperi'],
    ['104', 'Pahvi'],
    ['105', 'Kartonki'],
    ['106', 'Metalli'],
    ['107', 'Lasi'],
    ['108', 'Vaarallinen jäte'],
    ['109', 'Sähkölaitteet(SER)'],
    ['110', 'Paristot'],
    ['111', 'Muovi'],
    ['113', 'Tekstiili'],
    ['114', 'Muu jäte'],
    ['115', 'Akut'],
    ['116', 'Lamput'],
    ['117', 'Puu'],
    ['118', 'Kyllästetty puu'],
    ['119', 'Rakennus - ja purkujäte']
];


const nearestRecyclingPointsFetched = false;

const regionFrom = (latitude, longitude, distance) => {
    distance = distance / 2
    const circumference = 40075
    const oneDegreeOfLatitudeInMeters = 111.32 * 1000
    const angularDistance = distance / circumference

    const latitudeDelta = distance / oneDegreeOfLatitudeInMeters
    const longitudeDelta = Math.abs(Math.atan2(
        Math.sin(angularDistance) * Math.cos(latitude),
        Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(latitude)))

    return result = {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    }
};

export const locationChanged = (dispatch, position, distance) => {
    console.log("locationChanged");
    currentregion = regionFrom(position.coords.latitude, position.coords.longitude, distance);

    dispatch ({
        type: LOCATION_CHANGED,
        payload: currentregion
    });
    if (!nearestRecyclingPointsFetched) {
        nearestRecyclingPointsFetched = true;
        getNearestRecyclingPoints(dispatch, position, distance / 1000);
    }
};

export const circleChanged = (radius) => {
    return {
        type: LOCATION_CIRCLE_CHANGED,
        payload: radius
    };
};

export const requestGeolocationPermission = () => {
    return (dispatch) => {
        try {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Kiertoon tarvitsee paikannuksen',
                    'message': 'Kiertoon tarvitsee paikannuksen jotta ' +
                        'lähimmät kierrätyspistyeet voi näyttää.'
                }
            ).then(function (granted) {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    dispatch({ type: PERMISSION_REQUEST });
                    console.log("You can use the location");
                } else {
                    console.log("Geolocation permission denied")
                }
                });

        } catch (err) {
            console.warn(err)
        }
    }
}    

export const findLocation = (distance) => {
    return (dispatch) => {
        console.log('findLocation')
        dispatch({ type: LOCATION_RESOLVING });

        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position);
            locationChanged(dispatch, position, distance);
        },
            (error) => {
                console.log(error);
                dispatch({ type: LOCATION_TIMEDOUT });},
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 })
    };

    Actions.main();
};

/*
http://kierratys.info/2.0/genxml.php?lat=60.2222&lng=25.08888
*/
const apiUri = 'http://kierratys.info/2.0/genxml.php?';


export const getNearestRecyclingPoints = (dispatch, position, distance) => {
    console.log(position);
    let url = apiUri + 'lat=' + position.coords.latitude + '&lng=' + position.coords.longitude + '&limit=4';
    console.log("Fetching " + url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                try {
                    var xml2js = require('xml2js');
                    var parser = new xml2js.Parser();
                    parser.parseString(response._bodyText, function (err, result) {
                        extractedData = result['response']['markers'];
                        var exd = extractedData[0].marker;
                        var recyclingPoints = [];
                        for (var i = 0; i < exd.length; i++) {
                            var item = recyclingPoints.filter(function (it) {
                                return it.paikka_id === exd[i].$.paikka_id
                            });

                            if (item.length > 0) {
                                item[0].laji_id.push(exd[i].$.laji_id);
                            }
                            else {
                                var laji = [];
                                laji[0] = exd[i].$.laji_id;

                                var newPoint = {
                                    'paikka_id': exd[i].$.paikka_id,
                                    'aukiolo': exd[i].$.aukiolo,
                                    'etaisyys': exd[i].$.etaisyys,
                                    'latitude': Number(exd[i].$.lat),
                                    'longitude': Number(exd[i].$.lng),
                                    'coord': { 'latitude': Number(exd[i].$.lat), 'longitude': Number(exd[i].$.lng) },
                                    'laji_id': laji,
                                    'nimi': exd[i].$.nimi,
                                    'osoite': exd[i].$.osoite,
                                    'lajit': '',
                                }
                                recyclingPoints.push(newPoint);
                            }
                        }
                        var myMap = new Map(lajiluettelo);
                        for (var x = 0; x < recyclingPoints.length; x++) {
                            var lajit = '';
                            for (var z = 0; z < recyclingPoints[x].laji_id.length; z++) {
                                lajit = lajit + myMap.get(recyclingPoints[x].laji_id[z]) + ' ';
                            }
                            recyclingPoints[x].lajit = lajit;
                        }
                    
                        var pload = { 'extracted': extractedData, 'points': recyclingPoints };
                        dispatch({
                            type: NEAREST_RECYCLING_POINTS,
                            payload: pload
                        });
                  
                    });
                }
                catch (e) { 
                    console.log("Error " + e);
                }
            }
            else {
                console.log("Network requst did not work...");
            }    
        })
        .catch(error => {
            console.error(error);
         });
    /*
    dispatch({
        type: NEAREST_RECYCLING_POINTS,
        payload: recyclingPoints
    });
    */
};