
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  workOrder?: {
    id: number;
    code?: string;
  } | null;
};

type NotificationResponse = {
  content: NotificationItem[];
};

export default function Notifications() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<NotificationResponse>(
        "/notifications",
        {
          params: {
            page: 0,
            size: 50,
          },
        }
      );

      setNotifications(response.data.content || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const formatTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }

    return created.toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "white" : "#1e293b",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
          }}
        >
          KEYSTONE
        </h1>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ← Back Dashboard
        </button>
      </div>

      <h1
        style={{
          marginTop: "40px",
        }}
      >
        Notifications
      </h1>

      <p
        style={{
          color: darkMode ? "#94a3b8" : "#64748b",
        }}
      >
        Latest system activities and customer alerts
      </p>

      {loading && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            background: darkMode ? "#111827" : "white",
            borderRadius: "15px",
          }}
        >
          Loading notifications...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "15px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            background: darkMode ? "#111827" : "white",
            borderRadius: "15px",
          }}
        >
          No notifications yet.
        </div>
      )}

      {!loading &&
        !error &&
        notifications.map((item) => (
          <div
            key={item.id}
            style={{
              background: item.read
                ? darkMode
                  ? "#111827"
                  : "white"
                : darkMode
                ? "#1e293b"
                : "#e0f2fe",
              padding: "25px",
              marginTop: "20px",
              borderRadius: "15px",
              borderLeft: item.read
                ? "5px solid #64748b"
                : "5px solid #2563eb",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h2>{item.title}</h2>

            <p>{item.message}</p>

            {item.workOrder?.code && (
              <p
                style={{
                  color: darkMode ? "#cbd5e1" : "#475569",
                  fontWeight: "bold",
                }}
              >
                Work Order: {item.workOrder.code}
              </p>
            )}

            <small
              style={{
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              {formatTime(item.createdAt)}
            </small>

            {!item.read && (
              <button
                onClick={() => markRead(item.id)}
                style={{
                  display: "block",
                  marginTop: "15px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Mark as Read
              </button>
            )}

            {item.read && (
              <p
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                }}
              >
                ✓ Read
              </p>
            )}
          </div>
        ))}
    </div>
  );
}
