type IconProps = { className?: string };

export function LeafIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 1C7 1 2 6 2 11.5C2 15.5 4.5 19 7 19C9.5 19 12 15.5 12 11.5C12 6 7 1 7 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M7 19V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      width="12"
      height="12"
      aria-hidden
    >
      <path
        d="M9 7.5L16 12L9 16.5V7.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect
        x="3"
        y="7"
        width="22"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 9L14 16L25 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NfcIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 5C9 5 5 9 5 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 9C11.5 9 9 11.5 9 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 13C13 13 12 14 12 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="16"
        y="16"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function QuizIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 11.5C10.5 10 11.5 9 13 9C14.5 9 15.5 10 15.5 11.5C15.5 13 13 13 13 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="13" cy="18" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function TreeIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 4L8 14H11L9 22H19L17 14H20L14 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SetupIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect
        x="6"
        y="8"
        width="24"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M12 14H24M12 18H20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TapIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 8V20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 12L18 8L22 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="18"
        cy="26"
        rx="8"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function MessageIcon() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M8 10H28V24H18L12 28V24H8V10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURE_ICONS = {
  envelope: EnvelopeIcon,
  nfc: NfcIcon,
  quiz: QuizIcon,
  tree: TreeIcon,
} as const;

const STEP_ICONS = {
  setup: SetupIcon,
  nfc: NfcIcon,
  tap: TapIcon,
  message: MessageIcon,
  tree: TreeIcon,
} as const;

export type FeatureIconName = keyof typeof FEATURE_ICONS;
export type StepIconName = keyof typeof STEP_ICONS;

export function FeatureStripIcon({ name }: { name: FeatureIconName }) {
  const Icon = FEATURE_ICONS[name];
  return <Icon />;
}

export function StepIcon({ name }: { name: StepIconName }) {
  const Icon = STEP_ICONS[name];
  return <Icon />;
}
