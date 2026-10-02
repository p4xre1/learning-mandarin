import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "dark"
}

type IconButtonProps = ButtonProps & {
  label: string
  children: ReactNode
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      type="button"
      {...props}
    />
  )
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`icon-button ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />
}

export function TextInput({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="input-wrap">
      <span className="sr-only">{label}</span>
      <SearchIcon />
      <input {...props} />
    </label>
  )
}

export function MarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M9 5h22v30H9z" fill="currentColor" opacity=".14" />
      <path
        d="M15 13h10M20 9v20M14 20c4 0 7-2 10-6M14 20c3 1 7 4 11 9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.3"
      />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m16 16 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function FlameIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M13 2c1 5-3 6-3 10 0 1 1 2 2 2 2 0 3-2 3-4 2 2 4 4 4 7a7 7 0 0 1-14 0c0-4 2-7 5-10 0 3 1 4 2 4 2-2 1-6 1-9Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m9 5 7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function NavIcon({
  name,
}: {
  name: "home" | "learn" | "review" | "discover" | "profile"
}) {
  const paths = {
    home: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z",
    learn:
      "M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2Zm0 2H4v12a2 2 0 0 0 2 2M10 8h4M10 12h5",
    review: "M12 3a9 9 0 1 0 8.5 6M12 7v5l3 2M17 3h4v4",
    discover:
      "M14.8 9.2 13 13l-3.8 1.8L11 11Zm5.2 2.8a8 8 0 1 1-8-8 8 8 0 0 1 8 8Z",
    profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.7-4 3-6 7-6s6.3 2 7 6",
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d={paths[name]}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
