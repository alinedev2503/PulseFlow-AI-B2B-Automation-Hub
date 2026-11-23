import React from 'react';
import { Globe } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { LocaleCode } from '../types/workflow';

const LOCALES: { code: LocaleCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
];

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useWorkspace();

  const containerCls =
    variant === 'dark'
      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
      : 'bg-slate-100 border-slate-200 text-slate-600';

  const activeCls =
    variant === 'dark'
      ? 'bg-slate-700 text-white'
      : 'bg-white text-slate-900 shadow-xs';

  const inactiveCls =
    variant === 'dark'
      ? 'text-slate-400 hover:text-white'
      : 'text-slate-600 hover:text-slate-900';

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-lg border ${containerCls}`}
      role="group"
      aria-label="Language selector"
    >
      <Globe className="w-3.5 h-3.5 ml-1.5 mr-0.5 opacity-70 shrink-0" />
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => void setLocale(item.code)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            locale === item.code ? activeCls : inactiveCls
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
