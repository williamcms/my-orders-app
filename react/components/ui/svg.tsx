import React from 'react'

export const RefreshCwIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
)

export const ChevronRightIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const PackageIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
)

export const StoreIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
)

export const CalendarIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

export const PhoneIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

export const ClockIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

export const CopyIcon = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon_sm ${className}`}
    style={style}
    aria-hidden="true"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
)

export const ImagePlaceholder = ({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties | undefined
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    className={className}
    style={style}
    aria-label="Image not available"
  >
    <path fill="#F4F6FB" d="M0 4a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4Z" />
    <path
      fill="#898F9E"
      fill-rule="evenodd"
      d="M16 15.75c-.69 0-1.25.56-1.25 1.25v14c0 .58.395 1.068.93 1.209l4.113-4.936a1.75 1.75 0 0 1 2.438-.247l1.867 1.495a.251.251 0 0 0 .353-.039l3.336-4.17a1.75 1.75 0 0 1 2.46-.273l2.997 2.398V17c0-.69-.56-1.25-1.25-1.25H16Zm18.744 12.182V17a2.75 2.75 0 0 0-2.75-2.75H16A2.75 2.75 0 0 0 13.25 17v14A2.75 2.75 0 0 0 16 33.75h15.994a2.75 2.75 0 0 0 2.75-2.75v-2.931a.755.755 0 0 0 0-.137Zm-1.5.426-3.934-3.147a.251.251 0 0 0-.352.039l-3.336 4.17a1.75 1.75 0 0 1-2.46.273l-1.868-1.495a.25.25 0 0 0-.349.035l-3.347 4.017h14.396c.69 0 1.25-.56 1.25-1.25v-2.642Zm-12.363-8.242a1.25 1.25 0 1 0-1.768 1.768 1.25 1.25 0 0 0 1.768-1.768Zm1.06-1.061a2.75 2.75 0 1 0-3.89 3.889 2.75 2.75 0 0 0 3.89-3.889Z"
      clip-rule="evenodd"
    />
  </svg>
)
