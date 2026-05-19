import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  id: string;
  helperText?: string;
  required?: boolean;
};

type InputFieldProps = BaseProps & {
  type?: "text" | "email" | "password" | "number" | "date";
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  multiline?: false;
};

type TextareaFieldProps = BaseProps & {
  multiline: true;
  inputProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
};

type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, id, helperText, required } = props;

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-4">
      <label htmlFor={id} className="text-sm font-medium sm:text-right">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      <div className="min-w-0">
        {props.multiline ? (
          <textarea
            id={id}
            className="textarea textarea-bordered w-full"
            required={required}
            {...props.inputProps}
          />
        ) : (
          <input
            id={id}
            type={props.type ?? "text"}
            className="input input-bordered w-full"
            required={required}
            {...props.inputProps}
          />
        )}
        {helperText && (
          <p className="mt-1 text-xs opacity-70">{helperText}</p>
        )}
      </div>
    </div>
  );
}
