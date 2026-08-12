import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post("/api/auth/register", {
                name,
                email,
                password,
            });

            alert("Account created successfully! Please login.");
            navigate("/login");
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#020617",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    width: "380px",
                    background: "#111827",
                    padding: "35px",
                    borderRadius: "20px",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        color: "#3b82f6",
                    }}
                >
                    CREATE ACCOUNT
                </h2>

                <p
                    style={{
                        textAlign: "center",
                        color: "#94a3b8",
                    }}
                >
                    Create your KEYSTONE account
                </p>

                <form onSubmit={handleSubmit}>
                    <label style={{ color: "white" }}>
                        Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <label style={{ color: "white" }}>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <label style={{ color: "white" }}>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        minLength={8}
                        required
                    />

                    {error && (
                        <p
                            style={{
                                color: "#ef4444",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginTop: "15px",
                        }}
                    >
                        {loading ? "CREATING..." : "CREATE ACCOUNT"}
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        marginTop: "20px",
                    }}
                >
                    Already have an account?
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{
                        width: "100%",
                        padding: "11px",
                        background: "transparent",
                        color: "#3b82f6",
                        border: "1px solid #3b82f6",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    SIGN IN
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    boxSizing: "border-box" as const,
};
