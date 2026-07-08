export default function MapEmbed({ weather }) {

    if (!weather) return null;

    return (

        <div className="mt-8 text-center">

            <a

                href={weather.google_maps}

                target="_blank"

                rel="noreferrer"

                className="bg-blue-600 text-white px-6 py-3 rounded-lg"

            >

                🗺 Open Google Maps

            </a>

        </div>

    );

}
