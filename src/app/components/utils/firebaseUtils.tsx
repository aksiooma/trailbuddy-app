import { Track } from '../Types/types';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../FirestoreInit';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import fetchGPXData from "./fetchGPXData"

export const fetchGPXDataWithDetails = async (tracks: Track[]) => {

    if (!tracks || tracks.length === 0) {
      console.error("No tracks data provided to fetchGPXDataWithDetails");
      return [];
    }
  
    const convertedTracks = await fetchGPXData(tracks.map(track => track.path));
  
    return tracks.map((track, index) => ({
      ...track,
      geojsonData: convertedTracks[index]
    }));
  };
  
  export const fetchGPXTracks = async (): Promise<Track[]> => {
    const querySnapshot = await getDocs(collection(db, "gpx"));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (typeof data.name === 'string' && typeof data.description === 'string' && typeof data.path === 'string') {
        return { name: data.name, description: data.description, path: data.path };
      } else {
        throw new Error("Invalid track data format");
      }
    });
  };

  export const fetchDownloadUrl = (filePath: string) => {
    return new Promise<string>((resolve, reject) => {
      const storage = getStorage();
      const pathReference = ref(storage, filePath);

      getDownloadURL(pathReference)
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  