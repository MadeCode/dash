'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Umbrella, X } from 'lucide-react';
import { fetchLiveWeather, WeatherData, HourlyForecast } from '@/lib/weather';

const BRUSSELS_TIME_ZONE = 'Europe/Brussels';
const GHENT_COORDINATES = { lat: 51.0543, lon: 3.7174, city: 'Ghent' };
const CHART_WIDTH = 920;
const CHART_HEIGHT = 260;
const CHART_PADDING = { top: 34, right: 50, bottom: 46, left: 46 };

function getBrusselsTimeParts(date: Date): { hours: string; minutes: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: BRUSSELS_TIME_ZONE,
  }).formatToParts(date);

  const hours = parts.find((part) => part.type === 'hour')?.value ?? '0';
  const minutes = parts.find((part) => part.type === 'minute')?.value ?? '0';

  return { hours: hours.padStart(2, '0'), minutes: minutes.padStart(2, '0') };
}

function formatBrusselsTime(date: Date): string {
  const { hours, minutes } = getBrusselsTimeParts(date);
  return `${hours}:${minutes}`;
}

function getBrusselsHour(): number {
  return Number(getBrusselsTimeParts(new Date()).hours);
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function HourlyWeatherChart({ hourly }: { hourly: HourlyForecast[] }) {
  const currentHourRef = useRef<HTMLDivElement | null>(null);
  const chartData = useMemo(() => hourly.slice(0, 24), [hourly]);
  const currentHour = getBrusselsHour();

  useEffect(() => {
    const timer = setTimeout(() => {
      currentHourRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 100);

    return () => clearTimeout(timer);
  }, [chartData]);

  if (chartData.length === 0) {
    return <div className="text-stone-400 text-xs py-12 text-center">Loading forecast data...</div>;
  }

  const minTemp = Math.min(...chartData.map((item) => item.temp));
  const maxTemp = Math.max(...chartData.map((item) => item.temp));
  const tempMin = minTemp - 2;
  const tempMax = maxTemp + 2;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const tempRange = Math.max(tempMax - tempMin, 1);
  const xStep = plotWidth / Math.max(chartData.length - 1, 1);

  const toX = (index: number) => CHART_PADDING.left + index * xStep;
  const toTempY = (temp: number) => CHART_PADDING.top + ((tempMax - temp) / tempRange) * plotHeight;
  const toRainY = (rainChance: number) => CHART_PADDING.top + ((100 - rainChance) / 100) * plotHeight;
  const tempPoints = chartData.map((item, index) => ({ x: toX(index), y: toTempY(item.temp) }));
  const rainPoints = chartData.map((item, index) => ({ x: toX(index), y: toRainY(item.rainChance) }));

  return (
    <div className="mt-4 overflow-x-auto thin-scrollbar pb-2">
      <div className="relative min-w-[920px]" style={{ width: CHART_WIDTH }}>
        <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="block rounded-2xl bg-white/70 border border-stone-200/70">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = CHART_PADDING.top + fraction * plotHeight;
            const tempLabel = Math.round(tempMax - fraction * tempRange);
            const rainLabel = Math.round(100 - fraction * 100);
            return (
              <g key={fraction}>
                <line x1={CHART_PADDING.left} x2={CHART_WIDTH - CHART_PADDING.right} y1={y} y2={y} stroke="#e7e5e4" strokeDasharray="4 6" />
                <text x={CHART_PADDING.left - 10} y={y + 4} textAnchor="end" className="fill-stone-500 text-[10px]">{tempLabel}°</text>
                <text x={CHART_WIDTH - CHART_PADDING.right + 10} y={y + 4} className="fill-blue-500 text-[10px]">{rainLabel}%</text>
              </g>
            );
          })}

          <path d={buildSmoothPath(rainPoints)} fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.82" />
          <path d={buildSmoothPath(tempPoints)} fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />

          {chartData.map((item, index) => {
            const x = toX(index);
            const isCurrentHour = item.time === `${String(currentHour).padStart(2, '0')}:00`;
            return (
              <g key={item.time}>
                {isCurrentHour && <line x1={x} x2={x} y1={CHART_PADDING.top - 8} y2={CHART_HEIGHT - CHART_PADDING.bottom + 8} stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />}
                <circle cx={x} cy={toRainY(item.rainChance)} r="4" fill="#60a5fa" stroke="white" strokeWidth="2" />
                <circle cx={x} cy={toTempY(item.temp)} r="5" fill="#f97316" stroke="white" strokeWidth="2" />
                <text x={x} y={toTempY(item.temp) - 10} textAnchor="middle" className="fill-stone-900 text-[10px] font-semibold">{item.temp}°</text>
                <text x={x} y={CHART_HEIGHT - CHART_PADDING.bottom + 22} textAnchor="middle" className={`text-[10px] ${isCurrentHour ? 'fill-emerald-600 font-semibold' : 'fill-stone-500'}`}>{item.time}</text>
              </g>
            );
          })}
        </svg>

        {chartData.map((item) => {
          const isCurrentHour = item.time === `${String(currentHour).padStart(2, '0')}:00`;
          return isCurrentHour ? <div key="current-anchor" ref={currentHourRef} className="absolute top-0 h-1 w-1" style={{ left: toX(chartData.indexOf(item)) }} /> : null;
        })}
      </div>
    </div>
  );
}

