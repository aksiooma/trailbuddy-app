

export interface Bike {
  id: string;
  name: string;
  stock: number;
  desc?: string;
  image?: string;
  price: number;
  specs: string
  Large: number;
  Medium: number;
  Small: number;
  sizing: string;
}

export interface BikeSelectorProps {
  onSelectBike: (bike: Bike) => void;
  selectedBike: Bike | null;
  onSizeSelect: (size: BikeSizeKey) => void;
  selectedSize: BikeSizeKey | null; // Add this line
}


export type BikeSizeKey = 'Small' | 'Medium' | 'Large';


export interface BikeDetailProps {
  bike: Bike;
  selectedSize: string;
  Small: number;
  Medium: number;
  Large: number;
}

export interface BookingProps {
  selectedBike: Bike | null;
  selectedSize: string | null; // Make it required here too
}

export interface AvailabilityData {
  [date: string]: {
      [bikeId: string]: {
          Small: number;
          Medium: number;
          Large: number;
      };
  };
}


// Common image properties
export const commonImageProps = {
  width: 1500,
  height: 500,
  quality: 100,
};


// export interface SelectedBike {
//   bike: Bike;
//   size: 'S' | 'M' | 'L';
//   quantity: number;
//   dates: { start: Date; end: Date };
// }
