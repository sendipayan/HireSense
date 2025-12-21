"use client"

import { useEffect, useRef, useState } from "react"

type OTPInputProps = {
    length?: number
    onComplete: (otp: string) => void
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(""))
    const inputsRef = useRef<HTMLInputElement[]>([])

    useEffect(() => {
        inputsRef.current[0]?.focus()
    }, [])

    const focus = (index: number) => {
        inputsRef.current[index]?.focus()
    }

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const next = [...values]

        // Detect deletion
        if (value === "") {
            next[index] = ""
            setValues(next)

            if (index > 0) {
                focus(index - 1)
            }
            return
        }

        // Normal input
        next[index] = value.slice(-1)
        setValues(next)

        if (index < length - 1) {
            focus(index + 1)
        }

        if (next.every(Boolean)) {
            onComplete(next.join(""))
        }
    }


    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        console.log(e.key)
        if (e.key === "Backspace") {
            e.preventDefault()

            const next = [...values]

            if (values[index]) {
                // clear current
                next[index] = ""
                setValues(next)
                return
            }

            if (index > 0) {
                // move back and clear
                next[index - 1] = ""
                setValues(next)
                focus(index - 1)
            }
        }

        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault()
            focus(index - 1)
        }

        if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault()
            focus(index + 1)
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const text = e.clipboardData.getData("text").slice(0, length)

        if (!/^\d+$/.test(text)) return

        const next = text.split("")
        setValues(next)

        if (next.length === length) {
            onComplete(next.join(""))
        }
    }

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {values.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        if (el) inputsRef.current[index] = el
                    }}
                    value={value}
                    inputMode="numeric"
                    type="text"
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 w-12 rounded-md border text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`OTP digit ${index + 1}`}
                />
            ))}
        </div>
    )
}
