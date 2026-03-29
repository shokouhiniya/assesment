import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Zap, Edit3, X, LogIn, Phone, Lock, Shield, Info } from 'lucide-react';
import { analyzeStatement, AnalysisResult } from './services/openRouterService';

const ScoreCard = ({ score, indexName }: { score: number; indexName: string }) => {
  const percentage = (score / 5) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 4) return { main: '#cd9d1e', bg: '#fef9e7' };
    if (s >= 2.5) return { main: '#41b1b1', bg: '#e8f6f6' };
    return { main: '#d79727', bg: '#fef5e7' };
  };

  const colors = getColor(score);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{indexName}</h3>
          <p className="text-xs text-gray-500">Regulation Health Index</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
          <Shield className="w-5 h-5" style={{ color: colors.main }} />
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90">
            <circle cx="88" cy="88" r={radius} stroke="#f5f5f5" strokeWidth="12" fill="none" />
            <circle
              cx="88" cy="88" r={radius}
              stroke={colors.main}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">{score}</span>
            <span className="text-sm text-gray-500 mt-1">از ۱۰۰</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex px-6 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: colors.bg, color: colors.main }}>
          وضعیت: متوسط
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Correction modal states
  const [showModal, setShowModal] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'form' | 'success'>('login');
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [correctionData, setCorrectionData] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const result = await analyzeStatement(input);
      setResults(result);
    } catch (err) {
      console.error(err);
      setError('خطا در تحلیل. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCorrection = (res: AnalysisResult) => {
    setSelectedResult(res);
    setCorrectionData({ ...res });
    setAuthStep('login');
    setShowModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/proxy/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: loginData.phone,
          password: loginData.password,
        }),
      });
      
      const data = await response.json();
      if (data.has_permission) {
        setUserId(data.id);
        setAuthStep('form');
      } else {
        alert('شما مجوز دسترسی ندارید یا اطلاعات ورود نادرست است.');
      }
    } catch (err) {
      console.error(err);
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionData || !selectedResult) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: correctionData.statement,
          indexName: correctionData.indexName,
          originalScore: selectedResult.score,
          correctedScore: correctionData.score,
          levelDefinition: correctionData.levelDefinition,
          logic: correctionData.logic,
          userId: userId
        }),
      });
      
      if (response.ok) {
        setAuthStep('success');
        setTimeout(() => {
          setShowModal(false);
          setAuthStep('login');
          setLoginData({ phone: '', password: '' });
        }, 2000);
      } else {
        alert('خطا در ثبت تصحیح.');
      }
    } catch (err) {
      console.error(err);
      alert('خطا در ثبت اطلاعات.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgScore = results ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/HTNI-Logo.svg" alt="حزب تمدن نوین اسلامی" className="h-14" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">سنجش حاکمیت ملی بر ارز</h1>
            <button
              onClick={() => setShowInfo(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5 text-[#41b1b1]" />
            </button>
          </div>
          <p className="text-sm text-gray-500">حزب تمدن نوین اسلامی</p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="متن سخنرانی، مصاحبه یا موضع‌گیری را وارد کنید..."
            className="w-full h-36 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all resize-none outline-none text-sm leading-relaxed placeholder:text-gray-400"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#41b1b1] text-white py-3.5 rounded-2xl font-bold hover:bg-[#3a9d9d] hover:shadow-lg hover:shadow-[#41b1b1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال تحلیل...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>تحلیل هوشمند</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-6">
            {results.map((res, idx) => (
              <div key={idx}>
                <ScoreCard score={res.score} indexName={res.indexName} />
                
                <div className="mt-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 shadow-sm border border-blue-100">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#41b1b1] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">خلاصه هوش مصنوعی</h4>
                      <p className="text-xs text-gray-600">تحلیل ۲۴ ساعت گذشته</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs text-gray-600 font-semibold mb-2">گزاره</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{res.statement}</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs text-[#41b1b1] font-semibold mb-2">سطح انطباق</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{res.levelDefinition}</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-xs text-[#5d3860] font-semibold mb-2">منطق ارزیابی</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{res.logic}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenCorrection(res)}
                    className="w-full mt-4 bg-[#41b1b1] text-white py-3 rounded-xl font-bold hover:bg-[#3a9d9d] transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    اصلاح ارزیابی
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            ابزار تحلیل سیاست‌های ارزی • حزب تمدن نوین اسلامی
          </p>
        </div>
      </div>

      {/* Correction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#41b1b1]/10 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-[#41b1b1]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">اصلاح ارزیابی</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {authStep === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    برای اصلاح ارزیابی، لطفاً وارد شوید
                  </p>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="شماره موبایل"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        className="w-full pr-10 pl-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all outline-none text-sm"
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="رمز عبور"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pr-10 pl-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#41b1b1] text-white py-3 rounded-xl font-bold hover:bg-[#3a9d9d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span className="text-sm">ورود</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {authStep === 'form' && correctionData && selectedResult && (
                <form onSubmit={handleSubmitCorrection} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">نمره اصلاح شده (۰ تا ۵)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        required
                        value={correctionData.score}
                        onChange={(e) => setCorrectionData({ ...correctionData, score: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all outline-none text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">تعریف سطح انطباق</label>
                      <textarea
                        required
                        value={correctionData.levelDefinition}
                        onChange={(e) => setCorrectionData({ ...correctionData, levelDefinition: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all outline-none text-sm h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">منطق ارزیابی</label>
                      <textarea
                        required
                        value={correctionData.logic}
                        onChange={(e) => setCorrectionData({ ...correctionData, logic: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all outline-none text-sm h-20 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#348a3b] text-white py-3 rounded-xl font-bold hover:bg-[#2d7532] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">ثبت تصحیح</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {authStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#348a3b]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#348a3b]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">تصحیح ثبت شد</h3>
                  <p className="text-sm text-gray-600">با تشکر از همکاری شما</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#41b1b1]/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-[#41b1b1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">درباره شاخص حاکمیت ملی بر ارز</h2>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)] space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">🎯 هدف</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    سنجش میزان پایبندی سیاستمداران به این اصل: «ارز حاصل از صادرات یک منبع ملی است و باید به کشور بازگردد، به‌صورت هدفمند تخصیص یابد، و با نرخ عادلانه مدیریت شود.»
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">📊 سه شاخص اصلی</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#cd9d1e]/5 rounded-xl border border-[#cd9d1e]/20">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">۱. بازگشت ارز صادراتی (وزن: ۰.۴)</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">میزان حمایت از الزام بازگشت ارز به کشور</p>
                      <ul className="text-xs text-gray-600 space-y-1 mr-4">
                        <li>• نمره ۵: الزام کامل و بدون استثنا</li>
                        <li>• نمره ۳: بازگشت جزئی یا مشروط</li>
                        <li>• نمره ۰: رد کامل اصل بازگشت</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#41b1b1]/5 rounded-xl border border-[#41b1b1]/20">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">۲. تخصیص و توزیع ارز (وزن: ۰.۳)</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">نگاه به نقش دولت در توزیع ارز</p>
                      <ul className="text-xs text-gray-600 space-y-1 mr-4">
                        <li>• نمره ۵: تخصیص کامل توسط دولت</li>
                        <li>• نمره ۳: مدل ترکیبی (دولت + بازار)</li>
                        <li>• نمره ۰: رد کامل نقش دولت</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#5d3860]/5 rounded-xl border border-[#5d3860]/20">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">۳. عدالت در نرخ‌گذاری (وزن: ۰.۳)</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">نگاه به تعیین نرخ ارز</p>
                      <ul className="text-xs text-gray-600 space-y-1 mr-4">
                        <li>• نمره ۵: تعیین کامل توسط دولت</li>
                        <li>• نمره ۳: شناور مدیریت‌شده</li>
                        <li>• نمره ۰: بازار کاملاً آزاد</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">📋 اصول کدگذاری</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[#348a3b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#348a3b]">۱</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">فقط دلالت صریح</p>
                        <p className="text-xs text-gray-600">تحلیل، کنایه و برداشت شخصی ممنوع</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[#348a3b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#348a3b]">۲</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">عدم فرض نیت</p>
                        <p className="text-xs text-gray-600">فقط متن صریح، نه حدس و گمان</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    این ابزار با استفاده از هوش مصنوعی، گزاره‌های سیاستی را تحلیل و امتیازدهی می‌کند. نتایج برای بهبود دقت مدل، قابل اصلاح توسط کارشناسان مجاز است.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
