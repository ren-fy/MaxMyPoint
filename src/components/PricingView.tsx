import React from 'react';
import { Check, Zap, Star, Shield } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  language: Language;
}

export default function PricingView({ language }: Props) {
  const t = translations[language];

  const plans = [
    {
      name: language === 'zh' ? '基础版' : 'Basic',
      price: language === 'zh' ? '免费' : 'Free',
      description: language === 'zh' ? '适合偶尔出行的旅客' : 'Perfect for occasional travelers',
      features: [
        language === 'zh' ? '基础酒店搜索' : 'Basic hotel search',
        language === 'zh' ? '收益计算器' : 'Earnings calculator',
        language === 'zh' ? '最多 1 个提醒' : 'Up to 1 active alert',
        language === 'zh' ? '每日更新 1 次' : 'Daily updates',
      ],
      buttonText: language === 'zh' ? '当前计划' : 'Current Plan',
      isPopular: false,
    },
    {
      name: language === 'zh' ? '专业版' : 'Pro',
      price: language === 'zh' ? '¥29/月' : '$4.99/mo',
      description: language === 'zh' ? '适合常旅客与积分玩家' : 'For frequent travelers and point maximizers',
      features: [
        language === 'zh' ? '高级筛选与排序' : 'Advanced filters & sorting',
        language === 'zh' ? '最多 10 个提醒' : 'Up to 10 active alerts',
        language === 'zh' ? '每小时更新 1 次' : 'Hourly updates',
        language === 'zh' ? '邮件与微信通知' : 'Email & WeChat notifications',
        language === 'zh' ? '历史价格趋势图' : 'Historical price trends',
      ],
      buttonText: language === 'zh' ? '升级专业版' : 'Upgrade to Pro',
      isPopular: true,
    },
    {
      name: language === 'zh' ? '尊享版' : 'Max',
      price: language === 'zh' ? '¥99/月' : '$14.99/mo',
      description: language === 'zh' ? '适合专业代订与极致玩家' : 'For travel agents and hardcore maximizers',
      features: [
        language === 'zh' ? '无限制酒店搜索' : 'Unlimited hotel searches',
        language === 'zh' ? '无限制提醒数量' : 'Unlimited active alerts',
        language === 'zh' ? '实时更新 (每5分钟)' : 'Real-time updates (5 mins)',
        language === 'zh' ? '短信与电话通知' : 'SMS & Phone notifications',
        language === 'zh' ? '专属客服支持' : 'Priority support',
        language === 'zh' ? 'API 接口访问' : 'API access',
      ],
      buttonText: language === 'zh' ? '升级尊享版' : 'Upgrade to Max',
      isPopular: false,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          {language === 'zh' ? '选择适合您的计划' : 'Choose the right plan for you'}
        </h1>
        <p className="text-xl text-gray-500">
          {language === 'zh' 
            ? '无论您是偶尔出行还是专业玩家，我们都有适合您的订阅方案，助您最大化积分价值。' 
            : 'Whether you travel occasionally or professionally, we have a plan to help you maximize your points.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`relative flex flex-col p-8 bg-white rounded-2xl border ${
              plan.isPopular ? 'border-blue-600 shadow-xl scale-105 z-10' : 'border-gray-200 shadow-sm'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  {language === 'zh' ? '最受欢迎' : 'Most Popular'}
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 mt-2 h-12">{plan.description}</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mr-3" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                plan.isPopular 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto border-t border-gray-200 pt-16">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {language === 'zh' ? '实时监控' : 'Real-time Monitoring'}
          </h4>
          <p className="text-gray-500 text-sm">
            {language === 'zh' ? '24/7 不间断扫描各大酒店集团官网，确保您不会错过任何积分房。' : '24/7 continuous scanning of major hotel chains to ensure you never miss an award night.'}
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {language === 'zh' ? '价值最大化' : 'Value Maximization'}
          </h4>
          <p className="text-gray-500 text-sm">
            {language === 'zh' ? '智能算法计算每万分价值与回血比例，帮您做出最明智的预订决策。' : 'Smart algorithms calculate cpp and return rates to help you make the best booking decisions.'}
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {language === 'zh' ? '安全可靠' : 'Secure & Reliable'}
          </h4>
          <p className="text-gray-500 text-sm">
            {language === 'zh' ? '我们绝不收集您的酒店账号密码，所有搜索均通过公开接口完成。' : 'We never collect your hotel account passwords. All searches are done via public APIs.'}
          </p>
        </div>
      </div>
    </div>
  );
}
