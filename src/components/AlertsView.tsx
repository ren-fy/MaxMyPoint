import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  language: Language;
}

interface Alert {
  id: string;
  hotelName: string;
  chain: string;
  startDate: string;
  endDate: string;
  maxPoints: number;
  maxCash: number;
  active: boolean;
}

export default function AlertsView({ language }: Props) {
  const t = translations[language];
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const toggleAlert = async (id: string) => {
    const alertToToggle = alerts.find(a => a.id === id);
    if (!alertToToggle) return;

    const newActiveState = !alertToToggle.active;
    
    // Optimistic update
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: newActiveState } : a));

    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActiveState })
      });
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      // Revert on failure
      setAlerts(alerts.map(a => a.id === id ? { ...a, active: !newActiveState } : a));
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '我的提醒' : 'My Alerts'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'zh' 
                ? '当有符合条件的积分房或现金房时，我们会第一时间通知您' 
                : 'Get notified when award or cash availability matches your criteria'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">{language === 'zh' ? '加载中...' : 'Loading alerts...'}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {language === 'zh' ? '暂无提醒' : 'No alerts found'}
            </p>
            <p className="text-sm">
              {language === 'zh' ? '请在酒店详情页点击"提醒"按钮创建新的提醒任务。' : 'Go to a hotel detail page and click "Alert" to create a new alert.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {alert.chain}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.hotelName}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {alert.startDate} to {alert.endDate}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Max {alert.maxPoints === 999999 ? 'Any' : alert.maxPoints.toLocaleString()} pts / ${alert.maxCash === 999999 ? 'Any' : alert.maxCash}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={alert.active}
                        onChange={() => toggleAlert(alert.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 w-10">
                        {alert.active ? (language === 'zh' ? '开启' : 'Active') : (language === 'zh' ? '关闭' : 'Paused')}
                      </span>
                    </label>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
