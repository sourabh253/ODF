import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import workerService from '../../services/workerService';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Upload, AlertCircle
} from 'lucide-react';

const SKILLS = [
  'Home Cleaning', 'Electrician', 'Plumber', 'Carpenter',
  'AC Service & Repair', 'Pest Control', 'Gardening & Landscaping',
  'Painter', 'Water Tank Cleaning', 'Housekeeping Staff',
  'Car Wash & Detailing', 'Laundry & Dry Cleaning', 'Maid Services',
  'CCTV Installation & Maintenance', 'RO/Water Purifier Service',
  'Refrigerator Repair', 'Washing Machine Repair',
];

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Malayalam', 'Gujarati'];
const DOCUMENT_TYPES = ['Aadhar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License'];

const STEP_LABELS = [
  'Skills', 'Personal Info', 'Location', 'Work Details', 'Identity & Bank', 'Review'
];

const inputClass = 'w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800 bg-white';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
const errorClass = 'text-danger text-sm mt-1 flex items-center gap-1';

const WorkerProfileSetup = () => {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Form state
  const [skills, setSkills] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState('');

  const [personal, setPersonal] = useState({ gender: '', dob: '', fullName: user?.fullName || '' });
  const [location, setLocation] = useState({ address: '', city: '', state: '', pinCode: '' });
  const [work, setWork] = useState({
    occupation: '', experienceYears: '', hourlyCharge: '', fullDayCharge: '',
    workingHours: '', languagesKnown: []
  });
  const [identity, setIdentity] = useState({
    documentType: '', documentNumber: '',
    bankAccountHolder: '', bankAccountNumber: '', bankIfsc: '', bankName: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const toggleSkill = (skill) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleLanguage = (lang) => {
    setWork(prev => ({
      ...prev,
      languagesKnown: prev.languagesKnown.includes(lang)
        ? prev.languagesKnown.filter(l => l !== lang)
        : [...prev.languagesKnown, lang]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocFile(file);
      setDocFileName(file.name);
    }
  };

  const validateStep = () => {
    const errors = {};
    if (step === 1 && skills.length === 0) errors.skills = 'Select at least one skill';
    if (step === 2) {
      if (!photoFile) errors.photo = 'Profile photo is required';
      if (!personal.gender) errors.gender = 'Gender is required';
      if (!personal.dob) errors.dob = 'Date of birth is required';
    }
    if (step === 3) {
      if (!location.address) errors.address = 'Address is required';
      if (!location.city) errors.city = 'City is required';
      if (!location.state) errors.state = 'State is required';
      if (!location.pinCode) errors.pinCode = 'PIN code is required';
    }
    if (step === 4) {
      if (!work.occupation) errors.occupation = 'Occupation is required';
      if (!work.experienceYears) errors.experienceYears = 'Experience is required';
      if (!work.hourlyCharge || Number(work.hourlyCharge) < 300) errors.hourlyCharge = 'Minimum hourly charge is ₹300';
      if (!work.fullDayCharge) errors.fullDayCharge = 'Full day charge is required';
      if (!work.workingHours) errors.workingHours = 'Working hours is required';
      if (work.languagesKnown.length === 0) errors.languagesKnown = 'Select at least one language';
    }
    if (step === 5) {
      if (!identity.documentType) errors.documentType = 'Document type is required';
      if (!identity.documentNumber) errors.documentNumber = 'Document number is required';
      if (!docFile) errors.docFile = 'Document photo is required';
      if (!identity.bankAccountHolder) errors.bankAccountHolder = 'Account holder name is required';
      if (!identity.bankAccountNumber) errors.bankAccountNumber = 'Account number is required';
      if (!identity.bankIfsc) errors.bankIfsc = 'IFSC code is required';
      if (!identity.bankName) errors.bankName = 'Bank name is required';
      if (!identity.emergencyName) errors.emergencyName = 'Emergency contact name is required';
      if (!identity.emergencyPhone) errors.emergencyPhone = 'Emergency contact phone is required';
      if (!identity.emergencyRelation) errors.emergencyRelation = 'Relation is required';
    }
    if (step === 6 && !agreedToTerms) errors.terms = 'You must agree to the Terms & Conditions';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setGlobalError('');
    try {
      // Upload profile photo
      const photoUpload = await workerService.uploadFile(photoFile, user.token);
      // Upload identity document
      const docUpload = await workerService.uploadFile(docFile, user.token);

      const profilePayload = {
        profilePhotoUrl: photoUpload.url,
        gender: personal.gender,
        dob: personal.dob,
        address: location.address,
        city: location.city,
        state: location.state,
        pinCode: location.pinCode,
        occupation: work.occupation,
        skills,
        experienceYears: Number(work.experienceYears),
        hourlyCharge: Number(work.hourlyCharge),
        fullDayCharge: Number(work.fullDayCharge),
        workingHours: work.workingHours,
        languagesKnown: work.languagesKnown,
        identityInfo: {
          documentType: identity.documentType,
          documentNumber: identity.documentNumber,
          documentUrl: docUpload.url,
        },
        bankDetails: {
          accountHolderName: identity.bankAccountHolder,
          accountNumber: identity.bankAccountNumber,
          ifscCode: identity.bankIfsc,
          bankName: identity.bankName,
        },
        emergencyContact: {
          name: identity.emergencyName,
          phone: identity.emergencyPhone,
          relation: identity.emergencyRelation,
        },
        agreedToTerms,
      };

      await workerService.completeProfile(profilePayload, user.token);
      setSubmitting(false);
      window.location.assign('/worker-dashboard');
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Complete Your Worker Profile</h1>
          <p className="text-slate-500">Step {step} of 6 — {STEP_LABELS[step - 1]}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {STEP_LABELS.map((label, idx) => {
            const num = idx + 1;
            const isCompleted = step > num;
            const isCurrent = step === num;
            return (
              <div key={num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted ? 'bg-primary text-white' :
                    isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  <span className={`text-xs mt-1 hidden md:block font-medium ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step > num ? 'bg-primary' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {globalError && (
            <div className="bg-danger/10 text-danger p-4 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-2">Select Your Skills</h2>
              <p className="text-slate-500 mb-6">Choose all the services you can perform. Select at least one.</p>
              {fieldErrors.skills && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.skills}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      skills.includes(skill)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-6">Personal Information</h2>
              <div className="space-y-5">
                {/* Photo Upload */}
                <div>
                  <label className={labelClass}>Profile Photo *</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
                      {photoPreview
                        ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <Upload className="w-8 h-8 text-slate-400" />
                      }
                    </div>
                    <div>
                      <label className="btn-secondary cursor-pointer text-sm py-2 px-4">
                        Choose Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      <p className="text-xs text-slate-400 mt-2">JPG, PNG. Max 5MB.</p>
                      {fieldErrors.photo && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.photo}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input className={inputClass} value={personal.fullName} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select className={inputClass} value={personal.gender} onChange={e => setPersonal({ ...personal, gender: e.target.value })}>
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                    {fieldErrors.gender && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.gender}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth *</label>
                    <input type="date" className={inputClass} value={personal.dob} onChange={e => setPersonal({ ...personal, dob: e.target.value })} />
                    {fieldErrors.dob && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.dob}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-6">Location Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Address *</label>
                  <textarea rows={3} className={inputClass} value={location.address} onChange={e => setLocation({ ...location, address: e.target.value })} placeholder="House no., Street, Area..." />
                  {fieldErrors.address && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input className={inputClass} value={location.city} onChange={e => setLocation({ ...location, city: e.target.value })} />
                    {fieldErrors.city && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input className={inputClass} value={location.state} onChange={e => setLocation({ ...location, state: e.target.value })} />
                    {fieldErrors.state && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.state}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>PIN Code *</label>
                  <input className={`${inputClass} max-w-xs`} value={location.pinCode} onChange={e => setLocation({ ...location, pinCode: e.target.value })} maxLength={6} />
                  {fieldErrors.pinCode && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.pinCode}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Work Details */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-6">Work Details</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Primary Occupation *</label>
                  <input className={inputClass} value={work.occupation} onChange={e => setWork({ ...work, occupation: e.target.value })} placeholder="e.g. Electrician, Plumber..." />
                  {fieldErrors.occupation && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.occupation}</p>}
                </div>
                <div>
                  <label className={labelClass}>Years of Experience *</label>
                  <input type="number" min={0} className={inputClass} value={work.experienceYears} onChange={e => setWork({ ...work, experienceYears: e.target.value })} />
                  {fieldErrors.experienceYears && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.experienceYears}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Hourly Charge (₹) *</label>
                    <input type="number" min={300} className={inputClass} value={work.hourlyCharge} onChange={e => setWork({ ...work, hourlyCharge: e.target.value })} />
                    {fieldErrors.hourlyCharge
                      ? <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.hourlyCharge}</p>
                      : <p className="text-xs text-slate-400 mt-1">Minimum ₹300 per platform policy</p>
                    }
                  </div>
                  <div>
                    <label className={labelClass}>Full Day Charge (₹) *</label>
                    <input type="number" min={0} className={inputClass} value={work.fullDayCharge} onChange={e => setWork({ ...work, fullDayCharge: e.target.value })} />
                    {fieldErrors.fullDayCharge && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.fullDayCharge}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Working Hours *</label>
                  <input className={inputClass} value={work.workingHours} onChange={e => setWork({ ...work, workingHours: e.target.value })} placeholder="e.g. 9 AM – 6 PM" />
                  {fieldErrors.workingHours && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.workingHours}</p>}
                </div>
                <div>
                  <label className={labelClass}>Languages Known *</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          work.languagesKnown.includes(lang)
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 text-slate-600 hover:border-primary'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  {fieldErrors.languagesKnown && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.languagesKnown}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Identity & Bank */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-6">Identity & Bank Details</h2>
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-4">Identity Document</h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Document Type *</label>
                      <select className={inputClass} value={identity.documentType} onChange={e => setIdentity({ ...identity, documentType: e.target.value })}>
                        <option value="">Select type</option>
                        {DOCUMENT_TYPES.map(d => <option key={d}>{d}</option>)}
                      </select>
                      {fieldErrors.documentType && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.documentType}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Document Number *</label>
                      <input className={inputClass} value={identity.documentNumber} onChange={e => setIdentity({ ...identity, documentNumber: e.target.value })} />
                      {fieldErrors.documentNumber && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.documentNumber}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Document Photo *</label>
                      <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-500 text-sm">{docFileName || 'Upload document photo'}</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocChange} />
                      </label>
                      {fieldErrors.docFile && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.docFile}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-4">Bank Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Account Holder Name *</label>
                      <input className={inputClass} value={identity.bankAccountHolder} onChange={e => setIdentity({ ...identity, bankAccountHolder: e.target.value })} />
                      {fieldErrors.bankAccountHolder && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.bankAccountHolder}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Account Number *</label>
                        <input className={inputClass} value={identity.bankAccountNumber} onChange={e => setIdentity({ ...identity, bankAccountNumber: e.target.value })} />
                        {fieldErrors.bankAccountNumber && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.bankAccountNumber}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>IFSC Code *</label>
                        <input className={inputClass} value={identity.bankIfsc} onChange={e => setIdentity({ ...identity, bankIfsc: e.target.value.toUpperCase() })} />
                        {fieldErrors.bankIfsc && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.bankIfsc}</p>}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name *</label>
                      <input className={inputClass} value={identity.bankName} onChange={e => setIdentity({ ...identity, bankName: e.target.value })} />
                      {fieldErrors.bankName && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.bankName}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name *</label>
                      <input className={inputClass} value={identity.emergencyName} onChange={e => setIdentity({ ...identity, emergencyName: e.target.value })} />
                      {fieldErrors.emergencyName && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.emergencyName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Phone *</label>
                      <input type="tel" className={inputClass} value={identity.emergencyPhone} onChange={e => setIdentity({ ...identity, emergencyPhone: e.target.value })} />
                      {fieldErrors.emergencyPhone && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.emergencyPhone}</p>}
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className={labelClass}>Relation *</label>
                    <input className={inputClass} value={identity.emergencyRelation} onChange={e => setIdentity({ ...identity, emergencyRelation: e.target.value })} placeholder="e.g. Spouse, Parent, Sibling" />
                    {fieldErrors.emergencyRelation && <p className={errorClass}><AlertCircle className="w-4 h-4" />{fieldErrors.emergencyRelation}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold text-secondary mb-6">Review & Submit</h2>
              <div className="space-y-4">
                <ReviewRow label="Skills" value={skills.join(', ')} />
                <ReviewRow label="Name" value={personal.fullName} />
                <ReviewRow label="Gender" value={personal.gender} />
                <ReviewRow label="Date of Birth" value={personal.dob} />
                <ReviewRow label="Address" value={`${location.address}, ${location.city}, ${location.state} - ${location.pinCode}`} />
                <ReviewRow label="Occupation" value={work.occupation} />
                <ReviewRow label="Experience" value={`${work.experienceYears} years`} />
                <ReviewRow label="Hourly Charge" value={`₹${work.hourlyCharge}`} />
                <ReviewRow label="Full Day Charge" value={`₹${work.fullDayCharge}`} />
                <ReviewRow label="Working Hours" value={work.workingHours} />
                <ReviewRow label="Languages" value={work.languagesKnown.join(', ')} />
                <ReviewRow label="Document Type" value={identity.documentType} />
                <ReviewRow label="Bank Account" value={identity.bankName} />
                <ReviewRow label="Emergency Contact" value={`${identity.emergencyName} (${identity.emergencyRelation})`} />
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-slate-600">
                    I agree to the ODForce <span className="text-primary font-medium">Terms & Conditions</span> and confirm that all information provided is accurate. I understand the minimum job charge on this platform is ₹300.
                  </span>
                </label>
                {fieldErrors.terms && <p className={`${errorClass} mt-2`}><AlertCircle className="w-4 h-4" />{fieldErrors.terms}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1
              ? <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              : <div />
            }
            {step < 6
              ? <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              : <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 px-6">
                  {submitting ? 'Submitting...' : 'Submit Profile'}
                  {!submitting && <CheckCircle2 className="w-4 h-4" />}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewRow = ({ label, value }) => (
  <div className="flex gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 text-sm w-36 shrink-0">{label}</span>
    <span className="text-slate-800 text-sm font-medium">{value || '—'}</span>
  </div>
);

export default WorkerProfileSetup;
