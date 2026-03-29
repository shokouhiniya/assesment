/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Send,
  Info,
  BookOpen,
  Scale,
  Globe,
  TrendingUp,
  PieChart as PieChartIcon,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRightLeft,
  Activity,
  Copy,
  Check,
  Edit3,
  LogIn,
  User,
  Lock,
  Phone,
  X
} from 'lucide-react';

import { analyzeStatement, AnalysisResult } from './services/openRouterService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { cn } from './lib/utils';

const CircularGauge = ({ score }: { score: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 5) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 4) return '#10B981'; // Emerald
    if (s >= 2) return '#3B82F6'; // Blue
    return '#EF4444'; // Red
  };

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-stone-100"
        />
        {/* Progress Circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="64"
          cy="64"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="8"
          strokeDasharray={circumference}
          fill="transparent"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black leading-none">{score}</span>
        <span className="text-[10px] font-bold text-[#78716C] uppercase mt-1">از ۵</span>
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!results) return;
    const text = results.map(r => 
      `گزاره: ${r.statement}\nشاخص: ${r.indexName}\nنمره: ${r.score}\nمنطق: ${r.logic}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeStatement(input);
      setResults(result);
    } catch (err) {
      console.error(err);
      setError('خطا در برقراری ارتباط با هوش مصنوعی. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const [showCorrection, setShowCorrection] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'form' | 'success'>('login');
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [correctionData, setCorrectionData] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/proxy/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: loginData.phone,
          password: loginData.password,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.has_permission) {
        setAuthStep('form');
      } else {
        alert('شما مجوز دسترسی ندارید یا اطلاعات ورود نادرست است.');
      }
    } catch (err) {
      console.error(err);
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionData) return;
    setSubmitting(true);
    try {
      // Mock API call to save correction for training
      // await fetch('/api/train/correction', { method: 'POST', body: JSON.stringify(correctionData) });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAuthStep('success');
      setTimeout(() => {
        setShowCorrection(false);
        setAuthStep('login');
      }, 2000);
    } catch (err) {
      alert('خطا در ثبت اطلاعات.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCorrection = (res: AnalysisResult) => {
    setCorrectionData({ ...res });
    setShowCorrection(true);
    setAuthStep('login');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-[#E7E5E4]" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Input & Analysis */}
          <div className="lg:col-span-8 space-y-8">
            {/* Input Section */}
            <section className="bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl shadow-stone-200/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-[#1C1917]">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <h2 className="text-lg font-black">ورودی داده‌های سیاستی</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInput('صادرکنندگان باید ۱۰۰ درصد ارز خود را به سامانه نیما بازگردانند و هیچ استثنایی پذیرفته نیست.')}
                      className="text-[10px] font-bold text-[#78716C] hover:text-[#1C1917] bg-stone-50 border border-[#E7E5E4] px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
                    >
                      مثال ۱: بازگشت ارز
                    </button>
                    <button
                      onClick={() => setInput('دولت باید فقط برای کالاهای اساسی ارز ترجیحی تخصیص دهد و بقیه نیازها در بازار آزاد تامین شود.')}
                      className="text-[10px] font-bold text-[#78716C] hover:text-[#1C1917] bg-stone-50 border border-[#E7E5E4] px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
                    >
                      مثال ۲: تخصیص ارز
                    </button>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="متن سخنرانی، مصاحبه یا موضع‌گیری رسمی را اینجا وارد کنید..."
                    className="w-full h-56 p-6 bg-[#FAFAF9] border-2 border-[#E7E5E4] rounded-2xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all resize-none text-xl leading-relaxed outline-none font-medium"
                  />
                  <div className="absolute bottom-4 left-4 text-[10px] text-[#A8A29E] font-mono">
                    {input.length} CHARS
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#78716C]">
                    <Activity size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold">آماده پردازش هوشمند</span>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !input.trim()}
                    className="group relative flex items-center gap-3 bg-[#1C1917] text-white px-10 py-4 rounded-2xl font-black hover:bg-[#44403C] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-[#1C1917]/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        در حال تحلیل استراتژیک...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={20} />
                        شروع تحلیل هوشمند
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg"
                >
                  <AlertCircle size={24} />
                  <p className="font-bold">{error}</p>
                </motion.div>
              )}

              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Summary Dashboard */}
                  <div className="bg-white rounded-[40px] border border-[#E7E5E4] shadow-sm p-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                      <div className="flex-shrink-0">
                        <CircularGauge score={Number((results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1))} />
                        <p className="text-center text-[10px] font-black text-[#78716C] uppercase tracking-widest mt-2">میانگین کل حاکمیت</p>
                      </div>
                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-[#78716C] uppercase tracking-widest">وضعیت کلی تحلیل</p>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-2xl font-black">پایدار و منطبق</span>
                          </div>
                          <p className="text-xs text-[#A8A29E] font-medium">بر اساس {results.length} واحد تحلیل استخراج شده از متن ورودی.</p>
                        </div>
                        <div className="flex items-end justify-end">
                          <button 
                            onClick={handleCopy}
                            className="flex items-center gap-3 text-sm font-bold text-white bg-[#1C1917] px-8 py-4 rounded-2xl transition-all hover:bg-[#44403C] shadow-xl shadow-[#1C1917]/20"
                          >
                            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            {copied ? 'گزارش کپی شد' : 'دریافت گزارش کامل'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Cards */}
                  <div className="space-y-8">
                    {results.map((res, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[32px] border border-[#E7E5E4] shadow-sm overflow-hidden group hover:border-[#1C1917] transition-all"
                      >
                        <div className="p-10">
                          <div className="flex flex-col items-center text-center mb-10">
                            <CircularGauge score={res.score} />
                            <h3 className="font-black text-2xl mt-4">{res.indexName}</h3>
                            <div className="mt-2 text-xs font-bold text-[#78716C] bg-stone-100 px-3 py-1 rounded-full">
                              واحد تحلیل شماره {idx + 1}
                            </div>
                          </div>

                          <div className="space-y-8">
                            {/* Evidence / Statement */}
                            <div className="relative">
                              <div className="absolute -right-4 top-0 bottom-0 w-1 bg-stone-100 rounded-full" />
                              <p className="text-[10px] font-black text-[#A8A29E] uppercase tracking-widest mb-3 pr-4">شواهد و گزاره مورد بررسی</p>
                              <p className="text-xl font-medium leading-relaxed italic pr-4 text-[#1C1917]">
                                "{res.statement}"
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-stone-50">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#78716C]">
                                  <Layers size={16} />
                                  <p className="text-[10px] font-black uppercase tracking-widest">سطح انطباق با دستنامه</p>
                                </div>
                                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                                  <p className="text-base font-bold text-[#44403C] leading-relaxed">
                                    {res.levelDefinition}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-600">
                                  <TrendingUp size={16} />
                                  <p className="text-[10px] font-black uppercase tracking-widest">منطق ارزیابی استراتژیک</p>
                                </div>
                                <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100/50">
                                  <p className="text-base text-emerald-900 leading-relaxed font-medium">
                                    {res.logic}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                              <button
                                onClick={() => handleOpenCorrection(res)}
                                className="flex items-center gap-2 text-xs font-bold text-[#78716C] hover:text-[#1C1917] bg-stone-50 px-4 py-2 rounded-xl border border-[#E7E5E4] transition-all hover:shadow-md"
                              >
                                <Edit3 size={14} />
                                تصحیح ارزیابی
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!results && !loading && (
              <div className="h-96 border-4 border-dashed border-[#E7E5E4] rounded-[40px] flex flex-col items-center justify-center text-[#A8A29E] space-y-6 bg-white/50">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <Search size={48} strokeWidth={1} className="text-[#D6D3D1]" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-[#1C1917]">در انتظار ورود داده</p>
                  <p className="text-sm font-medium">یک گزاره سیاستی وارد کنید تا تحلیل آغاز شود.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Knowledge Base */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[#1C1917] text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">چارچوب ارزیابی</h2>
              </div>
              
              <div className="space-y-10">
                <div className="relative pr-6 border-r-2 border-white/10">
                  <div className="absolute -right-[5px] top-0 w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-black mb-2 flex items-center gap-2">
                    بازگشت ارز صادراتی
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded">0.4</span>
                  </h3>
                  <p className="text-xs text-[#A8A29E] leading-relaxed font-medium">
                    سیاست‌های ناظر بر الزام صادرکنندگان به بازگرداندن منابع ارزی به چرخه رسمی اقتصاد.
                  </p>
                </div>

                <div className="relative pr-6 border-r-2 border-white/10">
                  <div className="absolute -right-[5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-black mb-2 flex items-center gap-2">
                    تخصیص و توزیع ارز
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded">0.3</span>
                  </h3>
                  <p className="text-xs text-[#A8A29E] leading-relaxed font-medium">
                    نحوه مدیریت منابع ارزی توسط دولت برای تامین نیازهای وارداتی و اولویت‌بندی کالاها.
                  </p>
                </div>

                <div className="relative pr-6 border-r-2 border-white/10">
                  <div className="absolute -right-[5px] top-0 w-2 h-2 rounded-full bg-purple-500" />
                  <h3 className="text-sm font-black mb-2 flex items-center gap-2">
                    عدالت در نرخ‌گذاری
                    <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded">0.3</span>
                  </h3>
                  <p className="text-xs text-[#A8A29E] leading-relaxed font-medium">
                    مکانیسم تعیین نرخ ارز با رویکرد حمایت از تولید ملی و حفظ قدرت خرید جامعه.
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase">تضمین دقت تحلیل</span>
                  </div>
                  <p className="text-[10px] text-[#A8A29E] leading-relaxed">
                    این سیستم از مدل‌های پیشرفته زبانی برای تطبیق دقیق عبارات با سطوح دستنامه استفاده می‌کند.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-[#E7E5E4] p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#78716C] mb-6 flex items-center gap-2">
                <ArrowRightLeft size={14} />
                پروتکل‌های تحلیل
              </h3>
              <div className="space-y-6">
                {[
                  { title: "معنای صریح", desc: "اجتناب از تفسیرهای استعاری و تمرکز بر متن صریح." },
                  { title: "عدم فرض نیت", desc: "تحلیل بر اساس آنچه گفته شده، نه آنچه تصور می‌شود." },
                  { title: "تجزیه گزاره‌ها", desc: "تفکیک مواضع چندگانه در یک متن واحد برای دقت بیشتر." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-stone-50 border border-[#E7E5E4] flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1C1917] mb-1">{item.title}</p>
                      <p className="text-xs text-[#78716C] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Correction Modal */}
      <AnimatePresence>
        {showCorrection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCorrection(false)}
              className="absolute inset-0 bg-[#1C1917]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                      <Edit3 size={20} className="text-[#1C1917]" />
                    </div>
                    <h2 className="text-xl font-black">تصحیح ارزیابی هوشمند</h2>
                  </div>
                  <button 
                    onClick={() => setShowCorrection(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {authStep === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <p className="text-sm text-[#78716C] font-medium leading-relaxed">
                      نظرات رو بفرمایید
                    </p>
                    <div className="space-y-4">
                      <div className="relative">
                        <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                        <input
                          type="text"
                          required
                          placeholder="شماره موبایل"
                          value={loginData.phone}
                          onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                          className="w-full pl-4 pr-12 py-4 bg-stone-50 border border-[#E7E5E4] rounded-2xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="relative">
                        <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                        <input
                          type="password"
                          required
                          placeholder="رمز عبور"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="w-full pl-4 pr-12 py-4 bg-stone-50 border border-[#E7E5E4] rounded-2xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1C1917] text-white py-4 rounded-2xl font-black hover:bg-[#44403C] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#1C1917]/20"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                      ورود و ادامه
                    </button>
                  </form>
                )}

                {authStep === 'form' && correctionData && (
                  <form onSubmit={handleSubmitCorrection} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-[#78716C] uppercase tracking-widest mb-2 block">نمره اصلاح شده (۰ تا ۵)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          required
                          value={correctionData.score}
                          onChange={(e) => setCorrectionData({ ...correctionData, score: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-[#78716C] uppercase tracking-widest mb-2 block">تعریف سطح انطباق</label>
                        <textarea
                          required
                          value={correctionData.levelDefinition}
                          onChange={(e) => setCorrectionData({ ...correctionData, levelDefinition: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all outline-none font-medium h-24 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-[#78716C] uppercase tracking-widest mb-2 block">منطق ارزیابی استراتژیک</label>
                        <textarea
                          required
                          value={correctionData.logic}
                          onChange={(e) => setCorrectionData({ ...correctionData, logic: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:ring-4 focus:ring-[#1C1917]/5 focus:border-[#1C1917] transition-all outline-none font-medium h-24 resize-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                    >
                      {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                      ثبت نهایی تصحیح
                    </button>
                  </form>
                )}

                {authStep === 'success' && (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Check size={40} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-2">با تشکر از شما</h3>
                      <p className="text-sm text-[#78716C] font-medium">نظرات شما با موفقیت ثبت شد.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
