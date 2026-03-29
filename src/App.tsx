import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, TrendingUp, FileText, BarChart3, Zap } from 'lucide-react';
import { analyzeStatement, AnalysisResult } from './services/openRouterService';

const ScoreCircle = ({ score }: { score: number }) => {
  const percentage = (score / 5) * 100;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 4) return '#348a3b';
    if (s >= 2.5) return '#41b1b1';
    return '#7c2625';
  };

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="#f8f5f0"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke={getColor(score)}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{score}</span>
        <span className="text-[9px] text-gray-500 font-medium">از ۵</span>
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const avgScore = results ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/HTNI-Logo.svg" alt="حزب تمدن نوین اسلامی" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">سنجش حاکمیت ملی بر ارز</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-1 h-1 rounded-full bg-[#41b1b1]" />
            <span>حزب تمدن نوین اسلامی</span>
            <div className="w-1 h-1 rounded-full bg-[#41b1b1]" />
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="متن سخنرانی، مصاحبه یا موضع‌گیری را وارد کنید..."
            className="w-full h-32 p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-[#41b1b1] focus:ring-2 focus:ring-[#41b1b1]/10 transition-all resize-none outline-none text-sm leading-relaxed placeholder:text-gray-400"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#41b1b1] to-[#5d3860] text-white py-3 rounded-xl font-semibold hover:shadow-md hover:shadow-[#41b1b1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">در حال تحلیل...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-sm">تحلیل هوشمند</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#7c2625]/5 border border-[#7c2625]/20 text-[#7c2625] p-4 rounded-xl flex items-center gap-3 mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">میانگین نمره</p>
                  <p className="text-3xl font-bold text-gray-900">{avgScore}</p>
                  <p className="text-xs text-gray-400 mt-1">{results.length} شاخص ارزیابی شده</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#348a3b]/10 to-[#348a3b]/5 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#348a3b]" />
                </div>
              </div>
            </div>

            {/* Analysis Cards */}
            {results.map((res, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="inline-block px-2 py-0.5 bg-[#41b1b1]/10 text-[#41b1b1] text-[10px] font-bold rounded mb-2">
                        شاخص {idx + 1}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">{res.indexName}</h3>
                    </div>
                    <ScoreCircle score={res.score} />
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">گزاره</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{res.statement}</p>
                    </div>

                    <div className="p-3 bg-[#41b1b1]/5 rounded-lg">
                      <p className="text-[10px] text-[#41b1b1] font-semibold mb-1.5 uppercase tracking-wide">سطح انطباق</p>
                      <p className="text-xs text-gray-800 leading-relaxed">{res.levelDefinition}</p>
                    </div>

                    <div className="p-3 bg-[#5d3860]/5 rounded-lg">
                      <p className="text-[10px] text-[#5d3860] font-semibold mb-1.5 uppercase tracking-wide">منطق ارزیابی</p>
                      <p className="text-xs text-gray-800 leading-relaxed">{res.logic}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            ابزار تحلیل سیاست‌های ارزی • حزب تمدن نوین اسلامی
          </p>
        </div>
      </div>
    </div>
  );
}
