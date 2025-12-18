import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Login() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            signIn("hc-identity", { code, callbackUrl: "/" });
        }
    }, [searchParams]);

    return (
        <div>
            <h1>Logging you in...</h1>
        </div>
    );
}