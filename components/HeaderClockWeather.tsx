'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Umbrella, X, Clock } from 'lucide-react';
import { fetchLiveWeather, WeatherData, HourlyForecast } from '@/lib/weather';

const BRUSSELS_TIME_ZONE = 'Europe/Brussels';
const GHENT_COORDINATES = { lat: 51.0543, lon: 3.7174, city: 'Ghent' };

function getBrusselsTimeParts(date: Date): { hours: string; minutes: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: BRUSSELS_TIME_ZONE,
  }).formatToParts(date);

  const hours = parts.find((part) => part.type === 'hour')?.value ?? '0';
  const minutes = parts.find((part) => part.type === 'minute')?.value ?? '0';

  return {
    hours: hours.padStart(2, '0'),
    minutes: minutes.padStart(2, '0'),
  };
}

function formatBrusselsTime(date: Date): string {
  const { hours, minutes } = getBrusselsTimeParts(date);

  return `${hours}:${minutes}`;
}

function getBrusselsHour(): number {
  return Number(getBrusselsTimeParts(new Date()).hours);
}

export default function HeaderClockWeather() {
  const [timeStr, setTimeStr] = useState<string>('--:--');
  const [dateStr, setDateStr] = useState<string>('Loading...');
  const [weather, setWeather] = useState<WeatherData>({
    temp: 20,
    condition: 'partly-cloudy',
    rainChance: 0,
    city: GHENT_COORDINATES.city,
    isLive: false,
    hourly: [],
  });
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const currentHourRef = useRef<HTMLDivElement | null>(null);

  // 1. Clock Update Loop
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(formatBrusselsTime(now));

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      };
      setDateStr(now.toLocaleDateString('en-US', { ...options, timeZone: BRUSSELS_TIME_ZONE }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Weather Polling Loop (every 15 mins) for Ghent
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather(GHENT_COORDINATES.lat, GHENT_COORDINATES.lon, GHENT_COORDINATES.city);
      if (isMounted) setWeather(data);
    };

    loadWeather();
    const weatherInterval = setInterval(loadWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherInterval);
    };
  }, []);

  useEffect(() => {
    if (!showHourlyModal || !currentHourRef.current) return;

    const timer = setTimeout(() => {
      currentHourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    return () => clearTimeout(timer);
  }, [showHourlyModal, weather.hourly]);

  const renderWeatherIcon = (condition: WeatherData['condition'], className = "w-5 h-5 md:w-6 md:h-6 text-stone-600") => {
    switch (condition) {
      case 'sunny':
        return <Sun className={className} />;
      case 'partly-cloudy':
        return <CloudSun className={className} />;
      case 'cloudy':
        return <Cloud className={className} />;
      case 'rainy':
        return <CloudRain className={className} />;
      case 'stormy':
        return <CloudLightning className={className} />;
      case 'snowy':
        return <Snowflake className={className} />;
      default:
        return <CloudSun className={className} />;
    }
  };

  return (
    <>
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

        {/* Clickable Weather Info for Ghent */}
        <div
          onClick={() => setShowHourlyModal(true)}
          className="text-right flex flex-col items-end cursor-pointer group p-2 -mr-2 rounded-2xl hover:bg-stone-200/50 transition-all select-none"
          title="Click to view full hourly forecast for Ghent"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-0.5">
            <span className="text-xl md:text-2xl font-light text-stone-800">
              {weather.temp}°
            </span>
            {renderWeatherIcon(weather.condition)}
          </div>
          <div className="text-[10px] md:text-xs text-stone-500 flex items-center gap-1 justify-end">
            <Umbrella className="w-3 h-3 text-stone-400" />
            {weather.rainChance}% rain
          </div>
          <div className="text-[9px] text-stone-400 group-hover:text-stone-700 transition-colors mt-0.5">
            {weather.city} • Hourly forecast
          </div>
        </div>
      </div>

      {/* Hourly Forecast Modal */}
      {showHourlyModal && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowHourlyModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 bg-stone-900 text-stone-50 rounded-xl">
                {renderWeatherIcon(weather.condition, "w-5 h-5 text-stone-50")}
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  {weather.city} Hourly Forecast
                </h3>
                <p className="text-xs text-stone-500">
                  Current: {weather.temp}°C • {weather.condition.replace('-', ' ')}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2 thin-scrollbar">
              {weather.hourly.length === 0 ? (
                <div className="text-stone-400 text-xs py-8 text-center">Loading forecast data...</div>
              ) : (
                weather.hourly.map((item: HourlyForecast, idx: number) => {
                  const currentHour = getBrusselsHour();
                  const itemHour = Number(item.time.split(':')[0]);
                  const currentHourStr = `${String(currentHour).padStart(2, '0')}:00`;
                  const isCurrentHour = item.time === currentHourStr;
                  const isPastHour = itemHour < currentHour;

                  return (
                    <div
                      key={idx}
                      ref={isCurrentHour ? currentHourRef : undefined}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isCurrentHour
                          ? 'bg-emerald-50/60 border-emerald-200 text-stone-900 font-semibold'
                          : isPastHour
                            ? 'bg-white/40 border-stone-200/50 text-stone-400 opacity-60'
                            : 'bg-white/70 border-stone-200/70 text-stone-700 hover:bg-stone-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-24">
                        <Clock className={`w-3.5 h-3.5 ${isCurrentHour ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span className="text-xs">{item.time}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-center">
                        {renderWeatherIcon(item.condition, "w-4 h-4 text-stone-600")}
                        <span className="text-xs capitalize">{item.condition.replace('-', ' ')}</span>
                      </div>

                      <div className="flex items-center gap-4 text-right w-24 justify-end">
                        <span className="text-xs font-medium">{item.temp}°C</span>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 w-10 justify-end">
                          <Umbrella className="w-3 h-3 text-stone-400" />
                          <span>{item.rainChance}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
