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
  99: "⛈ Severe Thunderstorm"
};

export default function CurrentWeather({ weather }) {

  if (!weather) return null;

  const isCustomRange = weather.current === null;

  return (

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

        <h2 className="text-3xl font-bold mb-6">

          📍 {weather.location.name}

        </h2>

        {isCustomRange ? (

            <div className="text-center">

              <h3 className="text-2xl font-semibold mb-4">

                📅 Custom Date Range Selected

              </h3>

              <p className="text-lg">

                Weather data for

                <strong> {weather.start_date}</strong>

                {" "}to{" "}

                <strong>{weather.end_date}</strong>

              </p>

              <p className="mt-4 text-gray-600">

                Current weather isn't available for historical or custom
                date searches.

              </p>

            </div>

        ) : (

            <>
              <div className="grid grid-cols-2 gap-6">

                <div className="bg-blue-100 rounded-xl p-4">
                  <h3 className="text-gray-500">Temperature</h3>
                  <p className="text-4xl font-bold">
                    {weather.current.temperature_2m}°C
                  </p>
                </div>

                <div className="bg-green-100 rounded-xl p-4">
                  <h3 className="text-gray-500">Humidity</h3>
                  <p className="text-4xl font-bold">
                    {weather.current.relative_humidity_2m}%
                  </p>
                </div>

                <div className="bg-yellow-100 rounded-xl p-4">
                  <h3 className="text-gray-500">Wind Speed</h3>
                  <p className="text-4xl font-bold">
                    {weather.current.wind_speed_10m} km/h
                  </p>
                </div>

                <div className="bg-purple-100 rounded-xl p-4">
                  <h3 className="text-gray-500">Weather</h3>
                  <p className="text-xl font-bold">
                    {weatherDescriptions[weather.current.weather_code]}
                  </p>
                </div>

              </div>

              <div className="mt-8 text-center">

                <h3 className="text-xl font-bold mb-2">

                  💡 Weather Advice

                </h3>

                {weather.weather_advice.map((tip, index) => (

                    <p key={index}>

                      ✔ {tip}

                    </p>

                ))}

              </div>
            </>

        )}

      </div>

  );

}