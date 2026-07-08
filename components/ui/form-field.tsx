import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FormFieldType = "text" | "textarea" | "select" | "date" | "time";

interface SelectOption {
  label: string;
  value: string;
}

interface FormFieldBaseProps {
  className?: string;
  controlClassName?: string;
  errorText?: ReactNode;
  helperText?: ReactNode;
  id: string;
  label: ReactNode;
  optionalText?: string;
  required?: boolean;
}

interface InputFormFieldProps
  extends FormFieldBaseProps,
    Omit<
      ComponentPropsWithoutRef<"input">,
      | "aria-describedby"
      | "aria-invalid"
      | "aria-required"
      | "className"
      | "id"
      | "required"
      | "type"
    > {
  type: "text" | "date" | "time";
}

interface TextareaFormFieldProps
  extends FormFieldBaseProps,
    Omit<
      ComponentPropsWithoutRef<"textarea">,
      | "aria-describedby"
      | "aria-invalid"
      | "aria-required"
      | "className"
      | "id"
      | "required"
    > {
  type: "textarea";
}

interface SelectFormFieldProps
  extends FormFieldBaseProps,
    Omit<
      ComponentPropsWithoutRef<"select">,
      | "aria-describedby"
      | "aria-invalid"
      | "aria-required"
      | "className"
      | "id"
      | "required"
    > {
  options: SelectOption[];
  placeholder?: string;
  type: "select";
}

export type FormFieldProps =
  | InputFormFieldProps
  | TextareaFormFieldProps
  | SelectFormFieldProps;

const controlClasses = [
  "w-full rounded-md border bg-wink-surface px-3 py-2",
  "text-base text-wink-text placeholder:text-wink-text-secondary",
  "transition-colors duration-200",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background",
  "disabled:cursor-not-allowed disabled:bg-wink-surface-muted disabled:text-wink-text-secondary"
].join(" ");

export function FormField(props: FormFieldProps) {
  const {
    className = "",
    controlClassName = "",
    errorText,
    helperText,
    id,
    label,
    optionalText = "Optional",
    required = false,
    type
  } = props;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const hasError = Boolean(errorText);
  const sharedControlClasses = [
    controlClasses,
    type === "textarea" ? "min-h-32 resize-y leading-6" : "min-h-11",
    hasError ? "border-wink-danger" : "border-wink-border",
    controlClassName
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={["space-y-2", className].filter(Boolean).join(" ")}>
      <label className="block text-sm font-semibold text-wink-text" htmlFor={id}>
        <span>{label}</span>
        {required ? (
          <span className="ml-2 text-wink-danger" aria-hidden="true">
            Required
          </span>
        ) : (
          <span className="ml-2 font-normal text-wink-text-secondary">
            {optionalText}
          </span>
        )}
      </label>
      {renderControl({
        describedBy,
        hasError,
        id,
        props,
        required,
        sharedControlClasses
      })}
      {helperText ? (
        <p className="text-sm leading-6 text-wink-text-secondary" id={helperId}>
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p className="text-sm font-semibold leading-6 text-wink-danger" id={errorId}>
          Error: {errorText}
        </p>
      ) : null}
    </div>
  );
}

function renderControl({
  describedBy,
  hasError,
  id,
  props,
  required,
  sharedControlClasses
}: {
  describedBy?: string;
  hasError: boolean;
  id: string;
  props: FormFieldProps;
  required: boolean;
  sharedControlClasses: string;
}) {
  if (props.type === "textarea") {
    const {
      className: _className,
      controlClassName: _controlClassName,
      errorText: _errorText,
      helperText: _helperText,
      id: _id,
      label: _label,
      optionalText: _optionalText,
      required: _required,
      type: _type,
      ...textareaProps
    } = props;

    return (
      <textarea
        {...textareaProps}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        className={sharedControlClasses}
        id={id}
        required={required}
      />
    );
  }

  if (props.type === "select") {
    const {
      className: _className,
      controlClassName: _controlClassName,
      errorText: _errorText,
      helperText: _helperText,
      id: _id,
      label: _label,
      optionalText: _optionalText,
      options,
      placeholder,
      required: _required,
      type: _type,
      ...selectProps
    } = props;

    return (
      <select
        {...selectProps}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        className={sharedControlClasses}
        id={id}
        required={required}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const {
    className: _className,
    controlClassName: _controlClassName,
    errorText: _errorText,
    helperText: _helperText,
    id: _id,
    label: _label,
    optionalText: _optionalText,
    required: _required,
    type,
    ...inputProps
  } = props;

  return (
    <input
      {...inputProps}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      aria-required={required || undefined}
      className={sharedControlClasses}
      id={id}
      required={required}
      type={type}
    />
  );
}
