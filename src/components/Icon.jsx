// Íconos de línea fina (reemplazan a los emojis)
const ICON_PATHS = {
  home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  trips: "M5 19a2 2 0 100-4 2 2 0 000 4zm14-10a2 2 0 100-4 2 2 0 000 4zM7 17h7a3 3 0 000-6h-4a3 3 0 010-6h5",
  incidents: "M12 3l10 18H2zM12 10v5M12 18v.01",
  drivers: "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a3 3 0 00-2-2.8",
  vehicles: "M5 16l1.5-5a2 2 0 011.9-1.4h7.2a2 2 0 011.9 1.4L19 16M3 16h18v3H3zM7 19v1M17 19v1",
  admin: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  account: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  plus: "M12 5v14M5 12h14",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  clipboard: "M9 4h6v3H9zM7 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-1M9 12h6M9 16h4",
};

export default function Icon({ name, size = 19, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}