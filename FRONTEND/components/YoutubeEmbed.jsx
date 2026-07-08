export default function YoutubeEmbed({ weather }) {

    if (!weather) return null;

    return (

        <div className="mt-4 text-center">

            <a

                href={weather.youtube}

                target="_blank"

                rel="noreferrer"

                className="bg-red-600 text-white px-6 py-3 rounded-lg"

            >

                ▶ Watch YouTube Videos

            </a>

        </div>

    );

}
