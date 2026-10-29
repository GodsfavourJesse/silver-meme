"use client";

import {
    forwardRef,
    useId,
    useState,
    type ComponentPropsWithoutRef,
} from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

interface PasswordInputProps
    extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
    label?: string;
    hint?: string;
    error?: string;
    showSecurityBadge?: boolean;
}

export const PasswordInput = forwardRef<
    HTMLInputElement,
    PasswordInputProps
>(function PasswordInput(
    {
        id,
        name,
        label = "Password",
        placeholder = "Enter your password",
        autoComplete = "current-password",
        required = true,
        className = "",
        hint,
        error,
        showSecurityBadge = false,
        disabled,
        ...inputProps
    },
    ref,
) {
    const [isVisible, setIsVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const shouldReduceMotion = useReducedMotion();

    const describedBy = [
        inputProps["aria-describedby"],
        error ? errorId : undefined,
        !error && hint ? hintId : undefined,
    ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
        <div className="w-full space-y-2">
            {/* Label */}
            <div className="flex min-h-5 items-center justify-between gap-3">
                <label
                    htmlFor={inputId}
                    className="text-[13px] font-semibold tracking-[-0.01em] text-slate-800"
                >
                    {label}
                    {/* {required && (
                        <span
                            className="ml-1 text-[#1491FF]"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )} */}
                </label>

                {showSecurityBadge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <ShieldCheck
                            size={12}
                            className="text-[#1491FF]"
                            aria-hidden="true"
                        />
                        Secure field
                    </span>
                )}
            </div>

            {/* Input container */}
            <motion.div
                animate={
                    error
                        ? { x: shouldReduceMotion ? 0 : [0, -3, 3, -2, 2, 0] }
                        : { x: 0 }
                }
                transition={{ duration: 0.3 }}
                className={`
                    group relative flex h-[52px] w-full items-center
                    gap-3 overflow-hidden rounded-2xl border
                    bg-white px-3.5
                    transition-[border-color,box-shadow,background-color]
                    duration-200
                    ${
                        error
                            ? "border-rose-300 bg-rose-50/30 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-500/10"
                            : "border-slate-200/90 hover:border-slate-300 focus-within:border-[#1491FF] focus-within:ring-4 focus-within:ring-[#1491FF]/10"
                    }
                    ${
                        disabled
                            ? "cursor-not-allowed bg-slate-50 opacity-70"
                            : ""
                    }
                `}
            >
                {/* Brand-accented leading icon */}
                <div
                    className={`
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-xl transition-colors duration-200
                        ${
                            error
                                ? "bg-rose-100 text-rose-500"
                                : "bg-slate-100 text-slate-500 group-focus-within:bg-[#1491FF]/10 group-focus-within:text-[#1491FF]"
                        }
                    `}
                >
                    <LockKeyhole
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                {/* Password field */}
                <input
                    {...inputProps}
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={isVisible ? "text" : "password"}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    aria-invalid={error ? true : inputProps["aria-invalid"]}
                    aria-describedby={describedBy}
                    className={`
                        h-full min-w-0 flex-1
                        bg-transparent py-0
                        text-[13px] font-medium tracking-[0.01em]
                        text-slate-800 outline-none
                        placeholder:font-normal placeholder:text-slate-400
                        disabled:cursor-not-allowed
                        ${className}
                    `}
                />

                {/* Visibility toggle */}
                <button
                    type="button"
                    onClick={() => setIsVisible((current) => !current)}
                    disabled={disabled}
                    aria-label={
                        isVisible ? "Hide password" : "Show password"
                    }
                    aria-pressed={isVisible}
                    className="
                        relative flex h-9 w-9 shrink-0 items-center
                        justify-center rounded-xl text-slate-400
                        transition-all duration-200
                        hover:bg-[#1491FF]/10 hover:text-[#0876D1]
                        active:scale-95
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#1491FF]
                        focus-visible:ring-offset-1
                        disabled:pointer-events-none
                    "
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isVisible ? "visible" : "hidden"}
                            initial={
                                shouldReduceMotion
                                    ? false
                                    : { opacity: 0, scale: 0.75 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            exit={
                                shouldReduceMotion
                                    ? undefined
                                    : { opacity: 0, scale: 0.75 }
                            }
                            transition={{ duration: 0.14 }}
                            className="flex items-center justify-center"
                        >
                            {isVisible ? (
                                <EyeOff size={17} strokeWidth={1.8} />
                            ) : (
                                <Eye size={17} strokeWidth={1.8} />
                            )}
                        </motion.span>
                    </AnimatePresence>
                </button>

                {/* Subtle bottom focus indicator */}
                <div
                    aria-hidden="true"
                    className={`
                        pointer-events-none absolute inset-x-4 bottom-0
                        h-[2px] origin-center scale-x-0 rounded-full
                        bg-[#1491FF] opacity-0
                        transition-all duration-300
                        group-focus-within:scale-x-100
                        group-focus-within:opacity-100
                    `}
                />
            </motion.div>

            {/* Helper text or validation error */}
            <AnimatePresence initial={false} mode="wait">
                {error ? (
                    <motion.p
                        key="error"
                        id={errorId}
                        role="alert"
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: -4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                            shouldReduceMotion
                                ? undefined
                                : { opacity: 0, y: -4 }
                        }
                        transition={{ duration: 0.16 }}
                        className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-rose-600"
                    >
                        <span
                            aria-hidden="true"
                            className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-rose-500"
                        />
                        {error}
                    </motion.p>
                ) : hint ? (
                    <motion.p
                        key="hint"
                        id={hintId}
                        initial={
                            shouldReduceMotion
                                ? false
                                : { opacity: 0, y: -3 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                            shouldReduceMotion
                                ? undefined
                                : { opacity: 0, y: -3 }
                        }
                        transition={{ duration: 0.16 }}
                        className="text-[11px] leading-5 text-slate-400"
                    >
                        {hint}
                    </motion.p>
                ) : null}
            </AnimatePresence>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";