export default function HeaderClockWeather() {
  const [timeStr, setTimeStr] = useState<string>('--:--');
  const [dateStr, setDateStr] = useState<string>('Loading...');
  const [weather, setWeather] = useState<WeatherData>({ temp: 20, condition: 'partly-cloudy', rainChance: 0, city: GHENT_COORDINATES.city, isLive: false, hourly: [] });
  const [showHourlyModal, setShowHourlyModal] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(formatBrusselsTime(now));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: BRUSSELS_TIME_ZONE }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather(GHENT_COORDINATES.lat, GHENT_COORDINATES.lon, GHENT_COORDINATES.city);
      if (isMounted) setWeather(data);
    };

    loadWeather();
    const weatherInterval = setInterval(loadWeather, 15 * 60 * 1000);
    return () => { isMounted = false; clearInterval(weatherInterval); };
  }, []);

  const renderWeatherIcon = (condition: WeatherData['condition'], className = 'w-5 h-5 md:w-6 md:h-6 text-stone-600') => {
    switch (condition) {
      case 'sunny': return <Sun className={className} />;
      case 'partly-cloudy': return <CloudSun className={className} />;
      case 'cloudy': return <Cloud className={className} />;
      case 'rainy': return <CloudRain className={className} />;
      case 'stormy': return <CloudLightning className={className} />;
      case 'snowy': return <Snowflake className={className} />;
      default: return <CloudSun className={className} />;
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-8 shrink-0">
        <div>
          <div className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-1 font-sans">{timeStr}</div>
          <div className="text-xs md:text-sm font-medium text-stone-500">{dateStr}</div>
        </div>

        <div onClick={() => setShowHourlyModal(true)} className="text-right flex flex-col items-end cursor-pointer group p-2 -mr-2 rounded-2xl hover:bg-stone-200/50 transition-all select-none" title="Click to view full hourly forecast for Ghent">
          <div className="flex items-center gap-2 md:gap-3 mb-0.5"><span className="text-xl md:text-2xl font-light text-stone-800">{weather.temp}°</span>{renderWeatherIcon(weather.condition)}</div>
          <div className="text-[10px] md:text-xs text-stone-500 flex items-center gap-1 justify-end"><Umbrella className="w-3 h-3 text-stone-400" />{weather.rainChance}% rain</div>
          <div className="text-[9px] text-stone-400 group-hover:text-stone-700 transition-colors mt-0.5">{weather.city} • Hourly graph</div>
        </div>
      </div>

      {showHourlyModal && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="bg-stone-50 border border-stone-200 rounded-3xl shadow-2xl w-full max-w-4xl p-5 md:p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button onClick={() => setShowHourlyModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-200/50 transition-colors" aria-label="Close hourly forecast"><X className="w-5 h-5" /></button>

            <div className="flex items-center gap-2.5 mb-1 pr-10">
              <div className="p-2 bg-stone-900 text-stone-50 rounded-xl">{renderWeatherIcon(weather.condition, 'w-5 h-5 text-stone-50')}</div>
              <div>
                <h3 className="text-base font-semibold text-stone-900">{weather.city} Hourly Forecast</h3>
                <p className="text-xs text-stone-500">Current: {weather.temp}°C • {weather.condition.replace('-', ' ')} • orange temp / blue rain chance</p>
              </div>
            </div>

            <HourlyWeatherChart hourly={weather.hourly} />
          </div>
        </div>
      )}
    </>
  );
}
