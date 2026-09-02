import { Shield, Clock, IndianRupee, MapPin, ChevronDown, CheckCircle2, Star, Quote, User } from 'lucide-react';
import { useState } from 'react';

const SKILLS = [
  "Home Cleaning", "Electrician", "Plumber", "Carpenter", 
  "AC Service & Repair", "Pest Control", "Gardening & Landscaping", 
  "Painter", "Water Tank Cleaning", "Housekeeping Staff", 
  "Car Wash & Detailing", "Laundry & Dry Cleaning", "Maid Services", 
  "CCTV Installation & Maintenance", "RO/Water Purifier Service", 
  "Refrigerator Repair", "Washing Machine Repair"
];

// Reusable FAQ Item
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <button 
        className="w-full flex justify-between items-center p-4 bg-white hover:bg-slate-50 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-slate-800">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-100 text-slate-600">
          {answer}
        </div>
      )}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-surface py-20 lg:py-32 overflow-hidden relative border-b border-slate-200">
        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black text-secondary leading-tight mb-6">
              Expert Home Services,<br/> 
              <span className="text-primary">On Demand.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-lg">
              Connect directly with verified skilled and unskilled workers for hourly or full-day hire. No middlemen, transparent pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary text-lg px-8 py-3 shadow-lg shadow-primary/30">
                Book a Service
              </button>
              <button className="btn-secondary text-lg px-8 py-3 bg-white">
                How It Works
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            {/* Abstract visual composition avoiding generic stock */}
            <div className="aspect-square bg-primary/5 rounded-full absolute -top-12 -right-12 w-[120%] -z-10 blur-3xl"></div>
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
              <div className="absolute -top-6 -left-6 bg-success text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5"/> Verified Workers
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex text-warning">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-slate-700 ml-1">4.9</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About ODForce */}
      <section id="about" className="py-20 bg-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">About ODForce</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            ODForce replaces the informal, middleman-driven local hiring process with a centralized, trustworthy platform. We believe in direct connection: customers get access to verified talent instantly, and workers retain full control over their bookings and earnings. By eliminating the middleman, we guarantee fair pay and transparent pricing for everyone.
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Find exactly the right professional for your needs, ready to help today.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {SKILLS.map((skill) => (
              <div key={skill} className="bg-white border border-slate-200 hover:border-primary hover:shadow-md transition-all p-4 rounded-xl text-center cursor-pointer group flex flex-col items-center justify-center h-32">
                <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose ODForce</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Profiles</h3>
              <p className="text-slate-600">Every worker on our platform is carefully verified for your safety and peace of mind.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <IndianRupee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
              <p className="text-slate-600">Pay direct charges with no hidden fees. Choose between Cash on Service or Pay Before.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-slate-600">Get real-time responses from available workers in your immediate location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-slate-400">Simple steps to get your job done</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Search', desc: 'Find workers by skill and your live location.' },
              { step: 2, title: 'Request', desc: 'Send an hourly or full-day booking request.' },
              { step: 3, title: 'Connect', desc: 'Worker accepts instantly in real-time.' },
              { step: 4, title: 'Complete', desc: 'Pay securely and leave a review.' }
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4 text-warning">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "ODForce completely changed how I find help. The worker was professional, arrived on time, and the transparent pricing meant no haggling."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                    C
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Customer {i}</div>
                    <div className="text-sm text-slate-500">Verified Booking</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem 
              question="How do I pay for a service?" 
              answer="You can pay using 'Cash on Service' directly to the worker after completion, or use our 'Pay Before' secure online checkout via UPI with available coupons."
            />
            <FAQItem 
              question="Are the workers verified?" 
              answer="Yes, all workers undergo a verification process including ID checks before their profiles go live on our platform."
            />
            <FAQItem 
              question="What is the minimum charge?" 
              answer="To ensure fair wages, the minimum booking charge on ODForce is ₹300."
            />
            <FAQItem 
              question="Can I cancel a booking?" 
              answer="Yes, you can cancel a pending request anytime, or cancel an accepted booking before the worker arrives."
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
