

export interface Bike {
  id: string;
  name: string;
  stock: number;
  desc?: string;
  image?: string;

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
  [date: string]: number; 
  
};


// export interface SelectedBike {
//   bike: Bike;
//   size: 'Small' | 'Medium' | 'Large';
//   quantity: number;
//   dates: { start: Date; end: Date };
// }
