export default function ProjectDescription() {
  return (
    <div className="mb-6 p-3 bg-amber-200 rounded-lg border border-red-200">
      <p className="text-sm text-gray-600 mb-3">
        Diese interaktive Karte zeigt alle offenen Gärten aus der Datenbank von
        <a
          href="https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-blue-400 hover:underline ml-1"
        >
          Offene Gärten
        </a>
        . Die Daten wurden zuletzt am 25.7.2025 verarbeitet.
      </p>
      <p className="text-xs text-gray-500">
        <a
          href="https://github.com/tordans/offene-gaerten-karte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-blue-400 hover:underline"
        >
          GitHub Repository
        </a>
      </p>
    </div>
  );
}
