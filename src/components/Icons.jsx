// SVG Icon Components

export function SunIcon() {
  return (
    <svg
      className="w-12 h-12 text-yellow-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v6m0 6v6M23 12h-6m-6 0H1M20.485 3.515l-4.242 4.242m-8.486 0l-4.242-4.242M20.485 20.485l-4.242-4.242m-8.486 0l-4.242 4.242"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg
      className="w-12 h-12 text-indigo-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function PlateIcon() {
  return (
    <svg
      className="w-12 h-12 text-orange-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

export function AudioIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h4V7h2v5h4l-5 5z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

export function WarningIcon() {
  return (
    <svg
      className="w-6 h-6 text-yellow-600"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export function getDosageIcons(dosage) {
  const icons = [];
  if (dosage.morning) icons.push({ id: "morning", Icon: SunIcon });
  if (dosage.afternoon) icons.push({ id: "afternoon", Icon: SunIcon });
  if (dosage.night) icons.push({ id: "night", Icon: MoonIcon });
  return icons;
}

export function InfoIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
