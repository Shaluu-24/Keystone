
import { useEffect, useMemo, useState } from "react";
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
  status: string;
  assignedTo?: {
    id?: number;
    name?: string;
  };
};

type TechnicianView = Technician & {
  assignedJobs: number;
  activeJobs: number;
};

export default function Technicians() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const [techniciansResponse, workOrdersResponse] =
        await Promise.all([
          api.get<Technician[]>("/users/technicians"),
          api.get<any>("/work-orders", {
            params: {
              page: 0,
              size: 500,
            },
          }),
        ]);

      const workOrderData = workOrdersResponse.data;

      setTechnicians(techniciansResponse.data || []);

      if (Array.isArray(workOrderData)) {
        setWorkOrders(workOrderData);
      } else {
        setWorkOrders(workOrderData.content || []);
      }
    } catch (err: any) {
      console.error("Failed to load technicians:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("keystone_token");
        localStorage.removeItem("keystone_user");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view technician management."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load technician information."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const technicianData = useMemo<TechnicianView[]>(() => {
    return technicians.map((technician) => {
      const technicianOrders = workOrders.filter(
        (workOrder) =>
          workOrder.assignedTo?.id === technician.id
      );

      const activeJobs = technicianOrders.filter(
        (workOrder) =>
          workOrder.status === "ASSIGNED" ||
          workOrder.status === "IN_PROGRESS" ||
          workOrder.status === "ON_HOLD"
      );

      return {
        ...technician,
        assignedJobs: technicianOrders.length,
        activeJobs: activeJobs.length,
      };
    });
  }, [technicians, workOrders]);

  const availableCount = technicianData.filter(
    (technician) => technician.activeJobs === 0
  ).length;

  const activeJobCount = technicianData.reduce(
    (total, technician) => total + technician.activeJobs,
    0
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const getStatus = (technician: TechnicianView) => {
    if (technician.activeJobs > 0) {
      return "BUSY";
    }

    return "AVAILABLE";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BUSY":
        return "#dc2626";

      case "AVAILABLE":
        return "#16a34a";

      default:
        return "#64748b";
    }
  };

  const pageBackground = darkMode ? "#020617" : "#f1f5f9";
  const cardBackground = darkMode ? "#111827" : "#ffffff";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const secondaryText = darkMode ? "#94a3b8" : "#64748b";
  const borderColor = darkMode ? "#1f2937" : "#e2e8f0";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: textColor,
        padding: "35px",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          <div>
            <div
              style={{
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              KEYSTONE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
              }}
            >
              Technician Management
            </h1>

            <p
              style={{
                color: secondaryText,
                marginTop: "8px",
                marginBottom: 0,
              }}
            >
              Manage technician availability, workload and
              assignments.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "11px 18px",
                borderRadius: "9px",
                cursor: refreshing
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 700,
              }}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                background: cardBackground,
                color: textColor,
                border: `1px solid ${borderColor}`,
                padding: "11px 18px",
                borderRadius: "9px",
                cursor: "pointer",
                fontWeight: 650,
              }}
            >
              ← Back Dashboard
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: darkMode ? "#450a0a" : "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          <StatCard
            title="Total Technicians"
            value={loading ? "..." : String(technicians.length)}
            description="Registered technician accounts"
            darkMode={darkMode}
          />

          <StatCard
            title="Available"
            value={loading ? "..." : String(availableCount)}
            description="No active work orders"
            darkMode={darkMode}
            valueColor="#16a34a"
          />

          <StatCard
            title="Active Jobs"
            value={loading ? "..." : String(activeJobCount)}
            description="Currently assigned or in progress"
            darkMode={darkMode}
            valueColor="#f59e0b"
          />
        </div>

        {/* TECHNICIAN LIST */}
        <section
          style={{
            background: cardBackground,
            border: `1px solid ${borderColor}`,
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
              }}
            >
              Technician List
            </h2>

            <p
              style={{
                color: secondaryText,
                marginTop: "6px",
              }}
            >
              Live technician accounts and workload from
              KEYSTONE data.
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "55px 20px",
                color: secondaryText,
              }}
            >
              Loading technicians...
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            technicianData.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "55px 20px",
                  color: secondaryText,
                }}
              >
                <h3>No technicians found</h3>

                <p>
                  Technician accounts will appear here once
                  they are registered in KEYSTONE.
                </p>
              </div>
            )}

          {/* LIST */}
          {!loading &&
            !error &&
            technicianData.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {technicianData.map((technician) => {
                  const status = getStatus(technician);

                  return (
                    <div
                      key={technician.id}
                      style={{
                        background: darkMode
                          ? "#020617"
                          : "#f8fafc",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "15px",
                        padding: "22px",
                      }}
                    >
                      {/* NAME + STATUS */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "18px",
                            }}
                          >
                            {technician.name}
                          </h3>

                          <p
                            style={{
                              color: secondaryText,
                              marginTop: "6px",
                              marginBottom: 0,
                              fontSize: "13px",
                            }}
                          >
                            {technician.email}
                          </p>
                        </div>

                        <span
                          style={{
                            background:
                              status === "BUSY"
                                ? darkMode
                                  ? "#450a0a"
                                  : "#fef2f2"
                                : darkMode
                                ? "#052e16"
                                : "#f0fdf4",
                            color: getStatusColor(status),
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status}
                        </span>
                      </div>

                      {/* ROLE */}
                      <div
                        style={{
                          marginTop: "22px",
                          padding: "14px",
                          background: darkMode
                            ? "#111827"
                            : "#ffffff",
                          borderRadius: "10px",
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <div
                          style={{
                            color: secondaryText,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontWeight: 700,
                          }}
                        >
                          Role
                        </div>

                        <div
                          style={{
                            marginTop: "5px",
                            fontWeight: 650,
                          }}
                        >
                          {technician.role}
                        </div>
                      </div>

                      {/* WORKLOAD */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          marginTop: "14px",
                        }}
                      >
                        <Metric
                          label="Assigned Jobs"
                          value={String(
                            technician.assignedJobs
                          )}
                          darkMode={darkMode}
                        />

                        <Metric
                          label="Active Jobs"
                          value={String(
                            technician.activeJobs
                          )}
                          darkMode={darkMode}
                        />
                      </div>

                      {/* ACTION */}
                      <button
                        onClick={() =>
                          navigate(
                            `/technicians/${technician.id}`
                          )
                        }
                        style={{
                          width: "100%",
                          marginTop: "18px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "11px",
                          borderRadius: "9px",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  darkMode,
  valueColor,
}: {
  title: string;
  value: string;
  description: string;
  darkMode: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#111827" : "#ffffff",
        border: darkMode
          ? "1px solid #1f2937"
          : "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "23px",
        boxShadow: "0 5px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          color: darkMode ? "#94a3b8" : "#64748b",
          fontSize: "13px",
          fontWeight: 650,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: 750,
          marginTop: "8px",
          color: valueColor || "#2563eb",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: darkMode ? "#64748b" : "#94a3b8",
          fontSize: "12px",
          marginTop: "4px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#111827" : "#ffffff",
        border: darkMode
          ? "1px solid #1f2937"
          : "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "13px",
      }}
    >
      <div
        style={{
          color: darkMode ? "#64748b" : "#94a3b8",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "20px",
          fontWeight: 750,
          color: darkMode ? "#f8fafc" : "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}
