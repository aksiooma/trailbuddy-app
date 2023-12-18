
// utils/fetchGPXData.js
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import tj from '@mapbox/togeojson';

const fetchGPXData = (filePaths) => {
    return Promise.all(filePaths.map(filePath => {
      const storage = getStorage();
      const pathReference = ref(storage, filePath);
  
      return getDownloadURL(pathReference)
        .then((url) => fetch(url))
        .then(response => response.text())
        .then(gpxData => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(gpxData, 'text/xml');
          return tj.gpx(xmlDoc);
        });
    }));
  };
  
  
  export default fetchGPXData;
  
