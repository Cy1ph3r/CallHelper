import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ChevronRight } from 'lucide-react';

interface CategorySurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: string) => void;
}

const CATEGORIES = [
  {
    id: 'technical',
    icon: '💻',
    name: 'مشكلة تقنية',
    description: 'أخطاء في النظام، مشاكل تسجيل الدخول، تقنيات',
    hasSubcategories: true,
  },
  {
    id: 'operational',
    icon: '⚙️',
    name: 'مشكلة تشغيلية',
    description: 'إجراءات، صلاحيات، عمليات يومية',
    hasSubcategories: false,
  },
  {
    id: 'financial',
    icon: '💰',
    name: 'مشكلة مالية',
    description: 'مدفوعات، فواتير، رسوم، استرجاع أموال',
    hasSubcategories: false,
  },
  {
    id: 'complaint',
    icon: '📢',
    name: 'شكوى',
    description: 'عدم رضا، خدمة سيئة، مشكلة مع موظف',
    hasSubcategories: false,
  },
  {
    id: 'general',
    icon: '❓',
    name: 'استفسار عام',
    description: 'أسئلة، معلومات، توضيحات',
    hasSubcategories: false,
  },
];

const TECHNICAL_SUBCATEGORIES = [
  {
    id: 'registration',
    icon: '📝',
    name: 'تسجيل',
    description: 'مشاكل في التسجيل الجديد',
  },
  {
    id: 'activation',
    icon: '✅',
    name: 'تفعيل',
    description: 'مشاكل تفعيل الحساب أو الخدمة',
  },
  {
    id: 'qualification',
    icon: '🎓',
    name: 'تأهيل',
    description: 'مشاكل التأهيل والتدريب',
  },
  {
    id: 'visa',
    icon: '🛂',
    name: 'تأشيرات',
    description: 'مشاكل متعلقة بالتأشيرات',
  },
  {
    id: 'inquiry',
    icon: '🔍',
    name: 'استعلام',
    description: 'استعلامات تقنية عامة',
  },
];

export function CategorySurveyDialog({ open, onOpenChange, onSubmit }: CategorySurveyDialogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('operational');
  const [showTechnicalSubcategories, setShowTechnicalSubcategories] = React.useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'technical') {
      setShowTechnicalSubcategories(true);
    } else {
      setShowTechnicalSubcategories(false);
      setSelectedSubcategory('');
    }
  };

  const handleBack = () => {
    setShowTechnicalSubcategories(false);
    setSelectedSubcategory('');
  };

  const handleSubmit = () => {
    const finalCategory = selectedCategory === 'technical' && selectedSubcategory
      ? `technical_${selectedSubcategory}`
      : selectedCategory;
    onSubmit(finalCategory);
    onOpenChange(false);
    // Reset state
    setShowTechnicalSubcategories(false);
    setSelectedSubcategory('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right bg-white dark:bg-slate-900" dir="rtl">
        {/* Header */}
        <div style={{ background: 'linear-gradient(to bottom right, #d97706, #ea580c)', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginTop: '-1.5rem', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
          <div className="text-5xl mb-4">🔍</div>
          <DialogTitle className="text-2xl mb-2">
            <span style={{ color: '#ffffff !important' }}>لم تجد الحل المناسب؟</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            <span style={{ color: '#ffffff !important' }}>ساعدنا في تحسين النتائج بتحديد نوع المشكلة</span>
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {!showTechnicalSubcategories ? (
            // Main Categories
            <>
              <p className="text-black font-medium mb-4">
                حدد نوع المشكلة التي تواجهها:
              </p>

              <div className="space-y-3">
                {CATEGORIES.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-slate-800 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-1">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-700">
                        {category.description}
                      </div>
                    </div>
                    {category.hasSubcategories ? (
                      <ChevronRight className="size-5 text-amber-500" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedCategory === category.id
                            ? 'border-amber-500'
                            : 'border-stone-300 dark:border-stone-600'
                        }`}
                      >
                        {selectedCategory === category.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Info Note */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2 items-start mt-4">
                <div className="text-amber-600 dark:text-amber-400 text-lg">💡</div>
                <p className="text-xs text-black leading-relaxed">
                  اختيار نوع المشكلة سيساعدنا في عرض حلول أكثر دقة ومناسبة لحالتك
                </p>
              </div>
            </>
          ) : (
            // Technical Subcategories
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <ChevronRight className="size-5 text-black rotate-180" />
                </button>
                <p className="text-black font-medium">
                  حدد نوع المشكلة التقنية:
                </p>
              </div>

              <div className="space-y-3">
                {TECHNICAL_SUBCATEGORIES.map((subcategory) => (
                  <label
                    key={subcategory.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSubcategory === subcategory.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-slate-800 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subcategory"
                      value={subcategory.id}
                      checked={selectedSubcategory === subcategory.id}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-3xl">{subcategory.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-1">
                        {subcategory.name}
                      </div>
                      <div className="text-xs text-gray-700">
                        {subcategory.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedSubcategory === subcategory.id
                          ? 'border-amber-500'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {selectedSubcategory === subcategory.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-3 bg-stone-100 dark:bg-slate-800 text-black rounded-lg font-semibold hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors border-2 border-stone-200 dark:border-stone-700"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={showTechnicalSubcategories && !selectedSubcategory}
            style={{ background: 'linear-gradient(to right, #d97706, #ea580c)', borderRadius: '0.5rem', fontWeight: '600', padding: '0.75rem 1rem', flex: '1 1 0%', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', opacity: (showTechnicalSubcategories && !selectedSubcategory) ? 0.5 : 1, cursor: (showTechnicalSubcategories && !selectedSubcategory) ? 'not-allowed' : 'pointer' }}
            className="hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span style={{ color: '#ffffff !important' }}>تحديث النتائج</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
