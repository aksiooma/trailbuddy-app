// components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <p className="text-lg font-bold">TrailBuddy</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} All Rights Reserved</p>
          
        </div>

        <p className="text-xs mt-2">
            <span className="font-bold text-rose-700">Disclaimer:</span> This website is a demo created for portfolio purposes only. <br></br> The services, products, and information presented here are entirely fictional and<br></br> not intended for real-world use. <span className="font-bold text-rose-700"><br></br><br></br>Images</span> on this site are used for educational purposes under fair use.<br></br>This site is not commercial and is intended as a showcase of web development skills.
          </p>

        <div>
          <p className="font-semibold mb-2">Quick Links</p>
          <ul className="text-sm">
            <li className="hover:text-gray-300"><a href="#abotus">About</a></li>
            <li className="hover:text-gray-300"><a href="#booking">Booking</a></li>
            <li className="hover:text-gray-300"><a href="#trailmaps">Maps</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
