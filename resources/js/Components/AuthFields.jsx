import { FiEye, FiEyeOff } from "react-icons/fi";

const INPUT_CLASS =
    "w-full rounded-xl border border-gray-300 dark:border-night-600 bg-white dark:bg-night-900 px-4 py-3 text-sm text-gray-900 dark:text-night-200 outline-none transition placeholder:text-gray-400 dark:placeholder:text-night-500 focus:border-[#ab3c3c] focus:ring-2 focus:ring-[#7F1D32]/10 max-md:rounded-xl max-md:py-3.5 max-md:text-base";

const LABEL_CLASS =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-night-200";

const ERROR_CLASS = "mt-1.5 text-xs text-red-600 dark:text-red-300";

const EYE_BUTTON_CLASS =
    "absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gray-400 dark:text-night-500 hover:text-gray-600";

export function AuthInput({ id, label, error, className = "", ...props }) {
    return (
        <div>
            {label && (
                <label htmlFor={id} className={LABEL_CLASS}>
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`${INPUT_CLASS}${className ? ` ${className}` : ""}`}
                {...props}
            />
            {error && <p className={ERROR_CLASS}>{error}</p>}
        </div>
    );
}

export function PasswordField({
    id,
    label,
    error,
    show = false,
    onToggle,
    showAriaLabel = "Tampilkan kata sandi",
    hideAriaLabel = "Sembunyikan kata sandi",
    className = "",
    ...props
}) {
    return (
        <div>
            {label && (
                <label htmlFor={id} className={LABEL_CLASS}>
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    className={`${INPUT_CLASS} pr-12${className ? ` ${className}` : ""}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={show ? hideAriaLabel : showAriaLabel}
                    className={EYE_BUTTON_CLASS}
                >
                    {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
            </div>
            {error && <p className={ERROR_CLASS}>{error}</p>}
        </div>
    );
}
