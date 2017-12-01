import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import { Permissions, Location, MapView } from 'expo'
import { MAP_STYLE_SILVER } from 'espy/configs/map-config'
import LocationSearch from 'espy/components/location-search'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 1000
}

class Map extends Component {
    state = {
        userLocation: { latitude: 18.9256, longitude: 72.8242 },
        mapRegion: {
            latitude: 18.9256,
            longitude: 72.8242,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        }
    }

    componentWillMount () {
        Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged)
    }

    locationChanged = (location) => {
        let { latitude, longitude } = location.coords
        let mapRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.05
        }
        let userLocation = { latitude, longitude }
        this.setState({ userLocation, mapRegion }, () => {
            this.props
                .storePersonLocation({ id: 'Stockholm', lat: 59.3293, long: 18.0686 })
                .then((response) => console.log('respone : ', response))
                .catch((e) => console.log('error: ', e))
        })
    }

    handleMapRegionChange = (mapRegion) => {
        this.setState({ mapRegion })
    }

    handleLocationSelect = (data, details) => {
        let { description } = data
        let { geometry: { location: { lat, lng } } } = details

        // TODO: place marker using this info.
    }

    render () {
        let { userLocation, mapRegion } = this.state

        return (
            <View style={styles.container}>
                <LocationSearch onLocationSelect={this.handleLocationSelect} />
                <MapView
                    showsUserLocation
                    followsUserLocation
                    showsMyLocationButton
                    provider={MapView.PROVIDER_GOOGLE}
                    customMapStyle={MAP_STYLE_SILVER}
                    style={styles.map}
                    region={mapRegion}
                    onRegionChangeComplete={this.handleMapRegionChange}
                    showsScale
                    showsCompass
                    showsPointsOfInterest
                    showsTraffic
                    zoomEnabled
                    loadingEnabled
                >
                    <MapView.Marker coordinate={userLocation} />
                </MapView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    radius: {
        height: 50,
        width: 50,
        borderRadius: 50 / 2,
        backgroundColor: 'rgba(128,128,128, 0.2)',
        borderWidth: 1,
        borderColor: 'rgb(128,128,128)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    marker: {
        height: 20,
        width: 20,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 20 / 2,
        overflow: 'hidden',
        backgroundColor: '#007FAA'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    map: {
        flex: 1,
        zIndex: -1
    }
})

const storePersonLocationConfig = {
    props: ({ ownProps, mutate }) => ({
        storePersonLocation: ({ id, lat, long }) => mutate({ variables: { id, lat, long } })
    })
}
const storePersonLocation = gql`
    mutation addPersonLocation($id: ID!, $lat: Float!, $long: Float!) {
        addPersonLocation(id: $id, lat: $lat, long: $long) {
            id
            lat
            long
        }
    }
`

export default compose(graphql(storePersonLocation, storePersonLocationConfig))(Map)
