//mapsApi/mapbox.tsx
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import fetchGPXData from '../utils/fetchGPXData';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../FirestoreInit';
import { TrackProps } from '../Types/types';

if (typeof process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN === 'undefined') {
    throw new Error('Mapbox access token is not defined');
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const MapboxComponent = forwardRef<any, TrackProps>(({ selectedTrack, onSelectTrack, tracks, onMapLoad, enhancedStyle, isFullScreen }, ref) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const allConvertedDataRef = useRef<any[]>([]);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Expose map methods to parent component
    useImperativeHandle(ref, () => ({
        fitBounds: (bounds: [[number, number], [number, number]], options: any) => {
            if (mapRef.current) {
                mapRef.current.fitBounds(bounds, options);
            }
        },
        resize: () => {
            if (mapRef.current) {
                setTimeout(() => {
                    mapRef.current?.resize();
                }, 100);
            }
        }
    }));

    // initialize map once
    useEffect(() => {
        if (mapRef.current || tracks.length === 0) return;

        const map = new mapboxgl.Map({
            container: 'map',
            style: enhancedStyle 
                ? 'mapbox://styles/mapbox/outdoors-v12' // Parempi tyyli maastopyöräilyyn
                : 'mapbox://styles/teijov/clpqu9lrf013l01pagio68b6v',
            center: [24.9384, 60.1699],
            zoom: 10
        });

        // add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // add scale control
        map.addControl(new mapboxgl.ScaleControl({
            maxWidth: 100,
            unit: 'metric'
        }), 'bottom-right');

        mapRef.current = map;

        // handle map loading
        map.on('load', () => {
            setMapInitialized(true);
            setIsLoading(false);
            loadTracks(map);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [tracks.length]); // depends on tracks.length, not enhancedStyle

    // update map style if it changes
    useEffect(() => {
        if (mapRef.current && mapInitialized) {
            const styleId = enhancedStyle
                ? 'mapbox://styles/mapbox/outdoors-v12'
                : 'mapbox://styles/teijov/clpqu9lrf013l01pagio68b6v';
                
            // check if getStyle() returns an object and has a name property
            const currentStyle = mapRef.current.getStyle();
            if (currentStyle && currentStyle.name !== styleId) {
                mapRef.current.setStyle(styleId);
                
                // important: add event listener for style load
                mapRef.current.once('style.load', () => {
                    // reload tracks after style change
                    if (mapRef.current) {
                        loadTracks(mapRef.current);
                    }
                });
            }
        }
    }, [enhancedStyle, mapInitialized]);

    // add new useEffect, which handles all tracks
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapInitialized || tracks.length === 0) return;

        // update track colors
        tracks.forEach((track) => {
            const layerId = `route-layer-${track.name}`;
            if (map.getLayer(layerId)) {
                const isSelected = selectedTrack === track.name;
                map.setPaintProperty(layerId, 'line-color', isSelected ? '#ef4444' : '#8b5cf6');
                map.setPaintProperty(layerId, 'line-width', isSelected ? 5 : 3);
            }
        });
    }, [selectedTrack, mapInitialized, tracks]);

    // modify loadTracks function with useCallback-hook
    const loadTracks = useCallback(async (map: mapboxgl.Map) => {
        try {
            const fetchGPXFilePaths = async () => {
                const querySnapshot = await getDocs(collection(db, "gpx"));
                return querySnapshot.docs.map(doc => doc.data().path);
            };

            // clear old tracks carefully
            tracks.forEach((track) => {
                const sourceId = `route-${track.name}`;
                const layerId = `route-layer-${track.name}`;
                const shadowLayerId = `${layerId}-shadow`;
                const clickAreaId = `click-area-${track.name}`;
                
                // remove layers and sources first
                try {
                    if (map.getLayer(layerId)) map.removeLayer(layerId);
                    if (map.getLayer(shadowLayerId)) map.removeLayer(shadowLayerId);
                    if (map.getLayer(clickAreaId)) map.removeLayer(clickAreaId);
                    if (map.getSource(sourceId)) map.removeSource(sourceId);
                } catch (e) {
                    console.warn(`Error removing layers/sources for ${track.name}:`, e);
                }
            });

            const gpxFilePaths = await fetchGPXFilePaths();       
            const allConvertedData = await fetchGPXData(gpxFilePaths);
            allConvertedDataRef.current = allConvertedData;

            // process tracks
            tracks.forEach((track, index) => {
                if (index >= allConvertedData.length) {
                    console.warn(`No data for track: ${track.name}`);
                    return;
                }
                
                const convertedData = allConvertedData[index];
                if (!convertedData || !convertedData.features || convertedData.features.length === 0) {
                    console.warn(`Invalid data for track: ${track.name}`);
                    return;
                }
                
                const sourceId = `route-${track.name}`;
                const layerId = `route-layer-${track.name}`;
                const shadowLayerId = `${layerId}-shadow`;
                const clickAreaId = `click-area-${track.name}`;

                // check again if source already exists
                if (map.getSource(sourceId)) {
                    console.warn(`Source ${sourceId} already exists, skipping...`);
                    return;
                }

                // add track
                try {
                    map.addSource(sourceId, { type: 'geojson', data: convertedData });
                    
                    // add shadow
                    map.addLayer({
                        id: shadowLayerId,
                        type: 'line',
                        source: sourceId,
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': '#000',
                            'line-width': 7,
                            'line-opacity': 0.4,
                            'line-blur': 3
                        }
                    });
                    
                    // add visible track
                    map.addLayer({
                        id: layerId,
                        type: 'line',
                        source: sourceId,
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': selectedTrack === track.name ? '#ef4444' : '#8b5cf6',
                            'line-width': selectedTrack === track.name ? 5 : 3,
                            'line-opacity': 0.8
                        }
                    });
                    
                    // add larger click area (invisible)
                    map.addLayer({
                        id: clickAreaId,
                        type: 'line',
                        source: sourceId,
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': 'transparent',
                            'line-width': 15, // Huomattavasti leveämpi klikkausalue
                            'line-opacity': 0
                        }
                    });
                    
                } catch (error) {
                    console.error(`Error adding track ${track.name}:`, error);
                }
                
                // Lisää hover-efekti klikkausalueelle (vain kursori)
                map.on('mouseenter', clickAreaId, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                
                map.on('mouseleave', clickAreaId, () => {
                    map.getCanvas().style.cursor = '';
                });
                
                // Lisää click ha   ndler laajemmalle klikkausalueelle
                map.on('click', clickAreaId, () => {
                    onSelectTrack(track.name);
                    
                    // highlight selected track visually
                    tracks.forEach(t => {
                        const tLayerId = `route-layer-${t.name}`;
                        if (map.getLayer(tLayerId)) {
                            map.setPaintProperty(
                                tLayerId,
                                'line-color',
                                t.name === track.name ? '#ef4444' : '#8b5cf6'
                            );
                            map.setPaintProperty(
                                tLayerId,
                                'line-width',
                                t.name === track.name ? 5 : 3
                            );
                        }
                    });
                    
                    // zoom to track
                    if (track.bounds) {
                        map.fitBounds(track.bounds, {
                            padding: 50,
                            duration: 1000
                        });
                    }
                });
                
                // calculate bounds
                if (convertedData.features && convertedData.features.length > 0) {
                    let minLon = Infinity;
                    let maxLon = -Infinity;
                    let minLat = Infinity;
                    let maxLat = -Infinity;

                    convertedData.features.forEach((feature: { geometry?: { type: string; coordinates: number[][] } }) => {
                        if (feature.geometry && feature.geometry.type === 'LineString') {
                            feature.geometry.coordinates.forEach((coord: number[]) => {
                                const [lon, lat] = coord;
                                minLon = Math.min(minLon, lon);
                                maxLon = Math.max(maxLon, lon);
                                minLat = Math.min(minLat, lat);
                                maxLat = Math.max(maxLat, lat);
                            });
                        }
                    });

                    // save bounds data to track object
                    if (minLon !== Infinity && maxLon !== -Infinity && minLat !== Infinity && maxLat !== -Infinity) {
                        track.bounds = [[minLon, minLat], [maxLon, maxLat]];
                    }
                }
            });

            onMapLoad(true);
        } catch (error) {
            console.error("Error loading tracks:", error);
        }
    }, [tracks, selectedTrack, onSelectTrack, onMapLoad]);

    // add this useEffect after map initialization
    useEffect(() => {
        if (mapInitialized && mapRef.current && tracks.length > 0) {
            // Aseta viive, jotta kartta ehtii alustua kunnolla
            const timer = setTimeout(() => {
                if (mapRef.current) {
                    loadTracks(mapRef.current);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mapInitialized, tracks.length, loadTracks]);

    // update map size when fullscreen state changes
    useEffect(() => {
        const currentMap = mapRef.current;
        if (currentMap) {
            setTimeout(() => {
                // use stored reference
                currentMap.resize();
                
                // if track is selected, center on it
                if (selectedTrack) {
                    const track = tracks.find(t => t.name === selectedTrack);
                    if (track && track.bounds) {
                        currentMap.fitBounds(track.bounds, {
                            padding: 50,
                            duration: 1000
                        });
                    }
                }
            }, 100);
        }
    }, [isFullScreen, selectedTrack, tracks]);

    return (
        <div
            id="map"
            ref={mapContainerRef}
            style={{ 
                height: isFullScreen ? '100vh' : '100%',
                width: '100%',
                borderRadius: isFullScreen ? '0' : '10px',
                overflow: 'hidden'
            }}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="inline-block p-6 rounded-2xl">
                            <svg className="animate-spin h-10 w-10 text-cyan-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                           
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

MapboxComponent.displayName = 'MapboxComponent';

export default MapboxComponent;