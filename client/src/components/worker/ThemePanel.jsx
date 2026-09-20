import { useTheme } from '../../context/ThemeContext';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

const ThemePanel = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright interface' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes in low light' },
    { id: 'system', label: 'System', icon: Monitor, desc: 'Follow your device settings' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Theme Settings</h2>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md">
        <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Appearance
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Choose how ODForce looks on your device. Dark mode is easier on the eyes at night.
        </p>

        <div className="space-y-3">
          {themes.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                theme === id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-secondary">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              {theme === id && (
                <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Note:</span> Dark mode applies across the entire app,
            including customer-facing pages and the worker dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
