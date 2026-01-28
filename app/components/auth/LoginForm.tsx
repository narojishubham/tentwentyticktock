"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials");
        } else {
            router.push("/dashboard");
        }
    };


    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <input className="input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input className="input mt-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button className="btn-primary mt-4 w-full">Login</button>
        </form>
    );
}