import { Description, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { get } from "lodash";

type Props = {
  id: string;
  title?: string;
  description?: string;
  placeholder: string;
  type?: "text" | "number" | "password" | "email" | "search" | "date" | "url";
  register: any;
  fieldName: string;
  requiredValue: boolean;
  errors: any;
  className?: string;
};
export default function InputField({
  title,
  description,
  placeholder,
  type,
  register,
  fieldName,
  requiredValue,
  errors,
  className,
}: Props) {
  return (
    <div className="w-full max-w-md">
      <Field>
        {title && (
          <Label className="text-sm/6 font-medium text-white">{title}</Label>
        )}
        {description && (
          <Description className="text-sm/6 text-white/50">
            description
          </Description>
        )}
        <Input
          placeholder={placeholder}
          type={type}
          className={clsx(
            "w-full px-4 py-2 border border-inputText rounded-xl text-inputText",
            "data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-inputText ",
            className
          )}
          {...register(fieldName, {
            required: requiredValue
              ? "This Field is required"
              : "",
            shouldUnregister: true,
            ...(type &&
              type === "email" && {
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Please enter a valid email",
                },
              }),
            ...(type &&
              type === "url" && {
                pattern: {
                  value: /^(https?:\/\/)?([\w\d-]+\.)+[\w]{2,}(\/[^\s]*)?$/,
                  message: "Please enter a valid URL",
                },
              }),
          })}
        />
      </Field>
      {get(errors, fieldName) && (
        <p className="text-red-500 mt-2">{get(errors, fieldName).message}</p>
      )}
    </div>
  );
}
