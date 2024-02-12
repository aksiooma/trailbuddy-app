//Footer.tsx
import Logo from "../../../public/assets/IGSD-logo.svg";
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
       

        <div className="mb-6 md:mb-0">
          <p className="font-semibold mb-2">Quick Links</p>
          <ul className="text-sm">
            <li className="hover:text-gray-300"><a href="#about">About</a></li>
            <li className="hover:text-gray-300"><a href="#booking">Booking</a></li>
            <li className="hover:text-gray-300"><a href="#trailmaps">Maps</a></li>
          </ul>
        </div>

        <p className="text-xs mt-2 mb-6 md:mb-0">
          <span className="font-bold text-rose-700">Disclaimer:</span> This website is a demo created for portfolio purposes only. <br></br> The services and information presented here are entirely fictional and<br></br> not intended for real-world use. <span className="font-bold text-rose-700"><br></br><br></br>Images</span> on this site are used for educational purposes under fair use.<br></br>This site is not commercial and is intended as a showcase of web development skills.
        </p>

        <div className="mb-6 md:mb-0">
          <p className="text-lg font-bold mt-2">TrailBuddy</p>
          <p className="text-md font-bold mt-2">Teijo Virta</p>
          <div className="flex p-2">
            <a href="https://github.com/aksiooma/" target="_blank" rel="noopener noreferrer" className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="hover:bg-rose-700/50 rounded-full transition-colors duration-200" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg></a>
            <a href="https://teijovirta.com" rel="noopener noreferrer" className="hover:bg-rose-700/50 rounded-full transition-colors duration-200">
              <Image 
                priority={false}
                src={Logo}
                alt="Check out my portfolio"
                height={52}
                width={52}
              />
            </a>
          </div>
          <p className="text-sm">&copy; 2023 All Rights Reserved</p>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;
