import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Clock, CalendarIcon, X } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const API_BASE_URL = 'http://localhost:5000';

export function LiveIndicators() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  
  // Real data states
  const [stats, setStats] = useState<any>(null);
  const [popularQueries, setPopularQueries] = useState<any[]>([]);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState<any>(null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, popularRes, recentRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/analytics/stats`),
          axios.get(`${API_BASE_URL}/api/analytics/popular?limit=5`),
          axios.get(`${API_BASE_URL}/api/analytics/recent?limit=10`)
        ]);
        setStats(statsRes.data);
        setPopularQueries(popularRes.data);
        setRecentQueries(recentRes.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats cards with real data
  const statsCards = stats ? [
    {
      title: 'إجمالي الاستعلامات',
      value: stats.total_queries.toString(),
      change: '+' + ((stats.today_queries / stats.total_queries) * 100).toFixed(1) + '%',
      trend: 'up',
      color: 'from-gray-400 to-gray-300',
      activeColor: 'from-amber-700 to-amber-500',
      subValue: `اليوم: ${stats.today_queries}`
    },
    {
      title: 'معدل النجاح',
      value: stats.success_rate.toFixed(1) + '%',
      change: stats.success_rate > 70 ? 'ممتاز' : 'جيد',
      trend: stats.success_rate > 70 ? 'up' : 'neutral',
      color: 'from-gray-400 to-gray-300',
      activeColor: 'from-amber-700 to-amber-500',
    },
    {
      title: 'متوسط وقت الاستجابة',
      value: stats.avg_response_time_ms.toFixed(0) + ' ms',
      change: stats.avg_response_time_ms < 500 ? 'سريع' : 'معتدل',
      trend: stats.avg_response_time_ms < 500 ? 'up' : 'neutral',
      color: 'from-gray-400 to-gray-300',
      activeColor: 'from-amber-700 to-amber-500',
    },
    {
      title: 'استعلامات هذا الأسبوع',
      value: stats.week_queries.toString(),
      change: `هذا الشهر: ${stats.month_queries}`,
      trend: 'up',
      color: 'from-gray-400 to-gray-300',
      activeColor: 'from-amber-700 to-amber-500',
    },
  ] : [
    { title: 'جاري التحميل...', value: '...', change: '', trend: 'neutral', color: 'from-gray-400 to-gray-300', activeColor: 'from-amber-700 to-amber-500' },
    { title: 'جاري التحميل...', value: '...', change: '', trend: 'neutral', color: 'from-gray-400 to-gray-300', activeColor: 'from-amber-700 to-amber-500' },
    { title: 'جاري التحميل...', value: '...', change: '', trend: 'neutral', color: 'from-gray-400 to-gray-300', activeColor: 'from-amber-700 to-amber-500' },
    { title: 'جاري التحميل...', value: '...', change: '', trend: 'neutral', color: 'from-gray-400 to-gray-300', activeColor: 'from-amber-700 to-amber-500' },
  ];

  // Bar chart data from popular queries
  const barChartData = popularQueries.length > 0 ? popularQueries.map(q => ({
    name: q.query.length > 20 ? q.query.substring(0, 20) + '...' : q.query,
    value: q.count
  })) : [
    { name: 'لا توجد بيانات', value: 0 },
  ];

  const barColors = ['#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#e0e0e0'];

  // Platforms data from user type breakdown
  const platformsData = stats && stats.user_type_breakdown.length > 0 ? 
    stats.user_type_breakdown.map((item: any, index: number) => ({
      name: item._id === 'umrah' ? 'شركات العمرة' : item._id === 'external' ? 'الوكلاء الخارجيين' : item._id || 'غير محدد',
      value: item.count,
      color: ['#8d6e63', '#a1887f', '#bcaaa4'][index % 3]
    })) : [
    { name: 'لا توجد بيانات', value: 1, color: '#e0e0e0' },
  ];

  const devicesData = [
    { name: 'سطح المكتب', value: 60, color: '#10b981' },
    { name: 'موبايل', value: 25, color: '#f59e0b' },
    { name: 'تابلت', value: 15, color: '#8d6e63' },
  ];

  const issuesData = [
    { name: 'مشكلة حرجة', value: 15, color: '#d84315' },
    { name: 'مشكلة متوسطة', value: 35, color: '#f59e0b' },
    { name: 'مشكلة بسيطة', value: 50, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[rgb(0,0,0)] dark:text-white mb-1 text-right font-bold">المؤشرات اللحظية</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="size-4" />
            <span>2023-11-30 إلى 2023-12-06</span>
          </div>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-3">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} dir="rtl">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="year">هذه السنة</TabsTrigger>
              <TabsTrigger value="month">هذا الشهر</TabsTrigger>
              <TabsTrigger value="week">هذا الأسبوع</TabsTrigger>
              <TabsTrigger value="today">اليوم</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Custom Date Time Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                <CalendarIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  dir="rtl"
                />
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2 justify-center">
                    <Select value={hour} onValueChange={setHour}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="الساعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-lg">:</span>
                    <Select value={minute} onValueChange={setMinute}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="الدقيقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {date && `${date.toLocaleDateString('ar-SA')} - ${hour}:${minute}`}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedCategory(stat.title);
              setSelectedCardData(stat);
              setShowDetailDialog(true);
            }}
            className="text-right"
          >
            <Card className={`border-0 shadow-md hover:shadow-lg transition-all overflow-hidden ${
              selectedCategory === stat.title ? 'ring-2 ring-primary scale-[1.02]' : ''
            }`}>
              <div className={`h-2 bg-gradient-to-r ${selectedCategory === stat.title ? stat.activeColor : stat.color}`} />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{stat.title}</p>
                  <div className="flex items-center justify-center w-5 h-5">
                    {stat.trend === 'up' && <TrendingUp className="size-5 text-green-500" />}
                    {stat.trend === 'down' && <TrendingDown className="size-5 text-orange-500" />}
                    {stat.trend === 'neutral' && <Clock className="size-5 text-blue-500" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl text-gray-900 dark:text-white">{stat.value}</h3>
                  {stat.subValue && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subValue}</p>
                  )}
                  {stat.change && (
                    <p className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Charts Grid - Only show when "المشاكل العامة" is selected or "اليوم" tab is selected */}
      {(selectedCategory === 'المشاكل العامة' || selectedPeriod === 'today') && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platforms Distribution */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md m-[0px]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white text-right font-bold">الجهات المتضررة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {platformsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        verticalAlign="bottom" 
                        height={50}
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>} className="mx-[1px] px-[5px] mx-[5px] my-[0px] px-[7px] py-[0px]"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-right font-bold">الإحصائيات الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={0} 
                      textAnchor="middle" 
                      height={70}
                      interval={0}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      wrapperClassName="dark:!bg-slate-800"
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fill: '#64748b',
                        fontSize: 13,
                        fontWeight: 600,
                        offset: 8
                      }}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Success vs Failed Queries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Queries */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-right font-bold">استعلامات اليوم</CardTitle>
              </CardHeader>
              <CardContent className="pt-[0px] pr-[24px] pb-[24px] pl-[24px]">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={stats ? [
                        { name: 'اليوم', value: stats.today_queries, color: '#d97706' },
                        { name: 'بقية الأسبوع', value: Math.max(0, stats.week_queries - stats.today_queries), color: '#e5e7eb' },
                      ] : [{ name: 'لا توجد بيانات', value: 1, color: '#e5e7eb' }]}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 35;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#64748b" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ fontSize: '13px', fontWeight: '500' }}
                          >
                            {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                      labelLine={{
                        stroke: '#94a3b8',
                        strokeWidth: 1.5,
                        length: 15,
                        lengthType: 'percent'
                      }}
                    >
                      {(stats ? [
                        { name: 'اليوم', value: stats.today_queries, color: '#d97706' },
                        { name: 'بقية الأسبوع', value: Math.max(0, stats.week_queries - stats.today_queries), color: '#e5e7eb' },
                      ] : [{ name: 'لا توجد بيانات', value: 1, color: '#e5e7eb' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">نسبة استعلامات اليوم</p>
                  <p className="text-2xl text-amber-600 dark:text-amber-500">
                    {stats && stats.week_queries > 0 ? ((stats.today_queries / stats.week_queries) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-right font-bold">معدل النجاح</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={stats ? [
                        { name: 'ناجحة', value: Math.round(stats.total_queries * stats.success_rate / 100), color: '#10b981' },
                        { name: 'فاشلة', value: Math.round(stats.total_queries * (100 - stats.success_rate) / 100), color: '#ef4444' },
                      ] : [{ name: 'لا توجد بيانات', value: 1, color: '#e5e7eb' }]}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 35;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#64748b" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ fontSize: '13px', fontWeight: '500' }}
                          >
                            {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                      labelLine={{
                        stroke: '#94a3b8',
                        strokeWidth: 1.5,
                        length: 15,
                        lengthType: 'percent'
                      }}
                    >
                      {(stats ? [
                        { name: 'ناجحة', value: Math.round(stats.total_queries * stats.success_rate / 100), color: '#10b981' },
                        { name: 'فاشلة', value: Math.round(stats.total_queries * (100 - stats.success_rate) / 100), color: '#ef4444' },
                      ] : [{ name: 'لا توجد بيانات', value: 1, color: '#e5e7eb' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">معدل النجاح</p>
                  <p className="text-2xl text-green-600 dark:text-green-500">{stats ? stats.success_rate.toFixed(1) : 0}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Pie Charts Row */}
          <div className="grid grid-cols-1 gap-6">
            {/* Summary Stats Card */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-stone-200 to-stone-100 dark:from-stone-700 dark:to-stone-600">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white font-bold text-right">ملخص عام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200">إجمالي الاستعلامات</span>
                  <span className="text-lg text-gray-900 dark:text-white">{stats ? stats.total_queries : 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200">معدل النجاح</span>
                  <span className="text-lg text-gray-900 dark:text-white">{stats ? stats.success_rate.toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200">متوسط وقت الاستجابة</span>
                  <span className="text-lg text-gray-900 dark:text-white">{stats ? stats.avg_response_time_ms.toFixed(0) : 0} ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-200">استعلامات هذا الشهر</span>
                  <span className="text-lg text-gray-900 dark:text-white">{stats ? stats.month_queries : 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Update Bar */}
          <div className="bg-gradient-to-r from-stone-200 to-stone-100 dark:from-stone-700 dark:to-stone-600 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Clock className="size-5" />
                <span className="font-bold">آخر تحديث</span>
              </div>
              <div className="text-right text-gray-700 dark:text-gray-200">
                <p className="text-sm">الجمعة، 15 نوفمبر 2025</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">الساعة 10:30 صباحاً</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg text-right h-[80vh] p-4 flex flex-col" dir="rtl">
          <DialogHeader className="mb-3 flex-shrink-0">
            <DialogTitle className="text-right text-base font-bold">
              {selectedCardData?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-scroll space-y-3 pr-2" style={{scrollbarWidth: 'thin'}}>
            {/* Main Value */}
            <div className="text-center p-3 border-2 border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900 rounded-lg">
              <h2 className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {selectedCardData?.value}
              </h2>
              {selectedCardData?.subValue && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedCardData.subValue}</p>
              )}
            </div>

            {/* Recent Queries Table */}
            {selectedCardData?.title === 'إجمالي الاستعلامات' && recentQueries.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-1 text-right">آخر الاستعلامات</h3>
                <div className="space-y-1 h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
                  {recentQueries.map((query, idx) => (
                    <div key={idx} className="p-2 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 truncate text-right">
                          {query.query}
                        </div>
                        <span className={`ml-2 w-3 h-3 rounded-full flex-shrink-0 ${query.success ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {query.user_type === 'umrah' ? 'عمرة' : 'خارجي'} • {query.response_time_ms}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Rate Details */}
            {selectedCardData?.title === 'معدل النجاح' && stats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border border-green-200 bg-green-50 rounded text-center">
                  <div className="text-[10px] text-gray-600">ناجحة</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(stats.total_queries * stats.success_rate / 100)}
                  </div>
                </div>
                <div className="p-2 border border-red-200 bg-red-50 rounded text-center">
                  <div className="text-[10px] text-gray-600">فاشلة</div>
                  <div className="text-lg font-bold text-red-600">
                    {Math.round(stats.total_queries * (100 - stats.success_rate) / 100)}
                  </div>
                </div>
              </div>
            )}

            {/* Response Time Details */}
            {selectedCardData?.title === 'متوسط وقت الاستجابة' && stats && (
              <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">المتوسط</span>
                  <span className="text-base font-bold text-blue-600">
                    {stats.avg_response_time_ms.toFixed(0)} ms
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-xs font-medium ${
                    stats.avg_response_time_ms < 100 ? 'text-green-600' :
                    stats.avg_response_time_ms < 500 ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {stats.avg_response_time_ms < 100 ? 'ممتاز' :
                     stats.avg_response_time_ms < 500 ? 'جيد' :
                     'بطيء'}
                  </span>
                </div>
              </div>
            )}

            {/* Weekly Queries Details */}
            {selectedCardData?.title === 'استعلامات هذا الأسبوع' && stats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border border-amber-200 rounded text-center">
                  <div className="text-[10px] text-gray-600">الأسبوع</div>
                  <div className="text-lg font-bold text-amber-600">
                    {stats.week_queries}
                  </div>
                </div>
                <div className="p-2 border border-gray-200 rounded text-center">
                  <div className="text-[10px] text-gray-600">الشهر</div>
                  <div className="text-lg font-bold text-gray-600">
                    {stats.month_queries}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
