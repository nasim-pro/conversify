"use client";
import React, { useState } from "react";
import { CSSProperties } from "react";
import { useRouter } from "next/navigation";
const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const router = useRouter()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form Submitted", formData);
    };

    return (
        <div style={styles.topContainer}>
            <div style={{ paddingTop: "50px"}}>
                <div style={styles.innerContainer}>
                    <h2 style={styles.title}>Sign Up</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.button}>Sign Up</button>
                    </form>
                    <p>Already have an account?
                        <span
                            onClick={() => router.push('/login')}
                            style={styles.link}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: CSSProperties } = {
    topContainer: {
        height: '100vh',
        backgroundImage: "url('/pic2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
    },
    innerContainer: {
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
};

export default SignUp;