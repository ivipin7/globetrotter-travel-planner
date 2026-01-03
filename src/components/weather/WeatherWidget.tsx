import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Weather code to icon mapping (WMO codes)
const getWeatherIcon = (code: number, size = "h-8 w-8") => {
  // Clear
  if (code === 0) return <Sun className={`${size} text-yellow-500`} />;
  // Partly cloudy
  if (code >= 1 && code <= 3) return <Cloud className={`${size} text-gray-400`} />;
  // Fog
  if (code >= 45 && code <= 48) return <CloudFog className={`${size} text-gray-500`} />;
  // Drizzle
  if (code >= 51 && code <= 57) return <CloudRain className={`${size} text-blue-400`} />;
  // Rain
  if (code >= 61 && code <= 67) return <CloudRain className={`${size} text-blue-500`} />;
  // Snow
  if (code >= 71 && code <= 77) return <CloudSnow className={`${size} text-blue-200`} />;
  // Rain showers
  if (code >= 80 && code <= 82) return <CloudRain className={`${size} text-blue-600`} />;
  // Snow showers
  if (code >= 85 && code <= 86) return <CloudSnow className={`${size} text-blue-300`} />;
  // Thunderstorm
  if (code >= 95 && code <= 99) return <CloudLightning className={`${size} text-yellow-600`} />;
  // Default
  return <Cloud className={`${size} text-gray-400`} />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 56 && code <= 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing rain";
  if (code >= 71 && code <= 75) return "Snowfall";
  if (code === 77) return "Snow grains";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code >= 96 && code <= 99) return "Thunderstorm with hail";
  return "Unknown";
};

interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    feelsLike: number;
  };
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }[];
  location: string;
}

interface WeatherWidgetProps {
  destination?: string;
  startDate?: string;
  className?: string;
  compact?: boolean;
}

// Geocoding function to get coordinates from city name
async function getCoordinates(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: `${data.results[0].name}, ${data.results[0].country || ''}`.trim(),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Fetch weather data from Open-Meteo
async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
    );
    const data = await response.json();

    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        feelsLike: Math.round(data.current.apparent_temperature),
      },
      daily: data.daily.time.map((date: string, index: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[index]),
        tempMin: Math.round(data.daily.temperature_2m_min[index]),
        weatherCode: data.daily.weather_code[index],
      })),
      location: "",
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}

export function WeatherWidget({ destination, startDate, className = "", compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const fetchWeatherData = async () => {
    if (!destination) return;

    setLoading(true);
    setError(null);

    try {
      const coords = await getCoordinates(destination);
      
      if (!coords) {
        setError("Location not found");
        setLoading(false);
        return;
      }

      setLocationName(coords.name);
      const weatherData = await fetchWeather(coords.lat, coords.lon);
      
      if (weatherData) {
        weatherData.location = coords.name;
        setWeather(weatherData);
      } else {
        setError("Failed to fetch weather");
      }
    } catch (err) {
      setError("Weather unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [destination]);

  if (!destination) {
    return null;
  }

  if (loading) {
    return (
      <Card className={`card-3d ${className}`}>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`card-3d ${className}`}>
        <CardContent className="py-6 text-center">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchWeatherData} className="mt-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  // Compact version for sidebar/cards
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {getWeatherIcon(weather.current.weatherCode, "h-6 w-6")}
        <div>
          <p className="font-medium">{weather.current.temperature}°C</p>
          <p className="text-xs text-muted-foreground">
            {getWeatherDescription(weather.current.weatherCode)}
          </p>
        </div>
      </div>
    );
  }

  // Full widget
  return (
    <Card className={`card-3d overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Weather
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchWeatherData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{locationName}</p>
      </CardHeader>
      
      <CardContent>
        {/* Current Weather */}
        <div className="flex items-center gap-4 mb-6">
          {getWeatherIcon(weather.current.weatherCode)}
          <div>
            <p className="text-4xl font-bold">{weather.current.temperature}°C</p>
            <p className="text-muted-foreground">
              {getWeatherDescription(weather.current.weatherCode)}
            </p>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Thermometer className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <p className="text-xs text-muted-foreground">Feels like</p>
            <p className="font-medium">{weather.current.feelsLike}°C</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Wind className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="font-medium">{weather.current.windSpeed} km/h</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Droplets className="h-4 w-4 mx-auto mb-1 text-cyan-500" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-medium">{weather.current.humidity}%</p>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <p className="text-sm font-medium mb-3">7-Day Forecast</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weather.daily.map((day, index) => {
              const date = new Date(day.date);
              const dayName = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
              
              return (
                <div
                  key={day.date}
                  className="flex-shrink-0 text-center p-2 rounded-lg bg-muted/30 min-w-[60px]"
                >
                  <p className="text-xs text-muted-foreground mb-1">{dayName}</p>
                  {getWeatherIcon(day.weatherCode, "h-5 w-5 mx-auto")}
                  <p className="text-xs font-medium mt-1">
                    {day.tempMax}°
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {day.tempMin}°
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
