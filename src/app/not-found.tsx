'use client'
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from "@/components/ui/button";

function NotFound() {
    const router = useRouter();
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        // Safe to access window on client
        if (window.history.length > 2) {
            setCanGoBack(true);
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p>Page not found</p>
            <div className="flex gap-4">
                {canGoBack ? (
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        asChild
                    >
                        <Link
                            href="/"
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            Home
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default NotFound;
