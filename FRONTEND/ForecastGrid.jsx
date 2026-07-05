const weatherDescriptions = {
    0: "☀️ Clear Sky",
    1: "🌤 Mainly Clear",
    2: "⛅ Partly Cloudy",
    3: "☁️ Overcast",
    45: "🌫 Fog",
    48: "🌫 Rime Fog",
    51: "🌦 Light Drizzle",
    53: "🌦 Moderate Drizzle",
    55: "🌧 Heavy Drizzle",
    61: "🌧 Slight Rain",
    63: "🌧 Moderate Rain",
    65: "🌧 Heavy Rain",
    71: "❄️ Snow",
    80: "🌦 Rain Showers",
    95: "⛈ Thunderstorm",
    96: "⛈ Thunderstorm with Hail",
    99: "⛈ Severe Thunderstorm",
};

export default function ForecastGrid({ weather }) {

    if (!weather) return null;

    const forecast = weather.daily_forecast;

    // -------------------------------
    // CUSTOM DATE RANGE
    // -------------------------------
    if (Array.isArray(forecast)) {

        return (

            <div className="mt-10 text-center">

                <h2 className="text-3xl font-bold mb-6">

                    📅 Weather Forecast

                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

                    {forecast.map((dayData, index) => {

                        const day = new Date(dayData.date).toLocaleDateString(
                            "en-US",
                            { weekday: "long" }
                        );

                        return (

                            <div
                                key={index}
                                className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 border"
                            >

                                <h3 className="text-2xl font-bold mb-2">
                                    {day}
                                </h3>

                                <div className="text-5xl mb-4">
                                    🌤
                                </div>

                                <p className="text-gray-600 font-medium mb-4">
                                    {dayData.date}
                                </p>

                                <p className="text-lg font-semibold mb-5">
                                    Custom Date Forecast
                                </p>

                                <div className="space-y-4">

                                    <p>🌡 Max</p>

                                    <p className="text-3xl font-bold text-red-500">
                                        {dayData.temp_max}°C
                                    </p>

                                    <p>❄ Min</p>

                                    <p className="text-3xl font-bold text-blue-500">
                                        {dayData.temp_min}°C
                                    </p>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        );

    }

    // -------------------------------
    // DEFAULT 5-DAY FORECAST
    // -------------------------------

    return (

        <div className="mt-10 text-center">

            <h2 className="text-3xl font-bold mb-6">

                📅 5-Day Forecast

            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

                {forecast.time.map((date, index) => {

                    const day = new Date(date).toLocaleDateString(
                        "en-US",
                        { weekday: "long" }
                    );

                    const code = forecast.weather_code[index];

                    return (

                        <div
                            key={index}
                            className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 border"
                        >

                            <h3 className="text-2xl font-bold mb-2">

                                {day}

                            </h3>

                            <div className="text-5xl mb-4">

                                {code >= 95
                                    ? "⛈"
                                    : code >= 80
                                        ? "🌧"
                                        : code >= 61
                                            ? "🌦"
                                            : code >= 3
                                                ? "☁️"
                                                : "☀️"}

                            </div>

                            <p className="text-gray-600 font-medium mb-4">

                                {date}

                            </p>

                            <p className="text-xl font-semibold mb-5">

                                {weatherDescriptions[code]}

                            </p>

                            <div className="space-y-4">

                                <p>🌡 Max</p>

                                <p className="text-3xl font-bold text-red-500">

                                    {forecast.temperature_2m_max[index]}°C

                                </p>

                                <p>❄ Min</p>

                                <p className="text-3xl font-bold text-blue-500">

                                    {forecast.temperature_2m_min[index]}°C

                                </p>

                                <p>☀ UV Index</p>

                                <p className="text-2xl font-bold text-yellow-500">

                                    {forecast.uv_index_max
                                        ? forecast.uv_index_max[index]
                                        : "-"}

                                </p>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}