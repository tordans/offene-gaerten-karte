import DebugToggle from './DebugToggle'
import lastUpdatedData from './data/last-updated.json'

export default function Footer() {
  return (
    <div className="pt-4">
      <details className="mb-2">
        <summary className="cursor-pointer text-xs text-gray-600 underline hover:text-red-700">
          Impressum, Datenschutz
        </summary>
        <div className="mt-2 space-y-2 text-xs text-gray-600">
          <div>
            <h2 className="mb-1 font-medium">Impressum:</h2>
            <p>
              <a
                href="https://www.xn--offene-grten-ncb.de/impressum/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-blue-400 hover:underline"
              >
                Es gilt das Impressum von Offene Gärten Brandenburg.
              </a>
            </p>
          </div>
          <div className="mt-3">
            <h2 className="mb-1 font-medium">Datenschutz:</h2>
            <p className="mb-2">
              Bei der Nutzung dieser Website werden von uns keine personenbezogenen Daten erfasst
              oder gespeichert. Es gibt kein Webtracking und keine Cookies.
            </p>
            <p className="mb-2">
              Diese Website bindet Inhalte von externen Domains ein, die unten gelistet sind. Beim
              Aufruf dieser Inhalte wird die IP-Adresse sowie ggf. Informationen über den Browser
              übermittelt. Wie diese Informationen verarbeitet werden, steht in den
              Datenschutzerklärungen der Anbieter.
            </p>

            <div className="space-y-1">
              <p>
                <strong>GitHub Pages (github.io, github.com)</strong>
              </p>
              <p>
                Diese Website wird auf Servern von Github Inc., 88 Colin P Kelly Jr St, San
                Francisco, CA 94107, USA gehostet. Bitte beachtet die GitHub Privacy Policy.
              </p>
              <p>
                <a
                  href="https://www.github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-blue-400 hover:underline"
                >
                  https://www.github.com/
                </a>{' '}
                <a
                  href="https://help.github.com/articles/github-privacy-statement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-blue-400 hover:underline"
                >
                  https://help.github.com/articles/github-privacy-statement/
                </a>
              </p>

              <p>
                <strong>Kartenstil Maptiler (maptiler.com)</strong>
              </p>
              <p>
                Die Grafiken für den Kartenstil von Maptiler werden von den Servern von maptiler.com
                geladen. Bitte beachtet die Datenschutzerklärungen von Maptiler.
              </p>
              <p>
                <a
                  href="https://www.maptiler.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-blue-400 hover:underline"
                >
                  https://www.maptiler.com/
                </a>
              </p>

              <p>
                <strong>Hintergrundkarte Luftbild Brandenburg</strong>
              </p>
              <p>
                GeoBasis-DE/LGB / BB-BE DOP20c, dl-de/by-2-0; Geoportal Berlin / DOP20, dl-de/by-2-0
              </p>
              <p>
                <a
                  href="https://geobasis-bb.de/lgb/de/datenschutz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-blue-400 hover:underline"
                >
                  https://geobasis-bb.de/lgb/de/datenschutz/
                </a>
              </p>
            </div>
          </div>
        </div>
      </details>

      <details className="mb-2">
        <summary className="cursor-pointer text-xs text-gray-600 underline hover:text-red-700">
          Mehr erfahren
        </summary>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p>
            <a
              href="https://github.com/tordans/offene-gaerten-karte"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-blue-400 hover:underline"
            >
              GitHub Repository
            </a>
          </p>

          <DebugToggle />
        </div>
      </details>

      <p className="text-xs text-gray-500">Zuletzt aktualisiert: {lastUpdatedData.lastUpdated}</p>
    </div>
  )
}
