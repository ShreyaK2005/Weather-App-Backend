export default function AQIUVCard({ weather }) {

  if (!weather) return null;

  return (

      <div className="grid grid-cols-2 gap-6 mt-8">

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-4">
            🌫 Air Quality
          </h2>

          <p><strong>AQI:</strong> {weather.air_quality.european_aqi}</p>

          <p><strong>Status:</strong> {weather.air_quality.status}</p>

          <p><strong>PM2.5:</strong> {weather.air_quality.pm2_5}</p>

          <p><strong>PM10:</strong> {weather.air_quality.pm10}</p>

          <p><strong>CO:</strong> {weather.air_quality.carbon_monoxide}</p>

          <p><strong>NO₂:</strong> {weather.air_quality.nitrogen_dioxide}</p>

          <p><strong>Ozone:</strong> {weather.air_quality.ozone}</p>

          <div className="mt-4 text-green-700 text-center">

            {weather.air_quality.health_advice}

          </div>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-4">

            ☀ UV Index

          </h2>

          <div className="text-5xl font-bold mb-4">

            {weather.uv_index}

          </div>

          <p>

            {weather.uv_advice}

          </p>

        </div>

      </div>

  );

}