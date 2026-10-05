
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { api, WorkOrder } from "../api/client";

export default function WorkOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  async function loadWorkOrder() {
    try {
      setLoading(true);
      setError("");

      if (!id) {
        setError("Work order ID is missing.");
        return;
      }

      /*
       * Backend expects numeric database ID:
       * GET /api/work-orders/8
       *
       * But some existing navigation may send:
       * /work-orders/WO-00008
       *
       * So first resolve WO-xxxxx to the real numeric ID.
       */

      let numericId = id;

      if (!/^\d+$/.test(id)) {
        const listResponse = await api.get("/work-orders", {
          params: {
            page: 0,
            size: 50,
          },
        });

        const data = listResponse.data;

        const workOrders: WorkOrder[] = Array.isArray(data)
          ? data
          : data.content ?? [];

        const matchedWorkOrder = workOrders.find(
          (workOrder: WorkOrder) =>
            workOrder.code === id
        );

        if (!matchedWorkOrder) {
          setError(`Work order ${id} was not found.`);
          return;
        }

        numericId = String(matchedWorkOrder.id);
      }

      const response = await api.get(
        `/work-orders/${numericId}`
      );

      setWorkOrder(response.data);
    } catch (err: any) {
      console.error("Work order loading error:", err);

      if (err?.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load work order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkOrder();
  }, [id]);

  async function updateStatus(
    toStatus: "IN_PROGRESS" | "COMPLETED"
  ) {
    if (!workOrder) return;

    try {
      setUpdating(true);
      setError("");

      await api.post(
        `/work-orders/${workOrder.id}/status`,
        {
          toStatus,
          note:
            toStatus === "IN_PROGRESS"
              ? "Work started by technician."
              : "Work order completed successfully.",
        }
      );

      await loadWorkOrder();

      alert(
        toStatus === "IN_PROGRESS"
          ? "Work order started successfully."
          : "Work order marked as completed."
      );
    } catch (err: any) {
      console.error("Status update error:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to update work order status."
      );
    } finally {
      setUpdating(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
      case "CLOSED":
        return "#22c55e";

      case "IN_PROGRESS":
        return "#f59e0b";

      case "ASSIGNED":
        return "#8b5cf6";

      case "CANCELLED":
        return "#ef4444";

      case "ON_HOLD":
        return "#f97316";

      default:
        return "#3b82f6";
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "CRITICAL":
        return "#dc2626";

      case "HIGH":
        return "#ef4444";

      case "MEDIUM":
        return "#f59e0b";

      default:
        return "#22c55e";
    }
  }

  function formatStatus(status: string) {
    return status.replace(/_/g, " ");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: darkMode ? "#020617" : "#f1f5f9",
          color: darkMode ? "white" : "#1e293b",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ color: "#2563eb" }}>
          KEYSTONE
        </h1>

        <div
          style={{
            background: darkMode ? "#111827" : "white",
            padding: "30px",
            borderRadius: "16px",
          }}
        >
          Loading work order...
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: darkMode ? "#020617" : "#f1f5f9",
          color: darkMode ? "white" : "#1e293b",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ color: "#2563eb" }}>
          KEYSTONE
        </h1>

        <div
          style={{
            background: darkMode ? "#3f1d1d" : "#fee2e2",
            color: darkMode ? "#fecaca" : "#991b1b",
            padding: "25px",
            borderRadius: "15px",
          }}
        >
          <h2>Unable to load work order</h2>

          <p>
            {error || "Work order was not found."}
          </p>

          <button
            onClick={() => navigate("/work-orders")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ← Back Work Orders
          </button>
        </div>
      </div>
    );
  }

  const canStart =
    workOrder.status === "ASSIGNED";

  const canComplete =
    workOrder.status === "IN_PROGRESS";

  const canAssign =
    workOrder.status === "NEW" ||
    workOrder.status === "ASSIGNED";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#f1f5f9",
        color: darkMode ? "white" : "#1e293b",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              color: "#2563eb",
              margin: 0,
            }}
          >
            KEYSTONE
          </h1>

          <p
            style={{
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
          >
            Field Service Management Platform
          </p>
        </div>

        <button
          onClick={() => navigate("/work-orders")}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ← Back Work Orders
        </button>
      </div>

      {/* DETAILS */}

      <div
        style={{
          marginTop: "35px",
          background: darkMode ? "#111827" : "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2>Work Order Details</h2>

            <p
              style={{
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              {workOrder.code}
            </p>
          </div>

          <span
            style={{
              color: getStatusColor(workOrder.status),
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {formatStatus(workOrder.status)}
          </span>
        </div>

        {/* WORK ORDER INFORMATION */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          <InfoCard
            title="Work Order ID"
            value={workOrder.code}
            darkMode={darkMode}
          />

          <InfoCard
            title="Service"
            value={workOrder.title}
            darkMode={darkMode}
          />

          <InfoCard
            title="Customer"
            value={workOrder.customerName}
            darkMode={darkMode}
          />

          <InfoCard
            title="Location"
            value={workOrder.siteName}
            darkMode={darkMode}
          />

          <InfoCard
            title="Technician"
            value={
              workOrder.assignedToName ||
              "Not assigned"
            }
            darkMode={darkMode}
          />

          <InfoCard
            title="Priority"
            value={workOrder.priority}
            darkMode={darkMode}
            valueColor={getPriorityColor(
              workOrder.priority
            )}
          />

          <InfoCard
            title="Status"
            value={formatStatus(workOrder.status)}
            darkMode={darkMode}
            valueColor={getStatusColor(
              workOrder.status
            )}
          />

          <InfoCard
            title="SLA Due"
            value={
              workOrder.slaDueAt
                ? new Date(
                    workOrder.slaDueAt
                  ).toLocaleString()
                : "Not set"
            }
            darkMode={darkMode}
          />
        </div>

        {/* DESCRIPTION */}

        <div style={{ marginTop: "30px" }}>
          <h3>Description</h3>

          <p
            style={{
              color: darkMode ? "#94a3b8" : "#64748b",
              lineHeight: "1.6",
            }}
          >
            {workOrder.description ||
              "No description provided."}
          </p>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          {/* START WORK */}

          {canStart && (
            <button
              onClick={() =>
                updateStatus("IN_PROGRESS")
              }
              disabled={updating}
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "10px",
                cursor: updating
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {updating
                ? "Updating..."
                : "Start Work"}
            </button>
          )}

          {/* MARK COMPLETED */}

          {canComplete && (
            <button
              onClick={() =>
                updateStatus("COMPLETED")
              }
              disabled={updating}
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "10px",
                cursor: updating
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {updating
                ? "Updating..."
                : "Mark Completed"}
            </button>
          )}

          {/* ASSIGN / REASSIGN */}

          {canAssign && (
            <button
              onClick={() =>
                navigate(
                  `/work-orders/${workOrder.id}/assign`
                )
              }
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              {workOrder.status === "ASSIGNED"
                ? "Reassign Technician"
                : "Assign Technician"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  darkMode,
  valueColor,
}: {
  title: string;
  value: string;
  darkMode: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        padding: "20px",
        borderRadius: "15px",
        borderLeft: "4px solid #2563eb",
      }}
    >
      <h4
        style={{
          color: "#64748b",
          margin: 0,
        }}
      >
        {title}
      </h4>

      <h3
        style={{
          marginTop: "10px",
          color: valueColor,
        }}
      >
        {value}
      </h3>
    </div>
  );
}
