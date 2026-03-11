import React, { useState } from 'react';
import { Play, Code, Globe, Database, Bug, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ScraperStudio({ language }: { language: 'zh' | 'en' }) {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('');
  const [selector, setSelector] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedHeaders = {};
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch (e) {
          throw new Error(language === 'zh' ? '请求头 JSON 格式错误' : 'Invalid Headers JSON');
        }
      }

      const res = await fetch('/api/scrape/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method,
          headers: parsedHeaders,
          body: body.trim() || undefined,
          selector: selector.trim() || undefined
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Bug className="w-8 h-8 text-indigo-600" />
          {language === 'zh' ? '爬虫实验室 (Scraper Studio)' : 'Scraper Studio'}
        </h1>
        <p className="text-gray-600 max-w-3xl">
          {language === 'zh' 
            ? '由于真实的酒店 API 拥有极强的反爬虫机制，我们为您提供了一个后端的 HTTP 客户端工具。您可以使用浏览器的“开发者工具 (F12)”，找到真实的 API 请求，将 URL、Headers (包含 Cookie) 复制到这里进行测试。'
            : 'Since real hotel APIs have strong anti-bot mechanisms, we provide a backend HTTP client tool. Use your browser\'s Developer Tools (F12) to find real API requests, and copy the URL and Headers (including Cookie) here to test.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Request Builder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {language === 'zh' ? '构建请求' : 'Request Builder'}
          </div>
          
          <div className="p-4 space-y-4 flex-1">
            <div className="flex gap-2">
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-mono"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
              </select>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Headers (JSON)
              </label>
              <textarea 
                rows={6}
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                placeholder='{"Authorization": "Bearer token", "Cookie": "..."}'
              />
            </div>

            {method !== 'GET' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Body (JSON / String)
                </label>
                <textarea 
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  placeholder='{"query": "graphql..."}'
                />
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 flex justify-between">
                <span>{language === 'zh' ? 'Cheerio CSS 选择器 (可选)' : 'Cheerio CSS Selector (Optional)'}</span>
                <span className="text-gray-500 font-normal text-xs">e.g., .price-cash</span>
              </label>
              <input 
                type="text" 
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder=".hotel-price"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === 'zh' ? '如果响应是 HTML，将尝试提取该选择器的文本内容。' : 'If response is HTML, attempts to extract text for this selector.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Play className="w-5 h-5" />
              )}
              {language === 'zh' ? '发送请求 (Run Scraper)' : 'Run Scraper'}
            </button>
          </div>
        </div>

        {/* Right Column: Response Viewer */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-800 overflow-hidden flex flex-col h-[800px]">
          <div className="bg-[#2D2D2D] border-b border-gray-700 px-4 py-3 font-medium text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {language === 'zh' ? '响应结果' : 'Response'}
            </div>
            {result && (
              <div className={`flex items-center gap-1.5 text-sm px-2 py-0.5 rounded ${result.status >= 200 && result.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.status >= 200 && result.status < 300 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                Status: {result.status}
              </div>
            )}
          </div>

          <div className="p-4 overflow-y-auto flex-1 font-mono text-sm">
            {error ? (
              <div className="text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/20">
                <div className="font-bold mb-1">Error executing request:</div>
                {error}
              </div>
            ) : result ? (
              <div className="space-y-6">
                {result.extracted && (
                  <div>
                    <div className="text-indigo-400 mb-2 font-bold flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Extracted Data (Selector: {selector})
                    </div>
                    <div className="bg-[#2D2D2D] p-3 rounded text-green-400 whitespace-pre-wrap border border-gray-700">
                      {result.extracted}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-gray-400 mb-2 font-bold">Response Body:</div>
                  <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                    {typeof result.data === 'object' 
                      ? JSON.stringify(result.data, null, 2) 
                      : result.data}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <Bug className="w-12 h-12 mb-4 opacity-20" />
                <p>{language === 'zh' ? '点击左侧按钮发送请求' : 'Click Run Scraper to see results'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
