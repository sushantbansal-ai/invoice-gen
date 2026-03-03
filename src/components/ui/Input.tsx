import React from 'react'

interface BaseProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

interface InputProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface TextareaProps extends BaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
  rows?: number
}

interface SelectProps extends BaseProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select'
  options: { value: string; label: string }[]
}

type FormFieldProps = InputProps | TextareaProps | SelectProps

const baseInputClasses =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-colors disabled:bg-gray-50 disabled:text-gray-500'

const errorInputClasses =
  'border-red-400 focus:border-red-500 focus:ring-red-500'

export function Input(props: FormFieldProps) {
  const { label, error, helperText, required, as, ...rest } = props

  const inputId = rest.id || rest.name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const inputClass = [baseInputClasses, error ? errorInputClasses : ''].join(' ')

  const renderField = () => {
    if (as === 'textarea') {
      const { rows = 3, ...textareaRest } = rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>
      return (
        <textarea
          id={inputId}
          rows={rows}
          className={`${inputClass} resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...textareaRest}
        />
      )
    }

    if (as === 'select') {
      const { options, ...selectRest } = rest as SelectProps
      return (
        <select
          id={inputId}
          className={`${inputClass} cursor-pointer`}
          aria-invalid={!!error}
          {...(selectRest as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        id={inputId}
        className={inputClass}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {renderField()}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}
