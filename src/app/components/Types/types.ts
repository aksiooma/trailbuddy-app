import { User } from "firebase/auth";
import { Firestore, Timestamp } from "firebase/firestore";

//Registeration and Login related
export interface RegistrationUserData {
    user: User | null;
    token: string | undefined;
};

export interface RegistrationFormProps {
  registrationUserData: RegistrationUserData;
  setIsProfileComplete: (isComplete: boolean) => void;
  loginMethod: string;
  setIsRegistrationCompleted: (isComplete: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FirebaseError {
  code: string;
  message: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  loginMethod: string;
}

// The prop types for MainSection
export type MainSectionProps = {
  onBookNowClick: () => void;
};

export interface NavbarProps {
  onBookingClick: () => void;
  onTrailMapsClick: () => void;
  onAboutUsClick: () => void;
}


//Bike related
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
  alt: string;
}

export interface BikeSelectorProps {
  onSelectBike: (bike: Bike) => void;
  selectedBike: Bike | null;
  onSizeSelect: (size: BikeSizeKey) => void;
  selectedSize: BikeSizeKey | null; 
  accessories: { id: string; name: string; price: number }[];
  selectedAccessories: string[];
  setSelectedAccessories: React.Dispatch<React.SetStateAction<string[]>>;
  handleAccessoryToggle: (accessoryId: string) => void;
  getAvailableStockForSize: (size: BikeSizeKey) => number;
  startDate: Date | null;
  datePickerRef: React.RefObject<HTMLDivElement>;
  userLoggedIn: boolean;
}


export type BikeSizeKey = 'Small' | 'Medium' | 'Large';


export interface BikeDetailProps {
  bike: Bike;
  selectedSize: string;
  Small: number;
  Medium: number;
  Large: number;
}

export interface Track {
  name: string;
  description: string;
  path: string;
  bounds?: [[number, number], [number, number]];
  geoJson?: any;
} 

export interface TrackProps {
  selectedTrack: string | null;
  onSelectTrack: (trackName: string) => void;
  tracks: Track[];
  onMapLoad: (loaded: boolean | ((prevState: boolean) => boolean)) => void;
  enhancedStyle?: boolean;
  isFullScreen?: boolean; // Lisätty tämä
}

//Booking Related
export interface BookingFlowProps {
  selectedBike: Bike | null; 
  user: User | null;
  onLogout: () => void;
  selectedSize: BikeSizeKey | null;
  loginMethod: string;
  isProfileComplete: boolean;
  setIsProfileComplete: (isComplete: boolean) => void;
  setRegistrationModalOpen: (isOpen: boolean) => void;
  setIsRegistrationCompleted: (isComplete: boolean) => void;
  isRegistrationCompleted: boolean;
  selectedAccessories: string[];
  setSelectedAccessories: React.Dispatch<React.SetStateAction<string[]>>;
  accessories: { id: string; name: string; price: number }[];
  handleAccessoryToggle: (accessoryId: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  selectedBikeAvailableStock: number;
  dateAvailability: AvailabilityData;
  setSelectedBikeAvailableStock: React.Dispatch<React.SetStateAction<number>>;
  setDateAvailability: React.Dispatch<React.SetStateAction<AvailabilityData>>;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>; 
  datePickerRef: React.RefObject<HTMLDivElement>;
}


export interface BookingProps {
  selectedBike: Bike | null;
  selectedSize: string | null;
  setIsRegistrationCompleted: (isComplete: boolean) => void;
  isRegistrationCompleted: boolean;
  handleAccessoryToggle: (accessoryId: string) => void;
  selectedAccessories: string[];
  setSelectedAccessories: React.Dispatch<React.SetStateAction<string[]>>;
  accessories: { id: string; name: string; price: number }[];
  startDate: Date | null;
  endDate: Date | null;
  selectedBikeAvailableStock: number;
  dateAvailability: AvailabilityData;
  setSelectedBikeAvailableStock: React.Dispatch<React.SetStateAction<number>>;
  setDateAvailability: React.Dispatch<React.SetStateAction<AvailabilityData>>;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  datePickerRef: React.RefObject<HTMLDivElement>;
  userLoggedIn: boolean;
  setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
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


//Reservation related
export interface ReservationItem {
  bikeId: string;
  name: string;
  quantity: number;
  startDate: Date;
  endDate: Date | null;
  reservationId: string;
  price: number;
  size: string;
  accessories?: string[];
}

export interface Reservation {
  id?: string;
  bikeId: string;
  name: string;
  quantity: number;
  startDate: any;
  endDate: any;
  status: string;
  createdAt: any;
  size: BikeSizeKey;
  accessories?: string[];
}

//DatePicker:
export interface BookingDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  availabilityData: AvailabilityData;
  selectedBike: Bike | null;
  selectedSize: BikeSizeKey | null; // Add this
 
}


//Basket related
export interface BasketItem extends ReservationItem {
    // BasketItem perii kaikki ReservationItem:n kentät
    totalPrice?: number; // Lisätään totalPrice-kenttä
    days?: number; // Lisätään days-kenttä
}

export type Basket = BasketItem[];
export type RemoveFromBasketFunction = (index: number) => void;

export type BasketComponentProps = {
    basket: Basket;
    removeFromBasket: RemoveFromBasketFunction;
    onCheckoutClick: () => void;
    user: User | null;
    IsExtendedViewVisible: boolean;
    onHandleCheckout: () => void;
    showConfirmation: boolean;
    showDatepicker: boolean;
    loginMethod: string;
    setBasket: React.Dispatch<React.SetStateAction<ReservationItem[]>>;
    db: Firestore;
    setIsRegistrationCompleted: (isComplete: boolean) => void;
    isRegistrationCompleted: boolean;

};


//Images
export const commonImageProps = {
  width: 750,
  height: 450,
  quality: 50,

};

export const heroImageProps = {
  width: 1500,
  height: 500,
  quality: 65,
};


//Maps related
export interface Track {
  name: string;
  description: string;
  path: string;
}

export interface DownloadUrls {
  [key: string]: string;
}


export interface TrackProps {
  selectedTrack: string | null;
  onSelectTrack: (trackName: string) => void;
  tracks: Track[];
  onMapLoad: (loaded: boolean | ((prevState: boolean) => boolean)) => void;
  enhancedStyle?: boolean;
}

//Accordion

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  className: string;
  ariaLabel: string;
}
