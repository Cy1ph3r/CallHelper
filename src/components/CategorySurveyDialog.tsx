import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

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
  },
  {
    id: 'operational',
    icon: '⚙️',
    name: 'مشكلة تشغيلية',
    description: 'إجراءات، صلاحيات، عمليات يومية',
  },
  {
    id: 'financial',
    icon: '💰',
    name: 'مشكلة مالية',
    description: 'مدفوعات، فواتير، رسوم، استرجاع أموال',
  },
  {
    id: 'complaint',
    icon: '📢',
    name: 'شكوى',
    description: 'عدم رضا، خدمة سيئة، مشكلة مع موظف',
  },
  {
    id: 'general',
    icon: '❓',
    name: 'استفسار عام',
    description: 'أسئلة، معلومات، توضيحات',
  },
];

export function CategorySurveyDialog({ open, onOpenChange, onSubmit }: CategorySurveyDialogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('operational');

  const handleSubmit = () => {
    onSubmit(selectedCategory);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 -mx-6 -mt-6 px-8 py-8 mb-6 text-center text-white rounded-t-lg">
          <div className="text-5xl mb-4">🔍</div>
          <DialogTitle className="text-2xl mb-2">لم تجد الحل المناسب؟</DialogTitle>
          <DialogDescription className="text-purple-100 text-sm">
            ساعدنا في تحسين النتائج بتحديد نوع المشكلة
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-stone-700 dark:text-stone-300 font-medium mb-4">
            حدد نوع المشكلة التي تواجهها:
          </p>

          <div className="space-y-3">
            {CATEGORIES.map((category) => (
              <label
                key={category.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedCategory === category.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-slate-800 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="sr-only"
                />
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    {category.name}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-stone-400">
                    {category.description}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedCategory === category.id
                      ? 'border-purple-500'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {selectedCategory === category.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2 items-start mt-4">
            <div className="text-amber-600 dark:text-amber-400 text-lg">💡</div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              اختيار نوع المشكلة سيساعدنا في عرض حلول أكثر دقة ومناسبة لحالتك
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-3 bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 rounded-lg font-semibold hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors border-2 border-stone-200 dark:border-stone-700"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            تحديث النتائج
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
