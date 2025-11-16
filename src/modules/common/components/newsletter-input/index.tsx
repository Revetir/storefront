import React from "react"

type NewsletterInputProps = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
  placeholder: string
  required?: boolean
  type?: string
  name: string
  className?: string
}

const NewsletterInput = React.forwardRef<HTMLInputElement, NewsletterInputProps>(
  ({ value, onChange, onFocus, placeholder, required = false, type = "text", name, className = "" }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        className={`w-full h-10 px-3 py-2 border border-black focus:border-black focus:outline-none transition-colors ${className}`}
      />
    )
  }
)

NewsletterInput.displayName = "NewsletterInput"

export default NewsletterInput
