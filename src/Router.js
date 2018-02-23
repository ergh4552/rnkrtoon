import React from 'react';
import { Scene, Router, Actions } from 'react-native-router-flux';
import LandingPage from './components/LandingPage';

const RouterComponent = () => {
    return (
        <Router sceneStyle={{ paddingTop: 1 }}>

            <Scene key="main">
                <Scene
                    key="nearest"
                    component={LandingPage}
                    title="Kiertoon"
                    initial
                />
            </Scene>
        </Router>
    );
};

export default RouterComponent;
