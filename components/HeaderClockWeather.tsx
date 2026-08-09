'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Umbrella } from 'lucide-react';
import { fetchLiveWeather, WeatherData } from '@/lib/weather';

export default function HeaderClockWeather() {
  const [timeStr, setTimeStr] = useState<string>('--:--');
  const [dateStr, setDateStr] = useState<string>('Loading...');
  const [weather, setWeather] = useState<WeatherData>({
    temp: 22,
    condition: 'cloudy',
    rainChance: 0,
    city: 'London',
    isLive: false,
  });

  // 1. Clock Update Loop
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      };
      setDateStr(now.toLocaleDateString('en-US', options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Weather Polling Loop (every 15 mins)
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather();
      if (isMounted) setWeather(data);
    };

    loadWeather();
    const weatherInterval = setInterval(loadWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherInterval);
    };
  }, []);

  const renderWeatherIcon = () => {
    const iconClass = "w-5 h-5 md:w-6 md:h-6 text-stone-600";
    switch (weather.condition) {
      case 'sunny':
        return <Sun className={iconClass} />;
      case 'partly-cloudy':
        return <CloudSun className={iconClass} />;
      case 'cloudy':
        return <Cloud className={iconClass} />;
      case 'rainy':
        return <CloudRain className={iconClass} />;
      case 'stormy':
        return <CloudLightning className={iconClass} />;
      case 'snowy':
        return <Snowflake className={iconClass} />;
      default:
        return <CloudSun className={iconClass} />;
    }
  };

  return (
    <div className="flex justify-between items-start mb-8 shrink-0">
      {/* Time & Date */}
      <div>
        <div className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-1 font-sans">
          {timeStr}
        </div>
        <div className="text-xs md:text-sm font-medium text-stone-500">
          {dateStr}
        </div>
      </div>

      {/* Weather Info */}
      <div className="text-right flex flex-col items-end">
        <div className="flex items-center gap-2 md:gap-3 mb-1">
          <span className="text-xl md:text-2xl font-light text-stone-800">
            {weather.temp}°
          </span>
          {renderWeatherIcon()}
        </div>
        <div className="text-[10px] md:text-xs text-stone-500 flex items-center gap-1 justify-end mt-0.5">
          <Umbrella className="w-3 h-3 text-stone-400" />
          {weather.rainChance}% rain
        </div>
      </div>
    </div>
  );
}
