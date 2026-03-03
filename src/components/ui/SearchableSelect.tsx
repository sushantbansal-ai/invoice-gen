'use client'
import Select from 'react-select'
import { Controller, type Control } from 'react-hook-form'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  label: string
  options: Option[]
  placeholder?: string
  error?: string
  required?: boolean
}

export function SearchableSelect({
  name,
  control,
  label,
  options,
  placeholder,
  error,
  required,
}: SearchableSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            options={options}
            value={options.find((o) => o.value === field.value) || null}
            onChange={(opt) => field.onChange(opt?.value ?? '')}
            onBlur={field.onBlur}
            placeholder={placeholder || `Select ${label}...`}
            isClearable
            isSearchable
            classNames={{
              control: ({ isFocused }) =>
                `!border-[1px] !rounded-lg !text-sm !min-h-[38px] !shadow-none ${
                  isFocused
                    ? '!border-[#7C3AED] !ring-1 !ring-[#7C3AED]'
                    : '!border-gray-300'
                }`,
              option: ({ isSelected, isFocused }) =>
                isSelected
                  ? '!bg-[#7C3AED] !text-white'
                  : isFocused
                  ? '!bg-[#ede9fe] !text-gray-900'
                  : '!text-gray-700',
              menu: () => '!z-50',
              placeholder: () => '!text-gray-400',
            }}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={
              typeof document !== 'undefined' ? document.body : null
            }
          />
        )}
      />
      {error && (
        <p className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
