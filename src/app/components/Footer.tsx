// components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <p className="text-lg font-bold">TrailBuddy</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} All Rights Reserved</p>
        </div>

        <div className="mb-6 md:mb-0">
          <p className="font-semibold mb-2">Follow Us</p>
          {/* social media links */}
          <div className="flex space-x-4">
            
            <a href="#" className="hover:text-pink-500">Instagram</a>
           
          </div>
        </div>

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
