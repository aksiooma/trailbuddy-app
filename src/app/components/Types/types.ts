import { User } from "firebase/auth";

export type RegistrationUserData = {
    user: User | null;
    token: string | undefined;
};


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
  selectedSize: BikeSizeKey | null; 
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
  selectedSize: string | null;
  setIsRegistrationCompleted: (isComplete: boolean) => void;
  isRegistrationCompleted: boolean;
 
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

export interface ReservationItem {
  bikeId: string;
  name: string;
  quantity: number;
  startDate: Date;
  endDate: Date | null; // Allow endDate to be null
  reservationId ?: string; // ID of the reservation document
  price: number;
  size: BikeSizeKey;
}