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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


                    {forecast.map((dayData, index) => {

                        const day = new Date(dayData.date).toLocaleDateString(
                            "en-US",
                            { weekday: "long" }
                        );

                        return (

                            <div
                                key={index}
                                className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-6 min-h-[700px] hover:scale-105 hover:shadow-2xl transition-all duration-300 border flex flex-col"
                            >

                                <h3 className="text-2xl font-bold mb-2">
                                    {day}
                                </h3>

                                <div className="text-6xl mb-5">
                                    {dayData.weather_code >= 95
                                        ? "⛈"
                                        : dayData.weather_code >= 80
                                            ? "🌧"
                                            : dayData.weather_code >= 61
                                                ? "🌦"
                                                : dayData.weather_code >= 3
                                                    ? "☁️"
                                                    : "☀️"}
                                </div>

                                <p className="text-gray-600 font-medium mb-4">
                                    {dayData.date}
                                </p>

                                <p className="text-xl font-bold text-blue-800 mb-5">
                                    {dayData.weather_description}
                                </p>

                                <div className="space-y-3 text-center flex-1">

                                    <p>
                                        🌡 <strong>Max:</strong> {dayData.temp_max}°C
                                    </p>

                                    <p>
                                        ❄ <strong>Min:</strong> {dayData.temp_min}°C
                                    </p>

                                    <p>
                                        💧 <strong>Humidity:</strong> {dayData.humidity ?? "-"}%
                                    </p>

                                    <p>
                                        🌬 <strong>Wind:</strong> {dayData.wind_speed ?? "-"} km/h
                                    </p>

                                    <p>
                                        🌧 <strong>Rain:</strong> {dayData.rain ?? "-"} mm
                                    </p>

                                    <p>
                                        ☔ <strong>Rain Chance:</strong> {dayData.rain_probability ?? "-"}%
                                    </p>

                                    <p>
                                        ☀ <strong>UV Index:</strong> {dayData.uv_index ?? "-"}
                                    </p>

                                    <p className="text-sm text-yellow-700">
                                        {dayData.uv_advice}
                                    </p>

                                    <p>
                                        🌅 <strong>Sunrise:</strong> {dayData.sunrise ?? "-"}
                                    </p>

                                    <p>
                                        🌇 <strong>Sunset:</strong> {dayData.sunset ?? "-"}
                                    </p>

                                    <div className="mt-3">
                                        <strong>📝 Weather Advice</strong>

                                        <ul className="list-disc list-inside text-sm mt-1">
                                            {dayData.weather_advice?.map((tip, i) => (
                                                <li key={i}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


                {forecast.time.map((date, index) => {

                    const day = new Date(date).toLocaleDateString(
                        "en-US",
                        { weekday: "long" }
                    );

                    const code = forecast.weather_code[index];

                    return (

                        <div
                            key={index}
                            className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-6 min-h-[700px] hover:scale-105 hover:shadow-2xl transition-all duration-300 border flex flex-col"
                        >

                            <h3 className="text-2xl font-bold mb-2">

                                {day}


                            </h3>

                            <div className="text-6xl mb-5">

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

                            <p className="text-xl font-bold text-blue-800 mb-5">

                                {weatherDescriptions[code]}

                            </p>

                            <div className="space-y-3 text-center flex-1">

                                <p>
                                    🌡 <strong>Max:</strong> {forecast.temperature_2m_max[index]}°C
                                </p>

                                <p>
                                    ❄ <strong>Min:</strong> {forecast.temperature_2m_min[index]}°C
                                </p>

                                <p>
                                    💧 <strong>Humidity:</strong> {forecast.relative_humidity_2m_mean[index]}%
                                </p>

                                <p>
                                    💨 <strong>Wind:</strong> {forecast.wind_speed_10m_max[index]} km/h
                                </p>

                                <p>🌧 Rain</p>

                                <p className="font-semibold">
                                    {forecast.precipitation_sum[index]} mm
                                </p>

                                <p>
                                    🌧 <strong>Rain:</strong> {forecast.precipitation_sum[index]} mm
                                </p>

                                <p>
                                    ☔ <strong>Rain Chance:</strong> {forecast.precipitation_probability_max[index]}%
                                </p>

                                <p>
                                    🌅 <strong>Sunrise:</strong> {forecast.sunrise[index].split("T")[1]}
                                </p>

                                <p>
                                    🌇 <strong>Sunset:</strong> {forecast.sunset[index].split("T")[1]}
                                </p>

                                <p>
                                    ☀ <strong>UV Index:</strong> {forecast.uv_index_max[index]}
                                </p>

                                <p className="text-sm text-orange-700">
                                    {forecast.uv_advice[index]}
                                </p>

                                <div className="mt-3">
                                    <strong>📝 Weather Advice</strong>

                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {forecast.weather_advice[index].map((tip, i) => (
                                            <li key={i}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>


                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}
