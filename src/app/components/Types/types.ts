

export interface Bike {
  id: string;
  name: string;
  stock: number;
  desc?: string;
  image?: string;
  price: number;

}

export interface BikeSelectorProps {
  onSelectBike: (bike: Bike) => void;
  selectedBike: Bike | null;
}

export interface BikeDetailProps {
  bike: Bike;
}


export interface BookingProps {
  selectedBike: Bike | null;
}

export type AvailabilityData = {
  [date: string]: {
    [bikeId: string]: number;
  };
};

// Common image properties
export const commonImageProps = {
  width: 1500,
  height: 500,
  quality: 100,
};


// export interface SelectedBike {
//   bike: Bike;
//   size: 'Small' | 'Medium' | 'Large';
//   quantity: number;
//   dates: { start: Date; end: Date };
// }
