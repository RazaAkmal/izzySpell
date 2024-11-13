import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import clsx from "clsx";

type Props = {
  register: any;
  setValue: any;
  fieldName: string;
  errors: any;
  requiredValue?: boolean;
  className?: string;
  options: string[] | number[]
};

export default function MonthDropdown({ register, setValue, fieldName, errors, requiredValue = false, className, options }: Props) {
  const [selected, setSelected] = useState(options[0]);

  register(fieldName, { required: requiredValue ? "This field is required" : "" });

  return (
    <div className="w-full max-w-md">
      <Listbox
        value={selected}
        onChange={(value) => {
          setSelected(value);
          setValue(fieldName, value);
        }}
      >
        {({ value }) => (
          <div className="relative">
            <ListboxButton className={clsx(
              "relative w-full px-4 py-2 border border-inputText rounded-xl text-inputText",
              "data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-inputText ",
              "cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm",
              className
            )}>
              <span className="block truncate">{value}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pointer-events-none"></span>
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((month, monthIdx) => (
                  <ListboxOption
                    key={monthIdx}
                    className={({ active }) =>
                      `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                            cursor-default select-none relative py-2 text-center`
                    }
                    value={month}
                  >
                    {({ selected }) => (
                      <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                        {month}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
      {errors[fieldName] && (
        <p className="text-red-500 mt-2">{errors[fieldName].message}</p>
      )}
    </div>
  )
}
