import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Copy, CheckCircle2, MessageCircle, RefreshCcw, Sliders, Settings, Wand2, HelpCircle, Send, Bot, AlertCircle, Loader, Database } from 'lucide-react';
import { useResolve } from '../../hooks/useResolve';
import { useChat } from '../../hooks/useChat';
import { getErrorMessage } from '../../utils/errorHandler';

export function CallHelper() {
  const [customerName, setCustomerName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemSummary, setProblemSummary] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showWhyPopup, setShowWhyPopup] = useState(false);
  const [isAlternativeFormat, setIsAlternativeFormat] = useState(false);
  const [showRafeeqChat, setShowRafeeqChat] = useState(false);
  const [isRafeeqActive, setIsRafeeqActive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [whyDescription, setWhyDescription] = useState<string>('');
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [currentMatchScore, setCurrentMatchScore] = useState<number | null>(null);

  const { resolve, loading: resolveLoading, error: resolveError } = useResolve();
  const {
    sendMessage,
    initChat,
    messages: chatMessages,
    loading: chatLoading,
    error: chatError,
    reset: resetChat,
  } = useChat(entityType || 'شركة عمرة');

  // Initialize chat when dialog opens
  useEffect(() => {
    if (showRafeeqChat && !isRafeeqActive && chatMessages.length === 0) {
      initChat();
    }
  }, [showRafeeqChat, isRafeeqActive, chatMessages.length, initChat]);

  const handleGenerate = async () => {
    if (!customerName || !entityType || !problemSummary) {
      return;
    }

    setApiError(null);

    try {
      const result = await resolve({
        name: customerName,
        user_type: entityType === 'umrah' ? 'umrah' : 'external',
        issue: problemSummary,
        get_alternatives: true,  // Request all alternatives
      });

      if (result.success && result.match?.response_text) {
        setGeneratedText(result.match.response_text);
        setIsAlternativeFormat(false);
        setWhyDescription(result.match.why || 'تم اختيار هذه الصيغة بناءً على معايير احترافية');
        setCurrentMatchScore(result.match.score || null);
        // Store alternatives for later use
        const alts = result.alternatives || [result.match];
        console.log('Found alternatives:', alts.length, alts);
        setAlternatives(alts);
        setCurrentAlternativeIndex(0);
      } else {
        setApiError(result.message || 'فشل توليد الصيغة');
        setGeneratedText('');
        setAlternatives([]);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setApiError(errorMsg);
      setGeneratedText('');
      setAlternatives([]);
    }
  };

  const handleGenerateAlternative = async () => {
    if (!customerName || !entityType || !problemSummary) {
      return;
    }

    setApiError(null);
    setIsAlternativeFormat(true);

    // If we have alternatives cached, cycle through them
    console.log('Alternatives in state:', alternatives.length, 'Current index:', currentAlternativeIndex);
    
    if (alternatives.length > 1) {
      const nextIndex = (currentAlternativeIndex + 1) % alternatives.length;
      const nextMatch = alternatives[nextIndex];
      
      console.log('Showing alternative', nextIndex + 1, 'of', alternatives.length, nextMatch);
      
      setGeneratedText(nextMatch.response_text || nextMatch.fallback || '');
      setWhyDescription(nextMatch.why || `الحل رقم ${nextIndex + 1} (درجة التطابق: ${nextMatch.score})`);
      setCurrentMatchScore(nextMatch.score || null);
      setCurrentAlternativeIndex(nextIndex);
      return;
    }
    
    console.log('Only one alternative available, fetching from server...');

    // Show message if only one solution exists
    if (alternatives.length === 1) {
      setApiError('هذا هو الحل الوحيد المتاح لهذه المشكلة. جرّب استعلام مختلف.');
      return;
    }

    // Fallback: fetch alternatives if not already loaded
    try {
      const result = await resolve({
        name: customerName,
        user_type: entityType === 'umrah' ? 'umrah' : 'external',
        issue: problemSummary,
        get_alternatives: true,
      });

      if (result.success && result.alternatives && result.alternatives.length > 1) {
        setAlternatives(result.alternatives);
        const nextMatch = result.alternatives[1]; // Get second best match
        setGeneratedText(nextMatch.response_text || nextMatch.fallback || '');
        setWhyDescription(nextMatch.why || `حل بديل (درجة التطابق: ${nextMatch.score})`);
        setCurrentMatchScore(nextMatch.score || null);
        setCurrentAlternativeIndex(1);
      } else {
        setApiError('لا توجد حلول بديلة متاحة. جرّب استعلام مختلف.');
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setApiError(errorMsg);
      setGeneratedText('');
    }
  };

  const handleCopy = () => {
    // Fallback copy method that works in all environments
    const textarea = document.createElement('textarea');
    textarea.value = generatedText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute left-0 top-0">
            <a
              href="http://localhost:5000/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-800 dark:text-stone-200 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Database className="size-4" />
              <span className="text-sm font-medium">Admin Panel</span>
            </a>
          </div>
          <h1 className="text-[rgb(0,0,0)] dark:text-white font-bold text-3xl flex items-center justify-center gap-2">
            Call Helper
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            مساعد ذكي لتوليد صيغ البلاغات بشكل احترافي ومنظم
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="max-w-4xl mx-auto">
          {/* Input Form */}
          <Card className="border-2 border-stone-200 dark:border-stone-700 shadow-xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
            <CardHeader className="bg-gradient-to-br from-stone-100 via-stone-50 to-white dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-b-2 border-stone-200 dark:border-stone-700 py-6">
              <CardTitle className="text-center text-stone-800 dark:text-stone-100 flex items-center justify-center gap-3">
                <span>إدخال بيانات البلاغ</span>
                <div className="p-2 bg-stone-200 dark:bg-slate-700 rounded-lg">
                  <MessageCircle className="size-5 text-stone-700 dark:text-stone-300" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 px-8 space-y-8 bg-gradient-to-b from-white to-stone-50/50 dark:from-slate-900 dark:to-slate-900/50">
              {/* Customer Name */}
              <div className="space-y-3">
                <Label htmlFor="customerName" className="text-right block text-stone-700 dark:text-stone-300">
                  اسم العميل:
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="أدخل اسم العميل..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-right border-2 border-stone-200 dark:border-stone-700 focus:border-stone-400 dark:focus:border-stone-500 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 transition-all"
                />
              </div>

              {/* Entity Type */}
              <div className="space-y-3">
                <Label htmlFor="entityType" className="text-right block text-stone-700 dark:text-stone-300">
                  نوع الجهة:
                </Label>
                <Select value={entityType} onValueChange={setEntityType} dir="rtl">
                  <SelectTrigger id="entityType" className="text-right border-2 border-stone-200 dark:border-stone-700 focus:border-stone-400 dark:focus:border-stone-500 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 [&>span]:text-right">
                    <SelectValue placeholder="اختر نوع الجهة..." className="text-right" />
                  </SelectTrigger>
                  <SelectContent className="text-right" dir="rtl">
                    <SelectItem value="umrah" className="text-right cursor-pointer">شركة عمرة</SelectItem>
                    <SelectItem value="external" className="text-right cursor-pointer">وكيل خارجي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Problem Summary Input */}
              <div className="space-y-3">
                <Label htmlFor="problemSummary" className="text-right block text-stone-700 dark:text-stone-300">
                  وصف المشكلة:
                </Label>
                <Input
                  id="problemSummary"
                  type="text"
                  placeholder="أدخل وصف المشكلة..."
                  value={problemSummary}
                  onChange={(e) => setProblemSummary(e.target.value)}
                  className="text-right border-2 border-stone-200 dark:border-stone-700 focus:border-stone-400 dark:focus:border-stone-500 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 transition-all"
                />
              </div>

              {/* Error Alert */}
              {apiError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300 text-right flex-1">{apiError}</p>
                </div>
              )}

              {/* Generate Format Button */}
              <div className="flex justify-center py-2">
                <button
                  onClick={handleGenerate}
                  disabled={!customerName || !entityType || !problemSummary || resolveLoading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                    resolveLoading
                      ? 'bg-sky-200 dark:bg-sky-300 text-sky-800 dark:text-sky-900'
                      : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {resolveLoading ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <Wand2 className="size-4" />
                  )}
                  <span>{resolveLoading ? 'جاري التوليد...' : 'توليد الصيغة'}</span>
                </button>
              </div>

              {/* Generated Text Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="generatedText" className="text-right block text-stone-700 dark:text-stone-300">
                      الصيغة المولدة:
                    </Label>
                    {/* Accuracy Badge */}
                    {generatedText && currentMatchScore !== null && (
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-0.5 border border-green-200 dark:border-green-700"
                      >
                        {(() => {
                          // Calculate percentage: assume max score is 10 (5 keywords * 2 points each)
                          const maxScore = 10;
                          const percentage = Math.min(Math.round((currentMatchScore / maxScore) * 100), 100);
                          return `${percentage}٪ دقة`;
                        })()}
                      </Badge>
                    )}
                    {generatedText && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setShowWhyPopup(true)}
                              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <HelpCircle className="size-4 text-stone-600 dark:text-stone-400" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-900 border-stone-700 dark:border-stone-300 backdrop-blur-sm max-w-xs"
                          >
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">سبب اختيار هذه الصيغة:</p>
                              <p className="text-xs text-right leading-relaxed">{whyDescription || 'لا توجد معلومات متاحة'}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowRafeeqChat(true);
                                }}
                                className="w-full px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 dark:bg-stone-900/30 dark:hover:bg-stone-900/40 rounded transition-colors"
                              >
                                المزيد من التفاصيل
                              </button>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAlternativeFormat && (
                      <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs">
                        صيغة بديلة
                      </Badge>
                    )}
                    {generatedText && (
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                          isCopied
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                            : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <Textarea
                  id="generatedText"
                  placeholder="سيتم عرض الصيغة المولدة هنا..."
                  value={generatedText}
                  readOnly
                  className="text-right min-h-[200px] resize-none border-2 border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-slate-800/50 rounded-lg px-4 py-3 transition-all"
                />
                
                {/* Action Buttons - Hide when accuracy is 100% */}
                {generatedText && (() => {
                  const maxScore = 10;
                  const percentage = currentMatchScore !== null ? Math.min(Math.round((currentMatchScore / maxScore) * 100), 100) : 0;
                  const isPerfectMatch = percentage === 100;
                  
                  // Don't show buttons if it's a perfect match
                  if (isPerfectMatch) return null;
                  
                  return (
                    <div className="flex items-center justify-between gap-3 pt-2">
                      {/* Right: Try Another Format */}
                      <button
                        onClick={() => {
                          setActiveButton(activeButton === 'retry' ? null : 'retry');
                          handleGenerateAlternative();
                        }}
                        disabled={resolveLoading}
                        className={`flex items-center gap-2 px-3 py-2.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          activeButton === 'retry'
                            ? 'bg-sky-200 dark:bg-sky-300 text-sky-800 dark:text-sky-900 shadow-lg'
                            : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {resolveLoading ? (
                          <Loader className="size-3 animate-spin" />
                        ) : (
                          <RefreshCcw className="size-3" />
                        )}
                        <span>{resolveLoading ? '...' : 'جرب صيغة ثانية'}</span>
                      </button>

                      {/* Center: Advanced Mode */}
                      <button
                        onClick={() => {
                          setActiveButton(activeButton === 'advanced' ? null : 'advanced');
                          /* TODO: AI advanced mode */
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                          activeButton === 'advanced'
                            ? 'bg-sky-200 dark:bg-sky-300 text-sky-800 dark:text-sky-900 shadow-lg'
                            : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <Sliders className={`size-3 transition-transform duration-300 ${activeButton === 'advanced' ? 'rotate-12' : ''}`} />
                        <span>وضع متقدم</span>
                      </button>

                      {/* Left: Did it help? */}
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setActiveButton(activeButton === 'helpful' ? null : 'helpful');
                                /* TODO: AI feedback */
                              }}
                              className={`flex items-center gap-2 px-3 py-2.5 text-xs rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                                activeButton === 'helpful'
                                  ? 'bg-sky-200 dark:bg-sky-300 text-sky-800 dark:text-sky-900 shadow-lg'
                                  : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 shadow-md hover:shadow-lg'
                              }`}
                            >
                              <Settings className={`size-3 transition-all duration-300 ${activeButton === 'helpful' ? 'scale-125 rotate-90' : ''}`} />
                              <span>أفدتك؟</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-900 border-stone-700 dark:border-stone-300 backdrop-blur-sm"
                          >
                            <p className="text-sm">ما كانت دقيقة! علمني الصح</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Popup Dialog */}
      <Dialog open={showWhyPopup} onOpenChange={setShowWhyPopup}>
        <DialogContent className="max-w-md text-right" dir="rtl">
          <DialogHeader className="p-[0px] mt-[30px] mr-[0px] mb-[0px] ml-[0px]">
            <DialogTitle className="text-right">
              لماذا هذه الصيغة؟
            </DialogTitle>
            <DialogDescription className="text-right">
              تم اختيار هذه الصيغة بناءً على عدة معايير احترافية
            </DialogDescription>
          </DialogHeader>
          <div className="text-right space-y-3 pt-[1px] pr-[0px] pb-[0px] pl-[0px]">
            <ul className="list-disc list-inside space-y-2 text-stone-600 dark:text-stone-400 pr-4">
              <li>السياق المهني والرسمي المناسب للبلاغات</li>
              <li>وضوح المعلومات وتظيمها بشكل منطقي</li>
              <li>استخدام تحية مناسبة وختام لائق</li>
              <li>تضمين جميع التفاصيل المطلوبة بشكل واضح</li>
              <li>الأسلوب المباشر والاحترافي</li>
            </ul>
            <div className="text-stone-600 dark:text-stone-400 text-sm pt-2 border-t border-stone-200 dark:border-stone-700 mt-3 pt-3">
              يمكنك تجربة صيغة بديلة من خلال زر "جرّب صيغة ثانية" للحصول على أسلوب مختلف.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rafeeq Chat Popup */}
      <Dialog open={showRafeeqChat} onOpenChange={setShowRafeeqChat}>
        <DialogContent className="max-w-2xl text-right h-[600px] flex flex-col" dir="rtl">
          <DialogHeader className="pb-4 border-b border-stone-200 dark:border-stone-700">
            <DialogTitle className="text-right flex items-center gap-2 justify-end">
              <span>محادثة رفيق</span>
              <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg">
                <Bot className="size-5 text-amber-700 dark:text-amber-300" />
              </div>
            </DialogTitle>
            <DialogDescription className="text-right">
              مساعدك الذكي للإجابة على استفساراتك
            </DialogDescription>
          </DialogHeader>

          {!isRafeeqActive ? (
            // Activation Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="size-10 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg text-stone-800 dark:text-stone-200">مرحباً بك في محادثة رفيق</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    اضغط على الزر أدناه لبدء المحادثة والحصول على المساعدة
                  </p>
                </div>
                <button
                  onClick={() => setIsRafeeqActive(true)}
                  className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Bot className="size-5" />
                  <span>تشغيل رفيق</span>
                </button>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="flex-1 flex flex-col min-h-0">
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-slate-900/50 rounded-lg mb-4">
                {/* Welcome Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm max-w-[80%] border border-stone-200 dark:border-stone-700">
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                      مرحباً! أنا رفيق، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟
                    </p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-full flex-shrink-0">
                    <Bot className="size-4 text-amber-700 dark:text-amber-300" />
                  </div>
                </div>

                {/* Placeholder for more messages */}
                <div className="text-center text-sm text-stone-400 dark:text-stone-600 py-8">
                  ابدأ بكتابة رسالتك أدناه...
                </div>
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2 pt-4 border-t border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => {
                    if (chatMessage.trim()) {
                      // TODO: Send message functionality
                      setChatMessage('');
                    }
                  }}
                  disabled={!chatMessage.trim()}
                  className="p-3 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                >
                  <Send className="size-4" />
                </button>
                <Input
                  type="text"
                  placeholder="اكتب رسالتك هنا..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      // TODO: Send message functionality
                      setChatMessage('');
                    }
                  }}
                  className="text-right flex-1 border-2 border-stone-200 dark:border-stone-700 focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 transition-all"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
