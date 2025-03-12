//TrailMapsSection.tsx
import React, { useState, useContext, useEffect, forwardRef, useRef } from 'react';
import MapboxComponent from './mapsApi/mapbox'
import { AuthContext } from '../context/AuthContext';
import { Track, DownloadUrls } from './Types/types';
import { fetchGPXTracks, fetchGPXDataWithDetails, fetchDownloadUrl } from './utils/firebaseUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const TrailMapsSection = forwardRef<HTMLDivElement>((props, ref) => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTrackList, setShowTrackList] = useState(true);
  const mapRef = useRef<any>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapLoad = (loaded: boolean | ((prevState: boolean) => boolean)) => {
    if (typeof loaded === 'boolean') {
      setIsMapLoaded(loaded);
    } else {
      setIsMapLoaded((prev) => loaded(prev));
    }
    setIsLoading(false);
  };

  const handleToggleMap = async () => {
    if (!showMap) {
      setIsLoading(true);
      if (!tracks.length) {
        try {
          const trackDetails = await fetchGPXTracks();
          const detailedTracks = await fetchGPXDataWithDetails(trackDetails);
          setTracks(detailedTracks);
        } catch (error) {
          console.error("Error fetching tracks:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    setShowMap(!showMap);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);

    // show track list always when going to fullscreen
    setShowTrackList(true);

    // let map adjust to new size
    setTimeout(() => {
      if (mapRef.current && typeof mapRef.current.resize === 'function') {
        mapRef.current.resize();
      }
    }, 100);
  };

  const toggleTrackList = () => {
    setShowTrackList(!showTrackList);
  };

  useEffect(() => {
    tracks.forEach((track) => {
      fetchDownloadUrl(track.path)
        .then((url) => {
          setDownloadUrls((prevUrls) => ({ ...prevUrls, [track.path]: url }));
        })
        .catch((error) => {
          console.error("Error fetching download URL:", error);
        });
    });
  }, [tracks]);

  const selectTrackOnMap = (trackName: string) => {
    if (trackName === selectedTrack) {
      setSelectedTrack(null);
    } else {
      setSelectedTrack(trackName);

      // in mobile, hide track list when track is selected
      if (isFullScreen && window.innerWidth < 768) {
        setShowTrackList(false);
      }

      // zoom to selected track
      if (mapRef.current && typeof mapRef.current.fitBounds === 'function') {
        const selectedTrackData = tracks.find(track => track.name === trackName);
        if (selectedTrackData && selectedTrackData.bounds) {
          mapRef.current.fitBounds(selectedTrackData.bounds, {
            padding: 50,
            duration: 1000
          });
        }
      }
    }
  };

  const containerClass = isFullScreen
    ? 'fixed inset-0 z-50 bg-black/95 overflow-hidden'
    : 'relative py-16 bg-gradient-to-b from-zinc-900 to-zinc-950';

  const contentClass = isFullScreen
    ? 'h-screen overflow-hidden'
    : 'container mx-auto px-4 max-w-7xl';

  return (
    <div ref={ref} className={containerClass} id="trailmaps">
      <div className={contentClass}>
        {!isFullScreen && (
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-white font-metrophic"
            >
              {t('trailmaps.title') || 'Trail Maps'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto font-schibsted"
            >
              {t('trailmaps.description') || 'Discover and explore our curated collection of mountain biking trails. View detailed maps, download GPX files, and plan your next adventure.'}
            </motion.p>
          </div>
        )}

        {user ? (
          <div className="relative">
            <div className={`flex flex-wrap gap-4 ${isFullScreen ? 'absolute top-4 left-4 z-20' : 'mb-6 justify-center'}`}>
              {!isFullScreen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleMap}
                  disabled={isLoading}
                  className="group relative inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-all duration-200 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(45deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.9))',
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <span className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-cyan-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  )}
                  <span className="relative">
                    {showMap ? t('trailmaps.hideMap') : t('trailmaps.showMap')}
                  </span>
                </motion.button>
              )}

              {showMap && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleFullScreen}
                    className="group relative inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-all duration-200 ease-in-out rounded-lg"
                    style={{
                      background: isFullScreen
                        ? 'linear-gradient(45deg, rgba(239, 68, 68, 0.9), rgba(236, 72, 153, 0.9))'
                        : 'linear-gradient(45deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9))',
                      boxShadow: isFullScreen
                        ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                        : '0 4px 20px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <span className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-violet-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {isFullScreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/>
                    
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    )}
                  
                    <span className="relative">
                      {isFullScreen ? t('trailmaps.exitFullscreen') : t('trailmaps.fullscreen')}
                    </span>
                  </motion.button>

                  {isFullScreen && window.innerWidth >= 768 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleTrackList}
                      className="group relative inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-all duration-200 ease-in-out rounded-lg"
                      style={{
                        background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.9))',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <span className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-emerald-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showTrackList ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                      </svg>
                      <span className="relative">
                        {showTrackList ? t('trailmaps.hideTrackList') || 'Hide' : t('trailmaps.showTrackList') || 'List'}
                      </span>
                    </motion.button>
                  )}
                </>
              )}
            </div>

            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={isFullScreen ? 'absolute inset-0' : 'relative'}
                >
                  <div className={isFullScreen ? 'h-screen w-screen relative' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                    {/* Map lower z-index*/}
                    <div
                      className={`
                        relative overflow-hidden 
                        ${isFullScreen ? 'h-full w-full z-10' : 'h-[500px] rounded-xl border border-zinc-800/50'}
                        ${!isFullScreen && !showTrackList ? 'lg:col-span-2' : ''} 
                      `}
                    >
                      {/* Loading animation */}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
                          <div className="text-center">
                            <div className="inline-block p-6 bg-zinc-900/90 rounded-2xl">
                              <svg className="animate-spin h-10 w-10 text-cyan-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <p className="mt-4 text-white font-medium">{t('trailmaps.loadingMap') || 'Loading map...'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="h-full w-full">
                        <MapboxComponent
                          ref={mapRef}
                          selectedTrack={selectedTrack}
                          onSelectTrack={selectTrackOnMap}
                          tracks={tracks}
                          onMapLoad={handleMapLoad}
                          enhancedStyle={true}
                          isFullScreen={isFullScreen}
                        />
                      </div>
                    </div>

                    {/* Track list Z-index highest */}
                    {showTrackList && (
                      <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ duration: 0.3 }}
                        className={`
                          ${isFullScreen
                            ? 'absolute right-0 top-16 bottom-0 w-80 md:w-96 bg-zinc-900/90 backdrop-blur-md border-l border-zinc-800/50 overflow-auto z-20 rounded-l-xl'
                            : ''}
                        `}
                      >
                        <div className="p-4 space-y-4">
                          {tracks.map((track, index) => (
                            <motion.div
                              key={track.name}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden hover:border-cyan-500/30 transition-colors duration-200"
                            >
                              <button
                                onClick={() => selectTrackOnMap(track.name)}
                                className={`w-full p-4 text-left transition-all duration-200 ${selectedTrack === track.name
                                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300'
                                  : 'hover:bg-white/5'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{track.name}</span>
                                  <svg
                                    className={`w-5 h-5 transition-transform duration-200 ${selectedTrack === track.name ? 'rotate-180 text-cyan-300' : 'text-zinc-400'
                                      }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>

                              <AnimatePresence>
                                {selectedTrack === track.name && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-4 border-t border-zinc-700/50 bg-gradient-to-b from-cyan-900/10 to-blue-900/10"
                                  >
                                    <p className="text-zinc-300 mb-4">{track.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                      <a
                                        href={downloadUrls[track.path]}
                                        download
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 transition-all duration-200"
                                      >
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        {t('trailmaps.downloadGPX') || 'Download GPX'}
                                      </a>
                                      <button
                                        onClick={() => {
                                          if (mapRef.current && typeof mapRef.current.fitBounds === 'function') {
                                            const selectedTrackData = tracks.find(t => t.name === track.name);
                                            if (selectedTrackData && selectedTrackData.bounds) {
                                              mapRef.current.fitBounds(selectedTrackData.bounds, {
                                                padding: 50,
                                                duration: 1000
                                              });
                                            }
                                          }
                                        }}
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 transition-all duration-200"
                                      >
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                        {t('trailmaps.focusOnMap') || 'Focus on Map'}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* track list button Fullscreen */}
                    {isFullScreen ? (
                        !showTrackList ? (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTrackList}
                                className="absolute bottom-4 right-4 z-30 p-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </motion.button>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTrackList}
                                className="absolute bottom-4 right-4 z-30 p-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        )
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6">
              <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">{t('trailmaps.loginRequired') || 'Login Required'}</h3>
            <p className="text-zinc-400 max-w-md mx-auto">{t('trailmaps.loginMessage') || 'Please log in to view and explore our trail maps. Our curated collection of mountain biking trails is available for registered users.'}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
});

TrailMapsSection.displayName = 'TrailMapsSection';

export default TrailMapsSection;
