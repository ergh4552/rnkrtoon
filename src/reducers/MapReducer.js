import {
    PERMISSION_REQUEST,
    LOCATION_CHANGED,
    LOCATION_CIRCLE_CHANGED,
    LOCATION_RESOLVING,
    LOCATION_TIMEDOUT,
    NEAREST_RECYCLING_POINTS
} from '../actions/types';

const INITIAL_STATE = {
    currentregion: {
        latitude: 65,
        longitude: 25,
        latitudeDelta: 0.031,
        longitudeDelta: 0.031
    },
    radius: 500,
    loading: true,
    permission: false,
    retrylocation: false,
    error: '',
    recycling: null
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PERMISSION_REQUEST:
            return { ...state, permission: true };
        case LOCATION_CHANGED:
            return { ...state, permission: true, loading: false, currentregion: action.payload };
        case LOCATION_CIRCLE_CHANGED:
            return { ...state, radius: action.payload };
        case LOCATION_RESOLVING:
            return { ...state, loading: true };
        case LOCATION_TIMEDOUT:
            return { ...state, retrylocation: true };
        case NEAREST_RECYCLING_POINTS:
            return { ...state, recycling: action.payload };
        default:
            return state;
    }
};
