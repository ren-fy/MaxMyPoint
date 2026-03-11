import React, { useState } from 'react';
import { X, Wand2, Loader2, Key } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  hotelName: string;
  onClose: () => void;
  onImageGenerated: (imageUrl: string) => void;
}

// Declare window.aistudio for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function ImageGeneratorModal({ hotelName, onClose, onImageGenerated }: Props) {
  const [prompt, setPrompt] = useState(`A luxurious and modern hotel exterior for ${hotelName}, architectural photography, highly detailed, 4k resolution`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // Check for user-selected API key for paid models
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assume key selection was successful to mitigate race condition
        }
      }

      // Use process.env.API_KEY which is injected by the platform after selection
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('未配置 API Key');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          }
        },
      });
      
      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
      
      if (imageUrl) {
        onImageGenerated(imageUrl);
      } else {
        throw new Error('未能生成图片');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      // If error is related to missing entity/key, prompt again
      if (err.message?.includes('Requested entity was not found')) {
        setError('API Key 无效或未找到，请重新选择');
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || '生成图片时发生错误');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Wand2 className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI 生成酒店封面</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            使用 Gemini 3.1 Flash Image Preview 为 {hotelName} 生成一张全新的封面图片。此功能需要使用您自己的 Google Cloud API Key。
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 rounded-xl border-slate-200 bg-slate-50 p-4 text-sm focus:border-amber-500 focus:ring-amber-500 outline-none transition-all resize-none mb-4"
            placeholder="描述你想要的酒店外观..."
          />
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                开始生成
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
