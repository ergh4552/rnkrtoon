// Import libraries for making a component
// AIzaSyBYgmGMRQXp4loWHCAWJJg4dhLCakvadXc
import React, {Component} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    PermissionsAndroid,
    TouchableOpacity,
    Text,    
    BackHandler
} from 'react-native';

import { connect } from 'react-redux';
import Communications from 'react-native-communications';
import MapView from 'react-native-maps';
import { locationChanged, circleChanged, findLocation, requestGeolocationPermission } from '../actions';
import { Card, CardSection, Input, Button, Spinner } from './common';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = height;
const SCREEN_WIDTH = width;
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const permissionsGranted = false;

const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

// Make a component
class LandingPage extends Component {
    
    componentWillMount() {
        console.log('componentWillMount');
        console.log(this.props);
        // Start with getting the permissions to use geolocation
        if (!permissionsGranted) this.props.requestGeolocationPermission();
    }

    componentDidMount() {
        console.log('componentDidMount');
        BackHandler.addEventListener('hardwareBackPress', () => this.backAndroid()) // Listen for the hardware back button on Android to be pressed
    }    

    componentWillUpdate() {
        console.log('componentWillUpdate');
        if (!permissionsGranted && this.props.permission) 
        {
            permissionsGranted = true;
            this.props.findLocation(this.props.radius);
        }    
    }

    componentWillReceiveProps(nextProps) {
        console.log('componentWillReceiveProps');
        console.log(this.props);
        console.log(nextProps);
        if (!this.props.permission && nextProps.permission) {
            nextProps.findLocation(this.props.radius);
        }    
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => this.backAndroid()) // Remove listener
    }

    backAndroid() {
        console.log('backAndroid');
        if (Actions.state.index === 0) {
            return false;
        }        
        Actions.pop() // Return to previous screen
        return true // Needed so BackHandler knows that you are overriding the default action and that it should not close the app
    }    
    fitAllMarkers() {
        console.log('fitAllMarkers');
        console.log(this.props);
        this.map.fitToCoordinates(this.props.recycling.points, {
          edgePadding: DEFAULT_PADDING,
          animated: true,
        });
    }    
    fitDistanceMarkers(distance) {
        console.log('fitDistanceMarkers:' + distance);
        console.log(this.props);
        let subSet = this.props.recycling.points.filter(x => x.etaisyys < distance) ;
        if (subSet.length > 0) {
            this.map.fitToCoordinates(subSet, {
                edgePadding: DEFAULT_PADDING,
                animated: true,
            });
        };
    }    
    renderButton(distance, distanceText)
    {
        return (
        <TouchableOpacity
            key={distanceText}
            onPress={() => this.fitDistanceMarkers(distance)}
            style={[styles.bubble, styles.button]}
            >
            <Text>{distanceText}</Text>
        </TouchableOpacity>
        );
    }
    renderMap()
    {
        if (this.props.recycling != null) {
            let subSet1km = this.props.recycling.points.filter(x => x.etaisyys < 1) ;
            let subSet3km = this.props.recycling.points.filter(x => x.etaisyys < 3) ;
            let subSet5km = this.props.recycling.points.filter(x => x.etaisyys < 5) ;
            let buttons = [] ;
            if (subSet1km.length > 0 ) buttons.push(this.renderButton(1, '1 km')) ;
            if (subSet3km.length > 0 ) buttons.push(this.renderButton(3, '3 km')) ;
            if (subSet5km.length > 0 ) buttons.push(this.renderButton(5, '5 km')) ;
            buttons.push(this.renderButton(100, 'Kaikki')) ;
            console.log(buttons) ;
            return (
                <View style={styles.container}>
                    <MapView
                        ref={ref => { this.map = ref; }}
                        style={styles.map}
                        region={this.props.currentregion}>
                        {this.props.recycling.points.map(marker => (
                            <MapView.Marker
                                key={marker.paikka_id}
                                coordinate={marker.coord}
                                title={marker.osoite}
                                description={marker.lajit}
                            />
                        ))}
                    </MapView>
                    <View style={styles.buttonContainer}>
                        {buttons}
                    </View>                    
                </View>
            );

        }
        else {
            return (
                <View style={styles.container}>
                    <MapView
                        ref={ref => { this.map = ref; }}
                        style={styles.map}
                        region={this.props.currentregion}>
                    </MapView>
                </View>
            );
        }    

    }
    render() {
        console.log('render');
        console.log(this.props);
        if (this.props.retrylocation) {
            this.props.findLocation(this.props.radius);
        }
        else {
            if (this.props.permission && this.props.loading) return (
                <View style={styles.container}>
                    <Spinner />
                </View>);
            if (!this.props.permission) return (
                <View style={styles.container}>
                    <Spinner />
                </View>);
            if (this.props.permission && !this.props.loading) return this.renderMap();
        }    
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
      },
      bubble: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
      },
      button: {
        marginTop: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
      },
      buttonContainer: {
        position: 'absolute',
        bottom: 5,
        flexDirection: 'row',
        alignContent: 'space-between',
        marginVertical: 20,
        backgroundColor: 'transparent',
      },      
    })

const mapStateToProps = ( state ) => {
    const { currentregion, radius, error, loading, permission, retrylocation, recycling } = state.mapreducer;
    return { currentregion, radius, error, loading, permission, retrylocation, recycling };
};

export default connect(mapStateToProps, {
    locationChanged, circleChanged, findLocation, requestGeolocationPermission
})(LandingPage);
