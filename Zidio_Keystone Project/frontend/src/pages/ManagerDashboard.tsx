
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  api,
  ManagerDashboardSummary,
  WorkOrder,
} from "../api/client";

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState<ManagerDashboardSummary | null>(null);

  const [workOrders, setWorkOrders] =
    useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, workOrdersResponse] =
        await Promise.all([
          api.get<ManagerDashboardSummary>(
            "/manager/dashboard/summary"
          ),
          api.get<any>("/work-orders", {
            params: {
              page: 0,
              size: 50,
            },
          }),
        ]);

      setSummary(summaryResponse.data);

      const data = workOrdersResponse.data;

      const orders =
        Array.isArray(data)
          ? data
          : data.content ?? [];

      setWorkOrders(orders);
    } catch (err) {
      console.error(
        "Manager dashboard error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalWorkOrders =
    summary?.total ??
    workOrders.length;

  const pendingJobs =
    summary
      ? summary.assigned +
        summary.inProgress +
        summary.onHold
      : 0;

  const completedJobs =
    summary
      ? summary.completed +
        summary.closed
      : 0;

  const newRequests =
    summary?.newOrders ?? 0;

  const assignedJobs =
    summary?.assigned ?? 0;

  const inProgressJobs =
    summary?.inProgress ?? 0;

  const activeJobs =
    assignedJobs +
    inProgressJobs;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* SIDEBAR */}

      <aside
        style={{
          width: "260px",
          background: "#0f172a",
          padding: "25px",
          borderRight:
            "1px solid #1e293b",
        }}
      >
        <h1
          style={{
            color: "#3b82f6",
            marginBottom: "35px",
          }}
        >
          KEYSTONE
        </h1>

        <Menu
          title="▦ Dashboard"
          click={() => navigate("/")}
        />

        <Menu
          title="▤ Work Orders"
          click={() =>
            navigate("/work-orders")
          }
        />

        <Menu
          title="⌘ Service Requests"
          click={() =>
            navigate("/service-requests")
          }
        />

        <Menu
          title="⚙ Technicians"
          click={() =>
            navigate("/technicians")
          }
        />

        <Menu
          title="♙ Customers"
          click={() =>
            navigate("/customers")
          }
        />

        <Menu
          title="▣ Reports"
          click={() =>
            navigate("/reports")
          }
        />

        <Menu
          title="◫ Analytics"
          click={() =>
            navigate("/analytics")
          }
        />

        <Menu
          title="◉ Notifications"
          click={() =>
            navigate("/notifications")
          }
        />

        <Menu
          title="⚙ Settings"
          click={() =>
            navigate("/settings")
          }
        />

        <button
          onClick={logout}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "12px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ⇥ Logout
        </button>
      </aside>

      {/* MAIN */}

      <main
        style={{
          flex: 1,
          padding: "35px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                color: "#3b82f6",
                marginBottom: "10px",
              }}
            >
              Manager Dashboard
            </h1>

            <p
              style={{
                marginTop: "15px",
                color: "#cbd5e1",
                fontSize: "18px",
              }}
            >
              Welcome{" "}
              {user?.name || "Manager"}
            </p>

            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Monitor customer requests
              and manage field service
              operations.
            </p>
          </div>

          <div
            style={{
              background: "#0f172a",
              border:
                "1px solid #1e293b",
              borderRadius: "12px",
              padding: "12px 18px",
              color: "#94a3b8",
            }}
          >
            ● Dashboard
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#450a0a",
              border:
                "1px solid #991b1b",
              borderRadius: "10px",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* KPI CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "20px",
            marginTop: "35px",
          }}
        >
          <Card
            title="Total Work Orders"
            value={
              loading
                ? "..."
                : String(
                    totalWorkOrders
                  )
            }
          />

          <Card
            title="Pending Jobs"
            value={
              loading
                ? "..."
                : String(pendingJobs)
            }
          />

          <Card
            title="Completed Jobs"
            value={
              loading
                ? "..."
                : String(
                    completedJobs
                  )
            }
          />

          <Card
            title="New Requests"
            value={
              loading
                ? "..."
                : String(newRequests)
            }
          />
        </div>

        {/* STATUS OVERVIEW */}

        <h2
          style={{
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          Work Order Status
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          <StatusCard
            title="New"
            value={
              loading
                ? "..."
                : String(
                    summary?.newOrders ?? 0
                  )
            }
          />

          <StatusCard
            title="Assigned"
            value={
              loading
                ? "..."
                : String(
                    summary?.assigned ?? 0
                  )
            }
          />

          <StatusCard
            title="In Progress"
            value={
              loading
                ? "..."
                : String(
                    summary?.inProgress ?? 0
                  )
            }
          />

          <StatusCard
            title="On Hold"
            value={
              loading
                ? "..."
                : String(
                    summary?.onHold ?? 0
                  )
            }
          />

          <StatusCard
            title="Completed"
            value={
              loading
                ? "..."
                : String(
                    summary?.completed ?? 0
                  )
            }
          />

          <StatusCard
            title="Closed"
            value={
              loading
                ? "..."
                : String(
                    summary?.closed ?? 0
                  )
            }
          />

          <StatusCard
            title="Cancelled"
            value={
              loading
                ? "..."
                : String(
                    summary?.cancelled ?? 0
                  )
            }
          />

          <StatusCard
            title="Active Jobs"
            value={
              loading
                ? "..."
                : String(activeJobs)
            }
          />
        </div>

        {/* ACTUAL WORK ORDERS */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginTop: "40px",
          }}
        >
          <h2>
            Work Orders
          </h2>

          <button
            onClick={loadDashboard}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div
            style={{
              marginTop: "20px",
              background: "#111827",
              padding: "25px",
              borderRadius: "12px",
              color: "#94a3b8",
            }}
          >
            Loading work orders...
          </div>
        ) : workOrders.length === 0 ? (
          <div
            style={{
              marginTop: "20px",
              background: "#111827",
              padding: "25px",
              borderRadius: "12px",
              color: "#94a3b8",
            }}
          >
            No work orders found.
          </div>
        ) : (
          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gap: "15px",
            }}
          >
            {workOrders.map(
              (order) => (
                <div
                  key={order.id}
                  style={{
                    background:
                      "#111827",
                    border:
                      "1px solid #1e293b",
                    borderRadius:
                      "14px",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          color:
                            "#3b82f6",
                          margin:
                            "0 0 8px 0",
                        }}
                      >
                        {order.code}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "18px",
                        }}
                      >
                        {order.title}
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        order.status
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, minmax(0, 1fr))",
                      gap: "15px",
                      marginTop:
                        "20px",
                    }}
                  >
                    <Info
                      label="Customer"
                      value={
                        order.customerName
                      }
                    />

                    <Info
                      label="Site"
                      value={
                        order.siteName
                      }
                    />

                    <Info
                      label="Priority"
                      value={
                        order.priority
                      }
                    />

                    <Info
                      label="Assigned Technician"
                      value={
                        order.assignedToName ||
                        "Not Assigned"
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      marginTop:
                        "20px",
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/work-orders/${order.id}`
                        )
                      }
                      style={{
                        background:
                          "#2563eb",
                        color: "white",
                        border:
                          "none",
                        padding:
                          "10px 18px",
                        borderRadius:
                          "8px",
                        cursor:
                          "pointer",
                      }}
                    >
                      View Work Order
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* SIDEBAR MENU */

function Menu({
  title,
  click,
}: {
  title: string;
  click: () => void;
}) {
  return (
    <button
      onClick={click}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background:
          "transparent",
        color: "#cbd5e1",
        border: "none",
        padding:
          "12px 10px",
        marginBottom: "8px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "#1e293b";
        e.currentTarget.style.color =
          "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "transparent";
        e.currentTarget.style.color =
          "#cbd5e1";
      }}
    >
      {title}
    </button>
  );
}

/* MAIN KPI CARD */

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border:
          "1px solid #1e293b",
        borderRadius: "15px",
        padding: "22px",
        minHeight: "95px",
      }}
    >
      <p
        style={{
          color: "#94a3b8",
          margin: 0,
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          color: "#3b82f6",
          marginTop: "12px",
          marginBottom: 0,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

/* STATUS CARD */

function StatusCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        border:
          "1px solid #1e293b",
        borderRadius: "12px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
        }}
      >
        <span
          style={{
            color: "#cbd5e1",
            fontSize: "14px",
          }}
        >
          {title}
        </span>

        <strong
          style={{
            color: "#60a5fa",
            fontSize: "20px",
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

/* INFO */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#e2e8f0",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* STATUS BADGE */

function StatusBadge({
  status,
}: {
  status: WorkOrder["status"];
}) {
  return (
    <span
      style={{
        padding:
          "6px 12px",
        borderRadius: "20px",
        background:
          "#1e3a8a",
        color: "#bfdbfe",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {status}
    </span>
  );
}

