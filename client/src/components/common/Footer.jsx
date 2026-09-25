import { Link } from 'react-router-dom';
import { Apple, Instagram, Play } from 'lucide-react';

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'X (Twitter)', href: 'https://x.com/Sourabh7278', Icon: XIcon },
  { name: 'Instagram', href: 'https://www.instagram.com/sourabh_.jangid/?hl=en', Icon: Instagram },
];

const storeBadge = (Icon, topLabel, storeName) => (
  <span
    aria-disabled="true"
    className="inline-flex cursor-default items-center gap-2.5 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2 opacity-80"
  >
    <Icon className="h-5 w-5 text-slate-300" />
    <span className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase tracking-wide text-slate-400">{topLabel}</span>
      <span className="text-xs font-semibold text-slate-100">{storeName}</span>
    </span>
    <span className="ml-1 rounded-full bg-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">
      Coming soon
    </span>
  </span>
);

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
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/#services" className="text-slate-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/#about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/help" className="text-slate-400 hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-200">For Workers</h3>
            <ul className="space-y-2">
              <li><Link to="/odf-for-job" className="text-slate-400 hover:text-white transition-colors">Join as a Worker</Link></li>
              <li><Link to="/worker-portal" className="text-slate-400 hover:text-white transition-colors">Worker Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ODForce. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {storeBadge(Play, 'Get it on', 'Google Play')}
            {storeBadge(Apple, 'Download on the', 'App Store')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
