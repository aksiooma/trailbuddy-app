//mapbox.tsx
import React, { useEffect, useState, useRef } from 'react';
import fetchGPXData from '../utils/fetchGPXData'
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css"
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../FirestoreInit';
import { TrackProps } from '../Types/types'


if (typeof process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN === 'undefined') {
    throw new Error('Mapbox access token is not defined');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const mapboxComponent: React.FC<TrackProps> = ({ selectedTrack, onSelectTrack, tracks, onMapLoad }) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const allConvertedDataRef = useRef<any[]>([]);

    useEffect(() => {
        if (mapRef.current || tracks.length === 0) return;

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/teijov/clpqu9lrf013l01pagio68b6v',
            center: [24.9384, 60.1699],
            zoom: 10
        });

        mapRef.current = map;

        const fetchGPXFilePaths = async () => {
            const querySnapshot = await getDocs(collection(db, "gpx"));
            return querySnapshot.docs.map(doc => doc.data().path);
        };

        const findTrackIdByLayerId = (layerId: string): string | null => {
            const track = tracks.find(track => `route-layer-${track.name}` === layerId);
            return track ? track.name : null;
        };


        map.on('load', async () => {
            try {
                const gpxFilePaths = await fetchGPXFilePaths();
                const allConvertedData = await fetchGPXData(gpxFilePaths);
                allConvertedDataRef.current = allConvertedData;

                allConvertedData.forEach((convertedData, index) => {
                    const trackName = tracks[index]?.name;
                    if (!trackName) {
                        console.error(`Track data at index ${index} is undefined`);
                        return;
                    }

                    const sourceId = `route-${trackName}`;
                    const layerId = `route-layer-${trackName}`;


                    map.addSource(sourceId, { type: 'geojson', data: convertedData });
                    map.addLayer({
                        id: layerId, type: 'line', source: sourceId, paint: {
                            'line-color': '#000',
                            'line-width': 5
                        }
                    });
                    onMapLoad(true);
                    map.on('click', layerId, () => {
                        const trackId = findTrackIdByLayerId(layerId);
                        onSelectTrack(trackId);
                    });
                });
            } catch (error) {
                console.error("Error loading GPX data: ", error);
            }
        });
    }, [tracks]);


    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        allConvertedDataRef.current.forEach((_, index) => {
            const layerId = `route-layer-${tracks[index].name}`;

            if (selectedTrack && layerId === `route-layer-${selectedTrack}`) {
                map.setPaintProperty(layerId, 'line-color', '#f11'); // Highlight color
            } else {
                map.setPaintProperty(layerId, 'line-color', '#000');
            }
        });
    }, [selectedTrack]);


    return <AnimatePresence><motion.div
        id="map"
        style={{ height: '50vh', width: '100%', borderRadius: '10px', overflow: 'hidden' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5 }}
    />
    </AnimatePresence>

};

export default mapboxComponent;
