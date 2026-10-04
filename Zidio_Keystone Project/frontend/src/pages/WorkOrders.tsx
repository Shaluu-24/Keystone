
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api, WorkOrder } from "../api/client";

export default function WorkOrders() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<any>(
        "/work-orders",
        {
          params: {
            page: 0,
            size: 100,
          },
        }
      );

      const data = response.data;

      const actualOrders: WorkOrder[] =
        Array.isArray(data)
          ? data
          : data.content ?? [];

      setOrders(actualOrders);
    } catch (err) {
      console.error(
        "Work orders loading error:",
        err
      );

      setError(
        "Unable to load work orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) => {
      const searchValue =
        search.toLowerCase();

      const matchSearch =
        order.code
          ?.toLowerCase()
          .includes(searchValue) ||
        order.title
          ?.toLowerCase()
          .includes(searchValue) ||
        order.customerName
          ?.toLowerCase()
          .includes(searchValue) ||
        order.siteName
          ?.toLowerCase()
          .includes(searchValue);

      const matchStatus =
        filter === "ALL" ||
        order.status === filter;

      return (
        matchSearch && matchStatus
      );
    }
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode
          ? "#020617"
          : "#f8fafc",
        color: darkMode
          ? "white"
          : "#1e293b",
        padding: "35px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      {/* HEADER */}

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
              color: "#2563eb",
              marginBottom: "10px",
            }}
          >
            KEYSTONE
          </h1>

          <h2>
            Work Orders
          </h2>

          <p
            style={{
              color: darkMode
                ? "#94a3b8"
                : "#64748b",
            }}
          >
            Manage and monitor service
            requests
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={loadWorkOrders}
            style={{
              background: "#0f172a",
              color: "white",
              border:
                "1px solid #334155",
              padding:
                "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>

          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ← Back Dashboard
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <input
          placeholder="Search work orders, customer or site..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border:
              "1px solid #cbd5e1",
            background: darkMode
              ? "#111827"
              : "white",
            color: darkMode
              ? "white"
              : "black",
          }}
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          style={{
            padding: "12px",
            minWidth: "160px",
            borderRadius: "10px",
            background: darkMode
              ? "#111827"
              : "white",
            color: darkMode
              ? "white"
              : "black",
            border:
              "1px solid #cbd5e1",
          }}
        >
          <option value="ALL">
            All
          </option>

          <option value="NEW">
            New
          </option>

          <option value="ASSIGNED">
            Assigned
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="ON_HOLD">
            On Hold
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CLOSED">
            Closed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>
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

      {/* LOADING */}

      {loading && (
        <div
          style={{
            marginTop: "35px",
            background: darkMode
              ? "#111827"
              : "white",
            padding: "30px",
            borderRadius: "15px",
            color: "#94a3b8",
          }}
        >
          Loading work orders...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        filteredOrders.length === 0 && (
          <div
            style={{
              marginTop: "35px",
              background: darkMode
                ? "#111827"
                : "white",
              padding: "35px",
              borderRadius: "15px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <h3>
              No work orders found
            </h3>

            <p>
              There are currently no
              work orders in the backend
              database matching your
              search/filter.
            </p>
          </div>
        )}

      {/* WORK ORDERS */}

      {!loading &&
        filteredOrders.length > 0 && (
          <div
            style={{
              marginTop: "35px",
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "25px",
            }}
          >
            {filteredOrders.map(
              (order) => (
                <div
                  key={order.id}
                  style={{
                    background:
                      darkMode
                        ? "#111827"
                        : "white",
                    padding: "25px",
                    borderRadius:
                      "18px",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.25)",
                    borderTop:
                      "5px solid #2563eb",
                  }}
                >
                  {/* CODE */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                      }}
                    >
                      {order.code}
                    </h2>

                    <StatusBadge
                      status={
                        order.status
                      }
                    />
                  </div>

                  {/* SERVICE */}

                  <p
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    <b>Service:</b>{" "}
                    {order.title}
                  </p>

                  {/* CUSTOMER */}

                  <p>
                    <b>Customer:</b>{" "}
                    {order.customerName ||
                      "—"}
                  </p>

                  {/* LOCATION */}

                  <p>
                    <b>Location:</b>{" "}
                    {order.siteName ||
                      "—"}
                  </p>

                  {/* PRIORITY */}

                  <p>
                    <b>Priority:</b>

                    <span
                      style={{
                        marginLeft:
                          "8px",
                        fontWeight: 700,
                        color:
                          order.priority ===
                          "CRITICAL"
                            ? "#dc2626"
                            : order.priority ===
                              "HIGH"
                            ? "#ef4444"
                            : order.priority ===
                              "MEDIUM"
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    >
                      {order.priority}
                    </span>
                  </p>

                  {/* TECHNICIAN */}

                  <p>
                    <b>
                      Technician:
                    </b>{" "}
                    {order.assignedToName ||
                      "Not Assigned"}
                  </p>

                  {/* SLA */}

                  {order.slaDueAt && (
                    <p
                      style={{
                        color:
                          "#94a3b8",
                        fontSize:
                          "13px",
                      }}
                    >
                      <b>
                        SLA Due:
                      </b>{" "}
                      {formatDate(
                        order.slaDueAt
                      )}
                    </p>
                  )}

                  {/* VIEW */}

                  <button
                    onClick={() =>
                      navigate(
                        `/work-orders/${order.id}`
                      )
                    }
                    style={{
                      marginTop:
                        "15px",
                      width: "100%",
                      background:
                        "#2563eb",
                      color: "white",
                      border: "none",
                      padding:
                        "10px 18px",
                      borderRadius:
                        "8px",
                      cursor:
                        "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              )
            )}
          </div>
        )}
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
          "6px 10px",
        borderRadius:
          "20px",
        background:
          getStatusBackground(
            status
          ),
        color:
          getStatusColor(
            status
          ),
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace:
          "nowrap",
      }}
    >
      {status.replace(
        "_",
        " "
      )}
    </span>
  );
}

function getStatusBackground(
  status: WorkOrder["status"]
) {
  switch (status) {
    case "NEW":
      return "#1e3a8a";

    case "ASSIGNED":
      return "#3f2f0a";

    case "IN_PROGRESS":
      return "#172554";

    case "ON_HOLD":
      return "#422006";

    case "COMPLETED":
      return "#052e16";

    case "CLOSED":
      return "#14532d";

    case "CANCELLED":
      return "#450a0a";

    default:
      return "#1e293b";
  }
}

function getStatusColor(
  status: WorkOrder["status"]
) {
  switch (status) {
    case "NEW":
      return "#93c5fd";

    case "ASSIGNED":
      return "#fbbf24";

    case "IN_PROGRESS":
      return "#60a5fa";

    case "ON_HOLD":
      return "#fb923c";

    case "COMPLETED":
      return "#4ade80";

    case "CLOSED":
      return "#86efac";

    case "CANCELLED":
      return "#fca5a5";

    default:
      return "#cbd5e1";
  }
}

function formatDate(
  value: string
) {
  try {
    return new Date(
      value
    ).toLocaleString();
  } catch {
    return value;
  }
}

