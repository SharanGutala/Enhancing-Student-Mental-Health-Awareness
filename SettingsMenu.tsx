import React, { useState, useRef, useEffect } from 'react';
import type { FontSize, FontFamily } from '../App';
import { SettingsIcon, CloseIcon } from './IconComponents';

interface SettingsMenuProps {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
}

const SettingsMenu = ({ fontSize, setFontSize, fontFamily, setFontFamily }: SettingsMenuProps): React.ReactNode => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const OptionButton = ({ label, value, current, setter }) => (
    <button
      onClick={() => setter(value)}
      className={`px-3 py-1.5 border-2 border-black text-xs font-bold transition-all ${
        current === value
          ? 'bg-brand-accent text-black shadow-hard'
          : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-black border-2 border-black bg-white shadow-hard hover:bg-gray-100 transition-all active:shadow-none active:translate-y-px active:translate-x-px"
        aria-label="Open settings"
      >
        <SettingsIcon />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black shadow-hard z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold uppercase">Settings</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 -m-1" aria-label="Close settings">
                <CloseIcon />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 uppercase">Font Size</label>
            <div className="flex gap-2">
                <OptionButton label="Small" value="sm" current={fontSize} setter={setFontSize} />
                <OptionButton label="Medium" value="base" current={fontSize} setter={setFontSize} />
                <OptionButton label="Large" value="lg" current={fontSize} setter={setFontSize} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase">Font Family</label>
            <div className="flex gap-2">
                <OptionButton label="Mono" value="mono" current={fontFamily} setter={setFontFamily} />
                <OptionButton label="Sans" value="sans" current={fontFamily} setter={setFontFamily} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
