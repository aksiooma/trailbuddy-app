'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    'nav.booking': 'Booking',
    'nav.trailMaps': 'Trail Maps',
    'nav.aboutUs': 'About Us',

    // Main section
    'main.welcome': 'Welcome',
    'main.welcomePart1': 'Trail',
    'main.welcomePart2': 'Buddy',
    'main.subtitle': 'Your trail adventure starts here',
    'main.bookNow': 'Book Now',
    'main.descriptionPart1': 'Your ',
    'main.fictional': 'fictional',
    'main.descriptionPart2': ' MTB-rental companion and trail advisor',

    // Bike selector
    'bike.select': 'Select a bike',
    'bike.size': 'Select size',
    'bike.accessories': 'Accessories',
    'bike.continue': 'Continue to booking',
    'bike.selected': 'Selected',
    'bike.perDay': '/day',
    'bike.unavailable': 'Not available',

    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.about': 'About',
    'footer.booking': 'Booking',
    'footer.maps': 'Maps',
    'footer.disclaimer': 'Disclaimer: This website is a demo created for portfolio purposes only. The services and information presented here are entirely fictional and not intended for real-world use.',
    'footer.images': 'Images',
    'footer.imagesDisclaimer': 'on this site are used for educational purposes under fair use. This site is not commercial and is intended as a showcase of web development skills.',
    'footer.allRights': 'All Rights Reserved',

    // BikeDetail
    'bikeDetail.description': 'Description',
    'bikeDetail.specifications': 'Specifications',
    'bikeDetail.sizing': 'Sizing',
    'bikeDetail.dailyRate': 'Daily Rate',
    'bikeDetail.disclaimerWord': 'Disclaimer',
    'bikeDetail.disclaimerText': 'Images used in the bike-selection component are for educational purposes only. This project is not for commercial use.',

    // Booking section
    'booking.title': 'Book Your Ride',
    'booking.subtitle': 'Select a bike, choose your dates (max 7 days), and hit the trails with our premium electric mountain bikes.',
    'booking.selectBike': 'Select Your Bike',
    'booking.completeReservation': 'Complete Your Reservation',
    'booking.makeReservation': 'Make a Reservation',
    'booking.selectDates': 'Select Dates',
    'booking.selectAccessories': 'Add Accessories',
    'booking.basePrice': 'Base price',
    'booking.totalPrice': 'Total price',
    'booking.addToBasket': 'Add to Basket',
    'booking.adding': 'Adding...',
    'booking.selectBikeToContinue': 'Select a bike to continue',
    'booking.selectSizeToContinue': 'Select a size to continue',
    'booking.days': 'Days',
    'booking.basePriceTotal': 'Base price total',

    // Login
    'login.existingUser': 'Existing User Login',
    'login.email': 'Email',
    'login.emailPlaceholder': 'Enter your email',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter your password',
    'login.loginButton': 'Login',
    'login.loggingIn': 'Logging in...',
    'login.errorMessage': 'Login failed. Please check your email and password.',
    'login.forgotPassword': 'Forgot your password?',
    'login.resetHere': 'Reset here',
    'login.title': 'Login to Continue',
    'login.subtitle': 'Sign in to access our bike rental services',
    'login.orContinueWith': 'Or continue with',
    'login.continueWithGoogle': 'Continue with Google',
    'login.continueAsGuest': 'Continue as Guest',
    'login.createAccount': 'Create Account',
    'login.signIn': 'Sign In',
    'login.processing': 'Processing...',
    'login.invalidCredentials': 'Invalid email or password',

    // Accessories
    'accessories.helmet': 'Helmet',
    'accessories.lock': 'Lock',
    'accessories.lights': 'Lights',
    'accessories.bottle': 'Water Bottle',

    // Basket
    'basket.title': 'Your Basket',
    'basket.empty': 'Your basket is empty',
    'basket.startShopping': 'Start shopping',
    'basket.item': 'Item',
    'basket.quantity': 'Quantity',
    'basket.price': 'Price',
    'basket.actions': 'Actions',
    'basket.total': 'Total',
    'basket.checkout': 'Proceed to Checkout',
    'basket.remove': 'Remove',
    'basket.confirmRemove': 'Are you sure you want to remove this item?',
    'basket.yes': 'Yes',
    'basket.no': 'No',
    'basket.confirmCheckout': 'Confirm your reservation',
    'basket.confirmCheckoutMessage': 'Are you sure you want to proceed with this reservation?',
    'basket.back': 'Back to Shopping',
    'basket.confirm': 'Confirm Reservation',
    'basket.yourBasket': 'Your Basket',
    'basket.emptyBasket': 'Your basket is empty',
    'basket.date': 'Date',
    'basket.size': 'Size',
    'basket.accessories': 'Accessories',
    'basket.proceedToCheckout': 'Proceed to Checkout',
    'basket.days': 'Days',

    // Checkout
    'checkout.contactInformation': 'Contact Information',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.payAtRetrieval': 'Pay at the retrieval',
    'checkout.confirmBooking': 'Confirm Booking',

    // TrailMaps
    'trailmaps.title': 'Trail Maps',
    'trailmaps.showMap': 'Show Map',
    'trailmaps.hideMap': 'Hide Map',
    'trailmaps.fullscreen': 'Fullscreen',
    'trailmaps.exitFullscreen': 'Exit',
    'trailmaps.loading': 'Loading map...',
    'trailmaps.description': 'Explore our interactive trail maps to find the perfect route for your mountain biking adventure. Click "Show Map" to view the available trails.',
    'trailmaps.subtitle': 'Explore our curated collection of mountain biking trails', 
    'trailmaps.loadingMap': 'Loading map...',
    'trailmaps.loadingGPX': 'Loading GPX...',
    'trailmaps.loadingGPXMap': 'Loading GPX map...',
    'trailmaps.loadingGPXMapError': 'Error loading GPX map. Please try again later.',
    'trailmaps.loadingGPXMapSuccess': 'GPX map loaded successfully.',
    'trailmaps.fullScreen': 'Full Screen',
    'trailmaps.exitFullScreen': 'Exit Full Screen',
    'trailmaps.loadingMapError': 'Error loading map. Please try again later.',
    'trailmaps.loadingMapSuccess': 'Map loaded successfully.',  
    'trailmaps.loadingGPXError': 'Error loading GPX. Please try again later.',
    'trailmaps.loadingGPXSuccess': 'GPX loaded successfully.',
    'trailmaps.showTrackList': 'Track List',
    'trailmaps.hideTrackList': 'Hide',
    'trailmaps.trackList': 'Track List',
    'trailmaps.trackListEmpty': 'No tracks available',
    'trailmaps.trackListError': 'Error loading track list. Please try again later.',
    'trailmaps.trackListSuccess': 'Track list loaded successfully.',
    'trailmaps.trackListLoading': 'Loading track list...',
    'trailmaps.focusOnMap': 'Focus on Map',
    'trailmaps.downloadGPX': 'Download GPX',
    'trailmaps.loginRequired': 'Login Required',
    'trailmaps.loginMessage': 'Login to see and explore our trail maps. Our collection of mountain biking trails is available to registered users.',
    
    // DatePicker
    'datepicker.available': 'Available',
    'datepicker.limited': 'Limited',
    'datepicker.booked': 'Booked',
    'datepicker.previousMonth': 'Previous Month',
    'datepicker.nextMonth': 'Next Month',
    'datepicker.selectedRange': 'Selected date range: {start} - {end} ({days} days)',
    'datepicker.maxRangeMessage': 'You can only select a date range of up to 7 days.',
    'datepicker.selectRange': 'Select a date range of up to 7 days.',
    'datepicker.rangeLimit': 'Limited',
    // Registration
    'registration.title': 'Create Account',
    'registration.subtitle': 'Fill in your details to create a new account',
    'registration.firstName': 'First Name',
    'registration.lastName': 'Last Name',
    'registration.email': 'Email',
    'registration.phone': 'Phone',
    'registration.password': 'Password',
    'registration.username': 'Username',
    'registration.firstNamePlaceholder': 'Enter your first name',
    'registration.lastNamePlaceholder': 'Enter your last name',
    'registration.emailPlaceholder': 'Enter your email address',
    'registration.phonePlaceholder': 'Enter your phone number',
    'registration.passwordPlaceholder': 'Create a password',
    'registration.usernamePlaceholder': 'Choose a username (optional)',
    'registration.register': 'Register',
    'registration.processing': 'Processing...',
    'registration.invalidEmail': 'Invalid email format',
    'registration.invalidPhone': 'Invalid phone number',
    'registration.invalidName': 'Name should only contain alphabets and spaces',
    'registration.invalidPassword': 'Password should be minimum of eight characters, and contain at least one letter and one number',
    'registration.emailInUse': 'This email address is already in use. Please try another one or log in.',
    'registration.generalError': 'An error occurred during registration. Please try again.',
    'registration.updateError': 'Error updating profile. Please try again.',
    'registration.back': 'Back',

    // Modal
    'modal.close': 'Close',
    'modal.back': 'Back',

    // About
    'about.title': 'About Us',
    'about.subtitle': 'Our Story',
    'about.disclaimer': 'This is a fictional mtb-booking website.',
    'about.mission': 'Our mission is straightforward: to provide easy, hassle-free mountain bike rentals that get you onto the trails quickly.',
    'about.goal': 'We created this platform with a clear goal – making your mountain biking adventures as accessible and enjoyable as possible. We know the excitement of hitting the trails, and we believe that renting a quality mountain bike should be simple and straightforward.',
    'about.offering': "Our website offers a handpicked selection of top-notch mountain bikes suitable for all skill levels. The process is easy: choose your bike, book it, and you're ready to ride. No fuss, no complications.",
    'about.community': "We're not just a rental service; we're a community of outdoor enthusiasts and mountain biking fans. We're here to share tips, trail recommendations, and the latest in biking gear.",
    'about.conclusion': "So, whether you're a seasoned rider or new to the sport, we're here to help you dive straight into the thrill of mountain biking. Get ready to explore the trails with ease!",
  },
  fi: {
    // Navbar
    'nav.booking': 'Varaus',
    'nav.trailMaps': 'Reittikartat',
    'nav.aboutUs': 'Tietoa meistä',

    // Main section
    'main.welcome': 'Tervetuloa',
    'main.welcomePart1': 'Trail',
    'main.welcomePart2': 'Buddy',
    'main.subtitle': 'Polkuseikkailusi alkaa täältä',
    'main.bookNow': 'Varaa nyt',
    'main.descriptionPart1': ' ',
    'main.fictional': 'Kuvitteellinen',
    'main.descriptionPart2': ' maastopyörävuokraamosi ja reittioppaasi',

    // Bike selector
    'bike.select': 'Valitse pyörä',
    'bike.size': 'Valitse koko',
    'bike.accessories': 'Lisävarusteet',
    'bike.continue': 'Jatka varaukseen',
    'bike.selected': 'Valittu',
    'bike.perDay': '/päivä',
    'bike.unavailable': 'Ei saatavilla',

    // Footer
    'footer.quickLinks': 'Pikalinkit',
    'footer.about': 'Tietoa',
    'footer.booking': 'Varaus',
    'footer.maps': 'Kartat',
    'footer.disclaimer': 'Vastuuvapauslauseke: Tämä sivusto on luotu vain portfoliotarkoituksiin. Esitetyt palvelut ja tiedot ovat täysin kuvitteellisia eikä niitä ole tarkoitettu todelliseen käyttöön.',
    'footer.images': 'Kuvat',
    'footer.imagesDisclaimer': 'tällä sivustolla on käytetty opetuskäyttöön fair use -periaatteen mukaisesti. Tämä sivusto ei ole kaupallinen ja on tarkoitettu vain web-kehitystaitojen esittelyyn.',
    'footer.allRights': 'Kaikki oikeudet pidätetään',

    // BikeDetail
    'bikeDetail.description': 'Kuvaus',
    'bikeDetail.specifications': 'Tekniset tiedot',
    'bikeDetail.sizing': 'Koot',
    'bikeDetail.dailyRate': 'Päivähinta',
    'bikeDetail.disclaimerWord': 'Vastuuvapauslauseke',
    'bikeDetail.disclaimerText': 'Pyöränvalintakomponentissa käytetyt kuvat ovat vain opetuskäyttöön. Tämä projekti ei ole kaupallinen.',

    // Booking section
    'booking.title': 'Varaa Pyöräsi',
    'booking.subtitle': 'Valitse pyörä, valitse päivämäärät (max 7 päivää) ja lähde poluille huippuluokan sähkömaastopyörillämme.',
    'booking.selectBike': 'Valitse Pyörä',
    'booking.completeReservation': 'Viimeistele Varauksesi',
    'booking.makeReservation': 'Tee Varaus',
    'booking.selectDates': 'Valitse Päivämäärät',
    'booking.selectAccessories': 'Lisää Varusteita',
    'booking.basePrice': 'Perushinta',
    'booking.totalPrice': 'Kokonaishinta',
    'booking.addToBasket': 'Lisää Koriin',
    'booking.adding': 'Lisätään...',
    'booking.selectBikeToContinue': 'Valitse pyörä jatkaaksesi',
    'booking.selectSizeToContinue': 'Valitse koko jatkaaksesi',
    'booking.days': 'Päivät',
    'booking.basePriceTotal': 'Perushinta yhteensä',

    // Login
    'login.existingUser': 'Kirjaudu Sisään',
    'login.email': 'Sähköposti',
    'login.emailPlaceholder': 'Syötä sähköpostiosoitteesi',
    'login.password': 'Salasana',
    'login.passwordPlaceholder': 'Syötä salasanasi',
    'login.loginButton': 'Kirjaudu',
    'login.loggingIn': 'Kirjaudutaan...',
    'login.errorMessage': 'Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.',
    'login.forgotPassword': 'Unohditko salasanasi?',
    'login.resetHere': 'Nollaa tästä',
    'login.title': 'Kirjaudu sisään',
    'login.subtitle': 'Kirjaudu sisään käyttääksesi pyörävuokrauspalveluamme',
    'login.orContinueWith': 'Tai jatka',
    'login.continueWithGoogle': 'Jatka Google-tilillä',
    'login.continueAsGuest': 'Jatka vierailijana',
    'login.createAccount': 'Luo uusi tili',
    'login.signIn': 'Kirjaudu',
    'login.processing': 'Käsitellään...',
    'login.invalidCredentials': 'Virheellinen sähköposti tai salasana',
 

    // Accessories
    'accessories.helmet': 'Kypärä',
    'accessories.lock': 'Lukko',
    'accessories.lights': 'Valot',
    'accessories.bottle': 'Vesipullo',

    // Basket
    'basket.title': 'Ostoskorisi',
    'basket.empty': 'Ostoskorisi on tyhjä',
    'basket.startShopping': 'Aloita ostokset',
    'basket.item': 'Tuote',
    'basket.quantity': 'Määrä',
    'basket.price': 'Hinta',
    'basket.actions': 'Toiminnot',
    'basket.total': 'Yhteensä',
    'basket.checkout': 'Siirry Kassalle',
    'basket.remove': 'Poista',
    'basket.confirmRemove': 'Haluatko varmasti poistaa tämän tuotteen?',
    'basket.yes': 'Kyllä',
    'basket.no': 'Ei',
    'basket.confirmCheckout': 'Vahvista varauksesi',
    'basket.confirmCheckoutMessage': 'Haluatko varmasti jatkaa tällä varauksella?',
    'basket.back': 'Takaisin Ostoksille',
    'basket.confirm': 'Vahvista Varaus',
    'basket.yourBasket': 'Ostoskorisi',
    'basket.emptyBasket': 'Ostoskorisi on tyhjä',
    'basket.date': 'Päivämäärä',
    'basket.size': 'Koko',
    'basket.accessories': 'Lisävarusteet',
    'basket.proceedToCheckout': 'Siirry kassalle',
    'basket.days': 'Päivät',

    // Checkout
    'checkout.contactInformation': 'Yhteystiedot',
    'checkout.firstName': 'Etunimi',
    'checkout.lastName': 'Sukunimi',
    'checkout.email': 'Sähköposti',
    'checkout.phone': 'Puhelinnumero',
    'checkout.paymentMethod': 'Maksutapa',
    'checkout.payAtRetrieval': 'Maksu noudettaessa',
    'checkout.confirmBooking': 'Vahvista varaus',

    // TrailMaps
    'trailmaps.title': 'Reittikartat',
    'trailmaps.subtitle': 'Tutustu valikoimaamme maastopyöräilyreittejä',
    'trailmaps.showMap': 'Näytä Kartta',
    'trailmaps.hideMap': 'Piilota Kartta',
    'trailmaps.loading': 'Ladataan...',
    'trailmaps.loadingMap': 'Ladataan karttaa...',
    'trailmaps.downloadGPX': 'Lataa GPX',
    'trailmaps.loginRequired': 'Kirjautuminen Vaaditaan',
    'trailmaps.loginMessage': 'Kirjaudu sisään nähdäksesi ja tutkiaksesi reittikarttojamme. Valikoimamme maastopyöräilyreittejä on saatavilla rekisteröityneille käyttäjille.',
    'trailmaps.fullscreen': 'Koko näyttö',
    'trailmaps.exitFullscreen': 'Poistu koko näytöstä',
    'trailmaps.description': 'Tutki interaktiivisia reittikarttojamme löytääksesi täydellisen reitin maastopyöräilyseikkailuusi. Klikkaa "Näytä kartta" nähdäksesi saatavilla olevat reitit.',
    'trailmaps.loadingMapError': 'Kartan lataaminen epäonnistui. Yritä uudelleen.',
    'trailmaps.loadingMapSuccess': 'Kartta latautui onnistuneesti.',
    'trailmaps.loadingGPXError': 'GPX-tiedoston lataaminen epäonnistui. Yritä uudelleen.',
    'trailmaps.loadingGPXSuccess': 'GPX-tiedosto latautui onnistuneesti.',
    'trailmaps.loadingGPXMapError': 'GPX-kartan lataaminen epäonnistui. Yritä uudelleen.',
    'trailmaps.loadingGPXMapSuccess': 'GPX-kartta latautui onnistuneesti.',
    'trailmaps.fullScreen': 'Koko näyttö',
    'trailmaps.exitFullScreen': 'Poistu koko näytöstä',
    'trailmaps.loadingGPXMap': 'Ladataan GPX-karttaa...',
    'trailmaps.showTrackList': 'Reittilista',
    'trailmaps.hideTrackList': 'Piilota reittilista',
    'trailmaps.trackList': 'Reittilista',
    'trailmaps.trackListEmpty': 'Ei reittejä saatavilla',
    'trailmaps.trackListError': 'Reittilistan lataaminen epäonnistui. Yritä uudelleen.',
    'trailmaps.trackListSuccess': 'Reittilista latautui onnistuneesti.',
    'trailmaps.trackListLoading': 'Ladataan reittilistaa...',
    'trailmaps.focusOnMap': 'Keskitä reittiin',
    'trailmaps.openInMap': 'Avaa kartalla',
    'trailmaps.close': 'Sulje',
    
 

    // DatePicker
    'datepicker.available': 'Saatavilla',
    'datepicker.limited': 'Rajoitettu',
    'datepicker.booked': 'Varattu',
    'datepicker.previousMonth': 'Edellinen kuukausi',
    'datepicker.nextMonth': 'Seuraava kuukausi',
    'datepicker.selectedRange': 'Valittu ajanjakso: {start} - {end} ({days} päivää)',
    'datepicker.maxRangeMessage': 'Voit valita enintään 7 päivän ajanjakson.',
    'datepicker.selectRange': 'Valitse enintään 7 päivän ajanjakso.',
    'datepicker.rangeLimit': 'Rajoitettu',

    // Registration
    'registration.title': 'Luo tili',
    'registration.subtitle': 'Täytä tietosi luodaksesi uuden tilin',
    'registration.firstName': 'Etunimi',
    'registration.lastName': 'Sukunimi',
    'registration.email': 'Sähköposti',
    'registration.phone': 'Puhelinnumero',
    'registration.password': 'Salasana',
    'registration.username': 'Käyttäjänimi',
    'registration.firstNamePlaceholder': 'Syötä etunimesi',
    'registration.lastNamePlaceholder': 'Syötä sukunimesi',
    'registration.emailPlaceholder': 'Syötä sähköpostiosoitteesi',
    'registration.phonePlaceholder': 'Syötä puhelinnumerosi',
    'registration.passwordPlaceholder': 'Luo salasana',
    'registration.usernamePlaceholder': 'Valitse käyttäjänimi (valinnainen)',
    'registration.register': 'Rekisteröidy',
    'registration.processing': 'Käsitellään...',
    'registration.invalidEmail': 'Virheellinen sähköpostiosoite',
    'registration.invalidPhone': 'Virheellinen puhelinnumero',
    'registration.invalidName': 'Nimen tulee sisältää vain kirjaimia ja välilyöntejä',
    'registration.invalidPassword': 'Salasanan tulee olla vähintään kahdeksan merkkiä pitkä ja sisältää vähintään yksi kirjain ja yksi numero',
    'registration.emailInUse': 'Tämä sähköpostiosoite on jo käytössä. Kokeile toista tai kirjaudu sisään.',
    'registration.generalError': 'Rekisteröinnissä tapahtui virhe. Yritä uudelleen.',
    'registration.updateError': 'Profiilin päivityksessä tapahtui virhe. Yritä uudelleen.',
    'registration.back': 'Takaisin',
    // Modal
    'modal.close': 'Sulje',
    'modal.back': 'Takaisin',

    // About
    'about.title': 'Tietoa meistä',
    'about.subtitle': 'Tarinamme',
    'about.disclaimer': 'Tämä on kuvitteellinen maastopyörävuokraussivusto.',
    'about.mission': 'Tehtävämme on yksinkertainen: tarjota helppoja ja vaivattomia maastopyörävuokrauksia, jotka saavat sinut poluille nopeasti.',
    'about.goal': 'Loimme tämän alustan selkeällä tavoitteella – tehdä maastopyöräilyseikkailuistasi mahdollisimman helppoja ja nautinnollisia. Tiedämme, kuinka jännittävää on päästä poluille, ja uskomme, että laadukkaan maastopyörän vuokraamisen pitäisi olla yksinkertaista ja suoraviivaista.',
    'about.offering': 'Verkkosivustomme tarjoaa valikoiman huippuluokan maastopyöriä, jotka sopivat kaikille taitotasoille. Prosessi on helppo: valitse pyöräsi, varaa se ja olet valmis ajamaan. Ei turhia mutkia.',
    'about.community': 'Emme ole vain vuokrauspalvelu; olemme ulkoilmaharrastajien ja maastopyöräilyn ystävien yhteisö. Olemme täällä jakamassa vinkkejä, polkusuosituksia ja uusimpia pyöräilyvarusteita.',
    'about.conclusion': 'Joten, oletpa sitten kokenut ajaja tai lajin uusi harrastaja, olemme täällä auttamassa sinua sukeltamaan suoraan maastopyöräilyn jännitykseen. Valmistaudu tutkimaan polkuja!',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 