import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, MessageSquare, Phone, Mail } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-secondary">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const faqs = [
    {
      question: 'How do I book a worker?',
      answer: 'Sign in as a customer, browse service categories on the dashboard, add services to your cart, choose a worker from the filtered list, and send a booking request. You\'ll be notified in real-time when the worker accepts or rejects.',
    },
    {
      question: 'How does payment work?',
      answer: 'After a worker accepts your booking, you can choose between Cash on Service (pay after work) or Pay Before (pay online via UPI/Razorpay). Pay Before also supports coupon codes for discounts.',
    },
    {
      question: 'What is the inspection fee?',
      answer: 'A flat ₹80 inspection fee is charged once per booking, regardless of the number of services selected. This covers the worker\'s travel and initial assessment.',
    },
    {
      question: 'How do I become a worker on ODForce?',
      answer: 'Click "ODF for Job" in the navbar, register with your email or phone, complete your profile with skills, experience, identity, and bank details. Once your profile is set up, you can go online and start receiving booking requests.',
    },
    {
      question: 'How do I receive payments as a worker?',
      answer: 'When a booking is completed and confirmed by the customer, the payment is settled to your wallet. Cash bookings have a 10% platform fee deducted. Pay Before bookings have the total amount (minus platform fee) credited to your wallet. You can withdraw funds from your wallet at any time.',
    },
    {
      question: 'What is the minimum wallet balance?',
      answer: 'Workers need a minimum wallet balance of ₹300 to accept Cash on Service bookings. This ensures smooth settlement after the service is completed.',
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Customers can cancel pending bookings. Workers can cancel accepted bookings that haven\'t started yet. Once work is in progress, cancellation is not allowed.',
    },
    {
      question: 'How do reviews work?',
      answer: 'After a booking is completed, customers can leave a rating (1-5 stars) and a comment. The worker\'s average rating is automatically recomputed from all reviews.',
    },
    {
      question: 'What languages are supported?',
      answer: 'ODForce supports English, Hindi, Marathi, Telugu, Tamil, Malayalam, and Gujarati. You can switch languages from the globe icon in the navbar.',
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Yes. We use JWT authentication, encrypted passwords, and server-side validation for all operations. Your data is stored securely in MongoDB Atlas.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-3xl">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Help & Support</h1>
          <p className="text-slate-500">Find answers to common questions or reach out to us</p>
        </div>

        {/* FAQs */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-secondary mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Still need help?</h2>
          <p className="text-slate-500 mb-6">Our support team is here to assist you.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <a href="mailto:support@odforce.in" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-secondary">Email</p>
                <p className="text-xs text-slate-400">support@odforce.in</p>
              </div>
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-secondary">Phone</p>
                <p className="text-xs text-slate-400">+91 98765 43210</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-secondary">Chat</p>
                <p className="text-xs text-slate-400">Available 9am - 9pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
