"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CSSProperties } from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("http://localhost:2025/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            // setError("Something went wrong. Please try again.", err);
            setError(err)
        }
    };

    return (
        <div style={styles.bgPicture}>
            <div style={styles.formContainer}>
                <div style={styles.container}>
                    <h2 style={styles.title}>Login</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        {error && <div style={styles.error}>{error}</div>}
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                    <p>Don't have an account?
                        <span
                            onClick={() => router.push('/register')}
                            style={styles.link}
                        >
                            Signup
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: CSSProperties } = {
    formContainer: {
        paddingTop: "50px"
    },
    
    container: {
        maxWidth: "400px",
        padding: "20px",
        margin: "0px auto",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        borderRadius: "10px",
        textAlign: "center" as CSSProperties["textAlign"],
        backgroundColor: "transparent",
    },
    title: {
        marginBottom: "20px",
        fontSize: "24px",
        color: "#333",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    input: {
        marginBottom: "15px",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
    },
    button: {
        padding: "12px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
    },
    error: {
        color: "red",
        marginBottom: "10px",
    },

    link: {
        color: "#0070f3",
        cursor: "pointer",
        marginLeft: "5px",
    },

    bgPicture: {
        height: '100vh',
        backgroundImage: "url('/pic2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
    }
};

export default Login;