'use client'

import {auth, googleProvider} from "@/utils/firebase/client";
import {signInWithPopup} from "@firebase/auth";
import {Button} from "@/components/ui/button";
import {LogIn} from "lucide-react";
import {usePlayerStore} from "@/lib/stores/player-store";
import {useState} from "react";
import {Player} from "@/database/schema";


const FirebaseLogin = () => {

    const {player, setPlayer} = usePlayerStore();
    const [loading, setLoading] = useState(false);

    async function handleGoogleAuth() {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const response = await fetch('/api/auth-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: result.user.uid,
                    name: result.user.displayName,
                    email: result.user.email,
                    imageUrl: result.user.photoURL
                }),
            });
            const data = JSON.parse(await response.json()) as Player;
            console.log(data);
            if (data) {
                setPlayer(data);
            }
            console.log("User signed in with Google:", result.user);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
        setLoading(false);
    }

    return (
        <>
            {
                player ? (
                    <div className="flex items-center gap-2">
                        <p>Signed in as {player.name}</p>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="lg"
                        disabled={loading}
                        className="flex items-center gap-2"
                        onClick={handleGoogleAuth}
                    >
                        <LogIn/>
                        {loading && <span>Loading...</span>}
                        {!loading && <span>Sign in with Google</span>}
                    </Button>
                )
            }
        </>
    );
};

export default FirebaseLogin;