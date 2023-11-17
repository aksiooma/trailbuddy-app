

export interface Bike {
  id: string;
  name: string;
  stock: number;
  desc?: string;
  image?: string;

}

export interface BikeSelectorProps {
  onSelectBike: (bike: Bike) => void;
  selectedBike: Bike | null; // Add this line
}

export interface BikeDetailProps {
  bike: Bike;
}

// Add this interface in the same file where your Bike type is declared
export interface BookingProps {
  selectedBike: Bike | null;
}

// Define a type for the availability data
export type AvailabilityData = {
  [date: string]: number; // maps a date string to a number indicating availability
};


// export interface SelectedBike {
//   bike: Bike;
//   size: 'Small' | 'Medium' | 'Large';
//   quantity: number;
//   dates: { start: Date; end: Date };
// }
