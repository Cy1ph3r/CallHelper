import { useState } from 'react';
import { Search, Sun, Moon, User, Activity, AlertCircle, BookOpen, RefreshCw, Lightbulb, LayoutDashboard, Headphones, Bot } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { LiveIndicators } from './features/LiveIndicators';
import { CallHelper } from './features/CallHelper';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('live-indicators');
  const [viewMode, setViewMode] = useState<'dashboard' | 'callhelper'>('dashboard');

  const services = [
    { id: 'live-indicators', name: 'المؤشرات اللحظية', icon: Activity },
    { id: 'public-issues', name: 'المشاكل العامة', icon: AlertCircle },
    { id: 'knowledge-base', name: 'سجل المعرفة', icon: BookOpen },
    { id: 'operational-updates', name: 'التحديثات التشغيلية', icon: RefreshCw },
    { id: 'what-did-rafeeq-learn', name: 'وش تعلم رفيق؟', icon: Lightbulb },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''} dir="rtl">
      <div className="min-h-screen bg-background transition-colors">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            {/* Empty space for sidebar alignment */}
            <div className="w-72 flex-shrink-0"></div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث هنا..."
                  className="pr-10 bg-input-background border-border focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Left Icons */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hover:bg-accent"
              >
                {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
                  <DropdownMenuItem>الإعدادات</DropdownMenuItem>
                  <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar - قائمة الخدمات */}
          <aside className="w-72 border-l border-border bg-card min-h-[calc(100vh-73px)] p-6 shadow-sm">
            {/* View Mode Toggle Switch */}
            <div className="mb-6">
              <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-inner">
                <div
                  className={`absolute top-1 bottom-1 bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all duration-300 ease-in-out ${
                    viewMode === 'dashboard' ? 'right-1 left-1/2' : 'left-1 right-1/2'
                  }`}
                />
                <div className="relative flex">
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-1 ${
                      viewMode === 'dashboard' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <LayoutDashboard className="size-3" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setViewMode('callhelper')}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-1 ${
                      viewMode === 'callhelper' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Headphones className="size-3" />
                    <span>Call Helper</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Services List - Only show in Dashboard mode */}
            {viewMode === 'dashboard' && (
              <>
                <h2 className="mb-6 px-3 text-foreground text-right font-bold">قائمة الخدمات</h2>
                <nav className="space-y-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          selectedService === service.id
                            ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                            : 'text-foreground hover:bg-accent hover:scale-[1.01]'
                        }`}
                      >
                        <Icon className={`size-5 flex-shrink-0 ${service.id === 'what-did-rafeeq-learn' ? 'transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-yellow-500' : ''}`} />
                        <span className="text-sm">{service.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Ask Rafeeq Button - Only show in Call Helper mode */}
            {viewMode === 'callhelper' && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {/* TODO: Add functionality */}}
                  className="group relative bg-gradient-to-br from-stone-200 to-stone-100 dark:from-slate-700 dark:to-slate-600 hover:from-stone-300 hover:to-stone-200 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-lg p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Bot className="size-6 text-stone-600 dark:text-stone-300 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-stone-600 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    اسأل رفيق
                  </span>
                </button>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-8 bg-background">
            {viewMode === 'callhelper' ? (
              <CallHelper />
            ) : (
              <div className="max-w-7xl mx-auto">
                {selectedService === 'live-indicators' ? (
                  <LiveIndicators />
                ) : (
                  <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      {(() => {
                        const service = services.find((s) => s.id === selectedService);
                        if (!service) return null;
                        const Icon = service.icon;
                        return (
                          <>
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Icon className="size-8 text-primary" />
                            </div>
                            <h1 className="text-foreground">{service.name}</h1>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-muted-foreground">
                      محتوى {services.find((s) => s.id === selectedService)?.name} سيظهر هنا
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}