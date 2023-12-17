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
  loginMethod: string; // Add this prop to accept the login method
  setIsRegistrationCompleted: (isComplete: boolean) => void;
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
  onBookNowClick: () => void; // This function will be called when the button is clicked
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
}


export type BikeSizeKey = 'Small' | 'Medium' | 'Large';


export interface BikeDetailProps {
  bike: Bike;
  selectedSize: string;
  Small: number;
  Medium: number;
  Large: number;
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

}

export interface BookingFormProps {
  setLoginMethod: React.Dispatch<React.SetStateAction<string>>;
 
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


//Reservation related
export interface ReservationItem {
  bikeId: string;
  name: string;
  quantity: number;
  startDate: Date;
  endDate: Date | null; 
  reservationId ?: string;
  price: number;
  size: BikeSizeKey;
}

export interface Reservation {
  id: any;
  bikeId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  quantity: number;
  size: BikeSizeKey;

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
export type BasketItem = {
  startDate: Date;
  endDate?: Date | null;
  name: string;
  quantity: number;
  price: number;
  size: string;
  reservationId?: string;
};

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
  width: 1500,
  height: 500,
  quality: 100,
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
  onSelectTrack: (track: string | null) => void;
  tracks: Track[];
  onMapLoad: (loaded: boolean | ((prevState: boolean) => boolean)) => void;
 
}

//Accordion

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  className: string;
  ariaLabel: string;
}
