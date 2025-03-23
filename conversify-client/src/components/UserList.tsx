"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import axios from "axios";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Props {
    onSelectUser: (user: User) => void;
}

const UserList = ({ onSelectUser }: Props) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
                const token = localStorage.getItem("token");
                const loggedInUser = JSON.parse(localStorage.getItem("user") || '{}');

                if (!token || !loggedInUser._id) {
                    throw new Error("Invalid user or token");
                }

                const response = await axios.get(`${apiBaseUrl}/api/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const filteredUsers = response.data.data.filter((user: User) => user._id !== loggedInUser._id);
                setUsers(filteredUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
                if (err?.status == "401"){
                    router.push('/login')
                }
                setError("Failed to fetch users. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", color: "#333" }}>Select Users to Chat With</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {users.length > 0 ? (
                    users.map((user) => (
                        <li
                            key={user._id}
                            onClick={() => onSelectUser(user)}
                            style={{
                                padding: "10px",
                                marginBottom: "10px",
                                background: "#f9f9f9",
                                borderRadius: "5px",
                                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                            }}
                        >
                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>{user.name}</span>
                        </li>
                    ))
                ) : (
                    <p style={{ textAlign: "center", color: "#777" }}>No users found.</p>
                )}
            </ul>
        </div>

    );
};

export default UserList;
