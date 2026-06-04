interface IconProps {
  size?: number;
  className?: string;
}

/** A little garden spade/trowel — used for the "edit" treat. */
export function Spade({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      {/* handle */}
      <rect x="10.6" y="2.5" width="2.8" height="7" rx="1.4" fill="currentColor" />
      <rect x="8.8" y="8.4" width="6.4" height="2.6" rx="1.3" fill="currentColor" />
      {/* blade */}
      <path
        d="M7.5 11.2 H16.5 L14.4 19.2 C14.1 20.5 13.1 21.4 12 21.4 C10.9 21.4 9.9 20.5 9.6 19.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** A watering can. */
export function WateringCan({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 9 H15 V17 C15 18.7 13.7 20 12 20 H8 C6.3 20 5 18.7 5 17 Z" fill="currentColor" />
      <path d="M15 11 L21 7 L21 9 L17 12.5 Z" fill="currentColor" />
      <rect x="7" y="5.5" width="6" height="2.4" rx="1.2" fill="currentColor" />
      <path d="M14.5 9 C18 9 19.5 6.5 19.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** A simple plus for "add". */
export function Plus({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 5 V19 M5 12 H19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** A target/dot for focus mode. */
export function Target({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  );
}
