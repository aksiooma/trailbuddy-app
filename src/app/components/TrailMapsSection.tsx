//TrailMapsSection.tsx
import React, { useState, useContext, useEffect, forwardRef } from 'react';
import MapboxComponent from './mapsApi/mapbox'
import { AuthContext } from './AuthContext';
import { Track, DownloadUrls } from './Types/types';
import { fetchGPXTracks, fetchGPXDataWithDetails, fetchDownloadUrl } from './utils/firebaseUtils';
import { motion, AnimatePresence } from 'framer-motion';

const TrailMapsSection = forwardRef<HTMLDivElement>((props, ref) => {
  const { user } = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false)

  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const handleMapLoad = (loaded: boolean | ((prevState: boolean) => boolean)) => {
    setIsMapLoaded(loaded);
  };
  
  const handleToggleMap = async () => {
    setShowMap(!showMap);
    if (!showMap && !tracks.length) {
      try {
        const trackDetails = await fetchGPXTracks();
        const detailedTracks = await fetchGPXDataWithDetails(trackDetails);
        setTracks(detailedTracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    }
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
    setSelectedTrack(trackName === selectedTrack ? null : trackName);
  };


  return (

    <div ref={ref} className='trailmaps-container mb-10 pb-10' id='trailmaps'>
      <h2 className='text-3xl sm:text-1xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-6 text-shadow text-center pt-10'>Trail Maps</h2>
      <div className="trail-maps-section flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg relative w-full max-w-4xl mx-auto">
        {user &&
          <button onClick={handleToggleMap} className='mb-4 z-20 bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-900/50 text-white font-bold rounded-full transition-colors duration-200 py-2 px-4 self-center'>
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        }
        {user && showMap && (
          <>
            <div className="w-full h-full h-60 mt-4">
              <MapboxComponent selectedTrack={selectedTrack} onSelectTrack={setSelectedTrack} tracks={tracks} onMapLoad={handleMapLoad} />
            </div>
            {isMapLoaded && (
              <AnimatePresence><motion.div
                className="max-w-4xl mx-auto my-4 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}>
                {tracks.map((track, index) => (
                  <div key={index} className="mb-5 border-gray-500/50 mt-5">
                    <button
                      onClick={() => selectTrackOnMap(track.name)}
                      className="bg-teal-500/50 border-2 border-white-500/50 hover:bg-blue-900/50 text-white text-lg rounded-full transition-colors duration-200 p-2 rounded-md w-full text-left"
                    >
                      {track.name}
                    </button>
                    {selectedTrack === track.name && (
                      <div className="p-4 border border-gray-300 rounded-md mt-2">
                        <p className='mb-3 text-lg'>{track.description}</p>
                        <a
                          href={downloadUrls[track.path]}
                          download
                          className="text-blue-600 hover:underline text-lg"
                        >
                          Download GPX
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div></AnimatePresence>
            )}
          </>
        )}
        {!user && (
          <p>User must be logged in to view the map</p>
        )}
      </div>
    </div>
  );
});
TrailMapsSection.displayName = 'TrailMapsSection';

export default TrailMapsSection;
