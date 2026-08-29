import { useId, useState } from "react";

export function PasswordInput({
  value,
  onChange,
  placeholder,
  name,
  id,
  required,
  className,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
  id?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          className ??
          "w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-lg pl-4 pr-11 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-colors duration-200"
        }
      />
      <button
        aria-label="Toggle password visibility"
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">{visible ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  );
}
