export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  rainChance: number;
  city: string;
  isLive: boolean;
}

// Maps WMO Weather Interpretation Codes (Open-Meteo) to condition types
function mapWmoCodeToCondition(code: number): WeatherData['condition'] {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'partly-cloudy';
}

export async function fetchLiveWeather(lat: number = 51.5074, lon: number = -0.1278, cityName: string = 'London'): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,rain&hourly=precipitation_probability&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // Cache 15 minutes
    
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    
    const data = await res.json();
    const currentTemp = Math.round(data.current?.temperature_2m ?? 22);
    const weatherCode = data.current?.weather_code ?? 2;
    const condition = mapWmoCodeToCondition(weatherCode);
    
    // Average rain probability for current hours
    const rainProbs = data.hourly?.precipitation_probability || [0];
    const currentHour = new Date().getHours();
    const rainChance = rainProbs[currentHour] ?? rainProbs[0] ?? 0;

    return {
      temp: currentTemp,
      condition,
      rainChance,
      city: cityName,
      isLive: true,
    };
  } catch (error) {
    console.warn('Falling back to default weather data:', error);
    return {
      temp: 22,
      condition: 'partly-cloudy',
      rainChance: 0,
      city: cityName,
      isLive: false,
    };
  }
}
