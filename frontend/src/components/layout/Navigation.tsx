import { NavLink, useLocation } from 'react-router-dom';
import { Home, Send, Users, History, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const navItems = [
    { path: '/', label: t('nav.home') || 'Home', icon: Home },
    { path: '/send', label: t('nav.send') || 'Send Money', icon: Send },
    { path: '/bulk', label: t('nav.bulk') || 'Bulk Payment', icon: Users },
    { path: '/history', label: t('nav.history') || 'History', icon: History },
  ];

  return (
    <>
      {/* Language Toggle - Mobile Header */}
      <div className="absolute right-4 top-4 md:hidden flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Lang</span>
        <button
          className={cn(
            'px-2 py-1 text-xs rounded-lg',
            lang === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
          onClick={() => setLang('fr')}
        >
          FR
        </button>
        <button
          className={cn(
            'px-2 py-1 text-xs rounded-lg',
            lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-card mx-4 mt-4 rounded-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-lg text-foreground">{t('app.name') || 'MoJaPay'}</span>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isOpen && (
            <nav className="px-4 pb-4 animate-fade-up">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
                        isActive
                          ? 'gradient-primary text-primary-foreground shadow-lg'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col p-4 z-50">
        <div className="glass-card h-full rounded-2xl p-4 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">{t('app.name') || 'MoJaPay'}</h1>
              <p className="text-xs text-muted-foreground">{t('nav.send') || 'Send Money'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'gradient-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Language Toggle - Desktop Sidebar */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Lang</span>
            <button
              className={cn(
                'px-2 py-1 text-xs rounded-lg',
                lang === 'fr' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
              onClick={() => setLang('fr')}
            >
              FR
            </button>
            <button
              className={cn(
                'px-2 py-1 text-xs rounded-lg',
                lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 MoJaPay
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-card mx-4 mb-4 rounded-2xl">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-all duration-200',
                      isActive && 'gradient-primary text-primary-foreground shadow-glow'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
