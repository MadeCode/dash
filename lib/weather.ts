export interface HourlyForecast {
  time: string; // HH:00
  temp: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  rainChance: number;
}

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  rainChance: number;
  city: string;
  isLive: boolean;
  hourly: HourlyForecast[];
}

// Maps WMO Weather Interpretation Codes (Open-Meteo) to condition types
export function mapWmoCodeToCondition(code: number): WeatherData['condition'] {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'partly-cloudy';
}

// Default location: Brussels, Belgium (lat: 50.8503, lon: 4.3517)
export async function fetchLiveWeather(
  lat: number = 50.8503,
  lon: number = 4.3517,
  cityName: string = 'Brussels'
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 900 } });

    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

    const data = await res.json();
    const currentTemp = Math.round(data.current?.temperature_2m ?? 20);
    const weatherCode = data.current?.weather_code ?? 2;
    const condition = mapWmoCodeToCondition(weatherCode);

    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyCodes: number[] = data.hourly?.weather_code || [];
    const rainProbs: number[] = data.hourly?.precipitation_probability || [];
    const timeStrings: string[] = data.hourly?.time || [];

    const currentHour = new Date().getHours();
    const rainChance = rainProbs[currentHour] ?? rainProbs[0] ?? 0;

    const hourly: HourlyForecast[] = timeStrings.map((t, idx) => {
      const dateObj = new Date(t);
      const hourStr = `${String(dateObj.getHours()).padStart(2, '0')}:00`;
      return {
        time: hourStr,
        temp: Math.round(hourlyTemps[idx] ?? currentTemp),
        condition: mapWmoCodeToCondition(hourlyCodes[idx] ?? weatherCode),
        rainChance: rainProbs[idx] ?? 0,
      };
    });

    return {
      temp: currentTemp,
      condition,
      rainChance,
      city: cityName,
      isLive: true,
      hourly,
    };
  } catch (error) {
    console.warn('Falling back to default Brussels weather data:', error);
    
    // Fallback hourly forecast for Brussels
    const mockHourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      temp: 18 + Math.round(Math.sin(i / 3) * 4),
      condition: i > 8 && i < 19 ? 'partly-cloudy' : 'cloudy',
      rainChance: i > 14 && i < 18 ? 20 : 0,
    }));

    return {
      temp: 20,
      condition: 'partly-cloudy',
      rainChance: 10,
      city: 'Brussels',
      isLive: false,
      hourly: mockHourly,
    };
  }
}
