'use client'
import {useEffect, useState} from 'react'
import Image from "next/image";

export default function ComingSoon() {
    const [email, setEmail] = useState('')
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const launchDate = new Date()
        launchDate.setDate(launchDate.getDate() + 10) // 10 days from now

        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = launchDate.getTime() - now

            if (distance < 0) {
                setTimeLeft('We are live!')
                clearInterval(timer)
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <main
            className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-6 text-center">
            <div className="mt-6 flex-1 flex-col items-center gap-4"></div>
            {/* Logo / Title */}
            <div className="flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2"/>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary animate-fade-down">
                    UNO
                </h1>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary animate-fade-down mt-2">
                🚀 Coming Soon
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-md animate-fade-up">
                We’re working hard to bring you something amazing. Stay tuned!
            </p>

            {/* Countdown */}
            <div className="mt-6 text-xl font-mono text-foreground animate-pulse">
                {timeLeft}
            </div>

            <div className="mt-6 flex-1 flex-col items-center gap-4"></div>

            {/* Footer */}
            <p className="mt-10 text-xs text-muted-foreground">
                © {new Date().getFullYear()} Navagath. All rights reserved.
            </p>
        </main>
    )
}
