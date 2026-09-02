import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12" id="contact">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              ODForce
            </h2>
            <p className="text-slate-400 max-w-sm">
              Connecting you with verified skilled and unskilled workers for on-demand hourly or full-day hire.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><a href="#services" className="text-slate-400 hover:text-white transition-colors">Services</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
              <li><Link to="/help" className="text-slate-400 hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">For Workers</h3>
            <ul className="space-y-2">
              <li><Link to="/worker-portal" className="text-slate-400 hover:text-white transition-colors">Join as a Worker</Link></li>
              <li><Link to="/worker-portal" className="text-slate-400 hover:text-white transition-colors">Worker Portal</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ODForce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
