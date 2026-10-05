
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api, WorkOrder } from "../api/client";

type ServiceRequest = {
  id: number;
  serviceType: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  photoUrl?: string | null;
  customer?: {
    id?: number;
    name?: string;
  };
  site?: {
    id?: number;
    name?: string;
    address?: string;
  };
};

type ServiceRequestPage = {
  content: ServiceRequest[];
  totalElements: number;
};

type WorkOrderWithServiceRequest = WorkOrder & {
  serviceRequestId?: number | null;
};

export default function ServiceRequests() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [requests, setRequests] = useState<WorkOrderWithServiceRequest[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("MEDIUM");
  const [customerId, setCustomerId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [slaDueAt, setSlaDueAt] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const [workOrderResponse, serviceRequestResponse] =
        await Promise.all([
          api.get("/work-orders?page=0&size=100"),
          api.get<ServiceRequestPage | ServiceRequest[]>(
            "/service-requests?page=0&size=100"
          ),
        ]);

      const workOrderData = workOrderResponse.data;

      setRequests(
        Array.isArray(workOrderData)
          ? workOrderData
          : workOrderData.content ?? []
      );

      const serviceRequestData = serviceRequestResponse.data;

      setServiceRequests(
        Array.isArray(serviceRequestData)
          ? serviceRequestData
          : serviceRequestData.content ?? []
      );
    } catch (err) {
      console.error("Service requests loading error:", err);
      setError("Unable to load service requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function createWorkOrder(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter the service title.");
      return;
    }

    if (!customerId.trim()) {
      alert("Please enter Customer ID.");
      return;
    }

    if (!siteId.trim()) {
      alert("Please enter Site ID.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/work-orders", {
        title: title.trim(),
        description: description.trim(),
        priority,
        customerId: Number(customerId),
        siteId: Number(siteId),
        slaDueAt: slaDueAt
          ? new Date(slaDueAt).toISOString()
          : null,
      });

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCustomerId("");
      setSiteId("");
      setSlaDueAt("");
      setShowForm(false);

      await loadRequests();

      alert("Work order created successfully.");
    } catch (err: any) {
      console.error("Work order creation error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to create work order.";

      setError(message);
    } finally {
      setCreating(false);
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

  /*
   * Stable matching only.
   *
   * WorkOrder.serviceRequestId comes from the backend.
   * ServiceRequest.id is the original customer request ID.
   *
   * No customer/site/title/description fuzzy matching is used.
   */
  function findServiceRequest(
    workOrder: WorkOrderWithServiceRequest
  ) {
    if (!workOrder.serviceRequestId) {
      return undefined;
    }

    return serviceRequests.find(
      (request) => request.id === workOrder.serviceRequestId
    );
  }

  function getImageUrl(photoUrl?: string | null) {
    if (!photoUrl) {
      return "";
    }

    if (
      photoUrl.startsWith("http://") ||
      photoUrl.startsWith("https://")
    ) {
      return photoUrl;
    }

    const baseURL =
      api.defaults.baseURL || "http://localhost:8080/api";

    const backendBaseURL = baseURL.replace(/\/api\/?$/, "");

    return `${backendBaseURL}${
      photoUrl.startsWith("/") ? "" : "/"
    }${photoUrl}`;
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: darkMode
      ? "1px solid #334155"
      : "1px solid #cbd5e1",
    background: darkMode ? "#020617" : "white",
    color: darkMode ? "white" : "#1e293b",
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
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
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

          <h2 style={{ marginBottom: "5px" }}>
            Service Requests
          </h2>

          <p
            style={{
              color: darkMode ? "#94a3b8" : "#64748b",
              marginTop: 0,
            }}
          >
            Manage customer service requests and work order status
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {showForm ? "✕ Close" : "+ New Service Request"}
          </button>

          <button
            onClick={loadRequests}
            style={{
              background: darkMode ? "#1e293b" : "#e2e8f0",
              color: darkMode ? "white" : "#1e293b",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: darkMode ? "#1e293b" : "#e2e8f0",
              color: darkMode ? "white" : "#1e293b",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ← Back Dashboard
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <form
          onSubmit={createWorkOrder}
          style={{
            background: darkMode ? "#111827" : "white",
            padding: "30px",
            borderRadius: "18px",
            marginBottom: "30px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#2563eb",
            }}
          >
            Create New Work Order
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            <label>
              Service / Title

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="SA Installation"
                style={inputStyle}
              />
            </label>

            <label>
              Priority

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as
                      | "LOW"
                      | "MEDIUM"
                      | "HIGH"
                      | "CRITICAL"
                  )
                }
                style={inputStyle}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>

            <label>
              Customer ID

              <input
                type="number"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="1"
                style={inputStyle}
              />
            </label>

            <label>
              Site ID

              <input
                type="number"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                placeholder="1"
                style={inputStyle}
              />
            </label>

            <label>
              SLA Due Date & Time

              <input
                type="datetime-local"
                value={slaDueAt}
                onChange={(e) => setSlaDueAt(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <label
            style={{
              display: "block",
              marginTop: "20px",
            }}
          >
            Description / Customer Issue

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the customer problem..."
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              disabled={creating}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "13px 25px",
                borderRadius: "10px",
                cursor: creating ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {creating ? "Creating..." : "Create Work Order"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: darkMode ? "#334155" : "#e2e8f0",
                color: darkMode ? "white" : "#1e293b",
                border: "none",
                padding: "13px 25px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: darkMode ? "#3f1d1d" : "#fee2e2",
            color: darkMode ? "#fecaca" : "#991b1b",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          style={{
            background: darkMode ? "#111827" : "white",
            padding: "30px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          Loading service requests...
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && requests.length === 0 && (
        <div
          style={{
            background: darkMode ? "#111827" : "white",
            padding: "50px 30px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          <h2>No service requests found</h2>

          <p
            style={{
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
          >
            There are currently no work orders in the backend database.
          </p>

          <button
            onClick={() => setShowForm(true)}
            style={{
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            + Create First Work Order
          </button>
        </div>
      )}

      {/* WORK ORDERS */}
      {!loading &&
        requests.map((req) => {
          const matchingRequest = findServiceRequest(req);
          const imageUrl = getImageUrl(matchingRequest?.photoUrl);

          return (
            <div
              key={req.id}
              style={{
                background: darkMode ? "#111827" : "white",
                padding: "25px",
                marginTop: "20px",
                borderRadius: "18px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                borderLeft: "5px solid #2563eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: 0 }}>{req.code}</h2>

                <span
                  style={{
                    color: getStatusColor(req.status),
                    fontWeight: 700,
                  }}
                >
                  {formatStatus(req.status)}
                </span>
              </div>

              <h3>{req.title}</h3>

              <p>
                <b>Customer:</b> {req.customerName}
              </p>

              <p>
                <b>Location:</b> {req.siteName}
              </p>

              {req.description && (
                <p>
                  <b>Issue:</b> {req.description}
                </p>
              )}

              <p>
                <b>Priority:</b>{" "}
                <span
                  style={{
                    color: getPriorityColor(req.priority),
                    fontWeight: 700,
                  }}
                >
                  {req.priority}
                </span>
              </p>

              <p>
                <b>Technician:</b>{" "}
                {req.assignedToName || "Not assigned"}
              </p>

              {req.slaDueAt && (
                <p>
                  <b>SLA Due:</b>{" "}
                  {new Date(req.slaDueAt).toLocaleString()}
                </p>
              )}

              {/* CUSTOMER UPLOADED IMAGE */}
              {imageUrl && (
                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "20px",
                    borderTop: darkMode
                      ? "1px solid #334155"
                      : "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#2563eb",
                    }}
                  >
                    Issue Photo
                  </h3>

                  <img
                    src={imageUrl}
                    alt="Customer uploaded issue"
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: "500px",
                      maxHeight: "360px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      border: darkMode
                        ? "1px solid #334155"
                        : "1px solid #cbd5e1",
                      background: darkMode
                        ? "#020617"
                        : "#f8fafc",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/work-orders/${req.id}`)
                  }
                  style={{
                    background: darkMode
                      ? "#1e293b"
                      : "#e2e8f0",
                    color: darkMode ? "white" : "#1e293b",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>

                {req.status === "NEW" && (
                  <button
                    onClick={() =>
                      navigate(`/work-orders/${req.id}/assign`)
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
                    Assign Technician
                  </button>
                )}

                {req.status === "ASSIGNED" && (
                  <button
                    onClick={() =>
                      navigate(`/work-orders/${req.id}/assign`)
                    }
                    style={{
                      background: "#7c3aed",
                      color: "white",
                      border: "none",
                      padding: "12px 25px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Reassign Technician
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
