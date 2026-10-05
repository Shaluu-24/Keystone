
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useTheme } from "../context/ThemeContext";

type Technician = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type WorkOrder = {
  id: number;
  code: string;
  title: string;
  description?: string;
  priority?: string;
  status: string;
  slaDueAt?: string;

  // Backend response fields
  customerName?: string;
  siteName?: string;
  assignedToName?: string;

  // Support nested response if available
  customer?: {
    id?: number;
    name?: string;
  };

  site?: {
    id?: number;
    name?: string;
    address?: string;
  };

  assignedTo?: Technician;
};

type UserSession = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("keystone_user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }

    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/work-orders", {
        params: {
          page: 0,
          size: 50,
        },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setWorkOrders(data);
      } else {
        setWorkOrders(data.content ?? []);
      }
    } catch (err: any) {
      console.error("Failed to load technician work orders:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("keystone_token");
        localStorage.removeItem("keystone_user");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your work orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const assignedJobs = workOrders.filter(
    (workOrder) =>
      workOrder.status === "ASSIGNED" ||
      workOrder.status === "IN_PROGRESS" ||
      workOrder.status === "ON_HOLD"
  );

  const inProgressJobs = workOrders.filter(
    (workOrder) => workOrder.status === "IN_PROGRESS"
  );

  const completedJobs = workOrders.filter(
    (workOrder) =>
      workOrder.status === "COMPLETED" ||
      workOrder.status === "CLOSED"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "#2563eb";

      case "IN_PROGRESS":
        return "#f59e0b";

      case "ON_HOLD":
        return "#8b5cf6";

      case "COMPLETED":
        return "#16a34a";

      case "CLOSED":
        return "#64748b";

      case "CANCELLED":
        return "#dc2626";

      default:
        return "#64748b";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "#dc2626";

      case "MEDIUM":
        return "#f59e0b";

      case "LOW":
        return "#16a34a";

      default:
        return "#64748b";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const formatPriority = (priority?: string) => {
    if (!priority) return "N/A";
    return priority;
  };

  /*
   * Backend may return site information as siteName.
   * Nested site.address/site.name is also supported.
   */
  const getCustomerName = (workOrder: WorkOrder) => {
    return (
      workOrder.customerName ||
      workOrder.customer?.name ||
      "N/A"
    );
  };

  const getLocation = (workOrder: WorkOrder) => {
    if (workOrder.siteName) {
      return workOrder.siteName;
    }

    if (workOrder.site?.address) {
      return workOrder.site.address;
    }

    if (workOrder.site?.name) {
      return workOrder.site.name;
    }

    return "Location not available";
  };

  const getAssignedTechnician = (workOrder: WorkOrder) => {
    return (
      workOrder.assignedToName ||
      workOrder.assignedTo?.name ||
      "Not assigned"
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: darkMode ? "#020617" : "#f1f5f9",
        color: darkMode ? "white" : "#1e293b",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "250px",
          background: darkMode ? "#111827" : "white",
          padding: "30px 20px",
          boxShadow: "5px 0 15px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            marginBottom: "5px",
          }}
        >
          KEYSTONE
        </h1>

        <h3
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Technician Panel
        </h3>

        <MenuItem
          text="▦ Dashboard"
          active
          onClick={() => navigate("/")}
          darkMode={darkMode}
        />

        <MenuItem
          text="▤ My Work Orders"
          onClick={() => navigate("/work-orders")}
          darkMode={darkMode}
        />

        <MenuItem
          text="◉ Notifications"
          onClick={() => navigate("/notifications")}
          darkMode={darkMode}
        />

        <MenuItem
          text="⚙ Settings"
          onClick={() => navigate("/settings")}
          darkMode={darkMode}
        />

        <button
          onClick={() => {
            localStorage.removeItem("keystone_token");
            localStorage.removeItem("keystone_user");
            navigate("/login");
          }}
          style={{
            width: "100%",
            marginTop: "25px",
            padding: "12px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          ⇥ Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "40px",
          overflowY: "auto",
        }}
      >
        <h1
          style={{
            color: "#2563eb",
            marginBottom: "5px",
          }}
        >
          Technician Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: "5px",
          }}
        >
          Welcome {currentUser?.name || "Technician"}
        </p>

        <p
          style={{
            color: "#64748b",
          }}
        >
          View assigned jobs, update progress, and complete service tasks.
        </p>

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <Card
            title="Assigned Jobs"
            value={loading ? "..." : String(assignedJobs.length)}
            darkMode={darkMode}
          />

          <Card
            title="In Progress"
            value={loading ? "..." : String(inProgressJobs.length)}
            darkMode={darkMode}
          />

          <Card
            title="Completed Jobs"
            value={loading ? "..." : String(completedJobs.length)}
            darkMode={darkMode}
          />
        </div>

        {/* WORK ORDERS */}
        <div
          style={{
            marginTop: "35px",
            background: darkMode ? "#111827" : "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#2563eb",
                  marginBottom: "5px",
                }}
              >
                My Work Orders
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Work orders assigned to your technician account.
              </p>
            </div>

            <button
              onClick={loadWorkOrders}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#64748b",
              }}
            >
              Loading your work orders...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                background: darkMode ? "#450a0a" : "#fef2f2",
                color: "#dc2626",
                borderRadius: "10px",
              }}
            >
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && workOrders.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#64748b",
              }}
            >
              <h3>No work orders assigned</h3>

              <p>
                Work orders assigned to your technician account will appear
                here.
              </p>
            </div>
          )}

          {/* WORK ORDER LIST */}
          {!loading &&
            !error &&
            workOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                style={{
                  background: darkMode ? "#020617" : "#f8fafc",
                  padding: "22px",
                  marginTop: "20px",
                  borderRadius: "12px",
                  borderLeft: `5px solid ${getStatusColor(
                    workOrder.status
                  )}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
                      }}
                    >
                      {workOrder.code}
                    </h3>

                    <h3
                      style={{
                        color: "#2563eb",
                        marginTop: "5px",
                      }}
                    >
                      {workOrder.title}
                    </h3>

                    {workOrder.description && (
                      <p
                        style={{
                          color: "#64748b",
                          lineHeight: "1.5",
                        }}
                      >
                        {workOrder.description}
                      </p>
                    )}

                    <p>
                      <strong>Customer:</strong>{" "}
                      {getCustomerName(workOrder)}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {getLocation(workOrder)}
                    </p>

                    <p>
                      <strong>Priority:</strong>{" "}
                      <span
                        style={{
                          color: getPriorityColor(workOrder.priority),
                          fontWeight: "bold",
                        }}
                      >
                        {formatPriority(workOrder.priority)}
                      </span>
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color: getStatusColor(workOrder.status),
                          marginLeft: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {formatStatus(workOrder.status)}
                      </span>
                    </p>

                    <p>
                      <strong>Assigned Technician:</strong>{" "}
                      {getAssignedTechnician(workOrder)}
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        navigate(`/work-orders/${workOrder.id}`)
                      }
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

function MenuItem({
  text,
  onClick,
  active = false,
  darkMode,
}: {
  text: string;
  onClick: () => void;
  active?: boolean;
  darkMode: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "15px",
        marginTop: "10px",
        borderRadius: "10px",
        cursor: "pointer",
        background: active
          ? darkMode
            ? "#1e3a8a"
            : "#dbeafe"
          : "transparent",
        color: active
          ? "#2563eb"
          : darkMode
          ? "#e5e7eb"
          : "#334155",
        fontWeight: active ? "bold" : "normal",
      }}
    >
      {text}
    </div>
  );
}

function Card({
  title,
  value,
  darkMode,
}: {
  title: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#111827" : "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.12)",
      }}
    >
      <h3
        style={{
          color: darkMode ? "#e5e7eb" : "#334155",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color: "#2563eb",
          marginBottom: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
}