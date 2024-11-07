import { Description, Field, Input, Label } from '@headlessui/react'
import clsx from 'clsx'
type Props = {
  title?: string
  description?: string
  placeholder: string
  type: string
}
export default function InputField({title, description, placeholder, type}: Props) {
  return (
    <div className="w-full max-w-md">
      <Field>
        {title && <Label className="text-sm/6 font-medium text-white">{title}</Label>}
        {description && <Description className="text-sm/6 text-white/50">description</Description>}
        <Input
          placeholder={placeholder}
          type={type}
          className={clsx(
            'w-full px-4 py-2 border border-blue-300 rounded-xl text-blue',
            'focus:ring-2 focus:ring-blue-500 data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
        />
      </Field>
    </div>
  )
}
