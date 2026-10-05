
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WorkOrder = {
  id: number;
  code: string;
  title: string;
  description?: string;
  priority?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  slaDueAt?: string;

  customer?: {
    id?: number;
    name?: string;
  };

  customerName?: string;

  site?: {
    id?: number;
    name?: string;
    address?: string;
  };

  siteName?: string;

  assignedTo?: {
    id?: number;
    name?: string;
    email?: string;
  };

  assignedToName?: string;
};

type WorkOrderResponse = {
  content?: WorkOrder[];
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#2563eb",
  ASSIGNED: "#f59e0b",
  IN_PROGRESS: "#8b5cf6",
  ON_HOLD: "#64748b",
  COMPLETED: "#16a34a",
  CLOSED: "#0f766e",
  CANCELLED: "#dc2626",
};

export default function Reports() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<
        WorkOrderResponse | WorkOrder[]
      >("/work-orders", {
        params: {
          page: 0,
          size: 500,
        },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setWorkOrders(data);
      } else {
        setWorkOrders(data.content ?? []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Unable to load live report data.");
    } finally {
      setLoading(false);
    }
  };

  const totalWorkOrders = workOrders.length;

  const completedJobs = workOrders.filter(
    (order) =>
      order.status === "COMPLETED" ||
      order.status === "CLOSED"
  ).length;

  const pendingJobs = workOrders.filter(
    (order) =>
      order.status !== "COMPLETED" &&
      order.status !== "CLOSED" &&
      order.status !== "CANCELLED"
  ).length;

  const completionRate =
    totalWorkOrders > 0
      ? Math.round(
          (completedJobs / totalWorkOrders) * 100
        )
      : 0;

  /*
   * STATUS DISTRIBUTION
   */
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};

    workOrders.forEach((order) => {
      const status = order.status || "UNKNOWN";

      map[status] = (map[status] || 0) + 1;
    });

    return Object.entries(map).map(([status, value]) => ({
      status,
      name: status.replace(/_/g, " "),
      value,
    }));
  }, [workOrders]);

  /*
   * TECHNICIAN PERFORMANCE
   *
   * Only actual assigned technician data is included.
   */
  const technicianData = useMemo(() => {
    const map: Record<
      string,
      {
        assigned: number;
        completed: number;
      }
    > = {};

    workOrders.forEach((order) => {
      const technician =
        order.assignedTo?.name ||
        order.assignedToName;

      if (!technician) return;

      if (!map[technician]) {
        map[technician] = {
          assigned: 0,
          completed: 0,
        };
      }

      map[technician].assigned += 1;

      if (
        order.status === "COMPLETED" ||
        order.status === "CLOSED"
      ) {
        map[technician].completed += 1;
      }
    });

    return Object.entries(map)
      .map(([technician, values]) => ({
        technician,
        assigned: values.assigned,
        completed: values.completed,
      }))
      .sort((a, b) => b.assigned - a.assigned);
  }, [workOrders]);

  /*
   * MONTHLY REPORT
   */
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};

    workOrders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, requests]) => {
        const [year, month] = key.split("-");

        const label = new Date(
          Number(year),
          Number(month) - 1
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        return {
          month: label,
          requests,
        };
      });
  }, [workOrders]);

  /*
   * LOCATION REPORT
   *
   * Never create "Unknown".
   */
  const locationData = useMemo(() => {
    const map: Record<string, number> = {};

    workOrders.forEach((order) => {
      const location =
        order.site?.name ||
        order.site?.address ||
        order.siteName;

      if (!location) return;

      map[location] = (map[location] || 0) + 1;
    });

    return Object.entries(map)
      .map(([location, requests]) => ({
        location,
        requests,
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [workOrders]);

  /*
   * CUSTOMER REPORT
   *
   * Only actual customer information.
   */
  const customerData = useMemo(() => {
    const map: Record<string, number> = {};

    workOrders.forEach((order) => {
      const customer =
        order.customer?.name ||
        order.customerName;

      if (!customer) return;

      map[customer] = (map[customer] || 0) + 1;
    });

    return Object.entries(map)
      .map(([customer, requests]) => ({
        customer,
        requests,
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [workOrders]);

  /*
   * SLA COMPLIANCE
   *
   * Only work orders with SLA due time are evaluated.
   */
  const slaStats = useMemo(() => {
    const eligibleOrders = workOrders.filter(
      (order) =>
        order.slaDueAt &&
        (order.updatedAt || order.createdAt)
    );

    if (eligibleOrders.length === 0) {
      return {
        percentage: null,
        evaluated: 0,
      };
    }

    let compliant = 0;

    eligibleOrders.forEach((order) => {
      const due = new Date(order.slaDueAt!);

      const completedAt = new Date(
        order.updatedAt || order.createdAt!
      );

      if (
        !Number.isNaN(due.getTime()) &&
        !Number.isNaN(completedAt.getTime()) &&
        completedAt.getTime() <= due.getTime()
      ) {
        compliant += 1;
      }
    });

    return {
      percentage: Math.round(
        (compliant / eligibleOrders.length) * 100
      ),
      evaluated: eligibleOrders.length,
    };
  }, [workOrders]);

  /*
   * AVERAGE RESPONSE TIME
   */
  const averageResponseHours = useMemo(() => {
    const eligible = workOrders.filter(
      (order) =>
        order.createdAt &&
        order.updatedAt
    );

    if (eligible.length === 0) return null;

    let totalHours = 0;
    let count = 0;

    eligible.forEach((order) => {
      const created = new Date(order.createdAt!);
      const updated = new Date(order.updatedAt!);

      if (
        Number.isNaN(created.getTime()) ||
        Number.isNaN(updated.getTime())
      ) {
        return;
      }

      const hours =
        (updated.getTime() - created.getTime()) /
        (1000 * 60 * 60);

      if (hours >= 0) {
        totalHours += hours;
        count += 1;
      }
    });

    if (count === 0) return null;

    return Number((totalHours / count).toFixed(1));
  }, [workOrders]);

  /*
   * UNIQUE CUSTOMERS
   */
  const customersServed = customerData.length;

  /*
   * ACTIVE TECHNICIANS
   */
  const activeTechnicians = technicianData.length;

  const background = darkMode
    ? "#020617"
    : "#f1f5f9";

  const cardBackground = darkMode
    ? "#111827"
    : "#ffffff";

  const textColor = darkMode
    ? "#f8fafc"
    : "#0f172a";

  const mutedColor = darkMode
    ? "#94a3b8"
    : "#64748b";

  return (
    <div
      style={{
        minHeight: "100vh",
        background,
        color: textColor,
        padding: "35px 40px 60px",
        fontFamily: "Arial, sans-serif",
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
          <h1
            style={{
              margin: 0,
              color: "#2563eb",
              fontSize: "34px",
              letterSpacing: "-0.5px",
            }}
          >
            KEYSTONE Reports
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: mutedColor,
              fontSize: "16px",
            }}
          >
            Live operational reports from your field
            service data.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={loadReports}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ↻ Refresh
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: cardBackground,
              color: textColor,
              border: darkMode
                ? "1px solid #334155"
                : "1px solid #e2e8f0",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ← Back Dashboard
          </button>
        </div>
      </div>

      {/* REPORT INTRO */}
      <div
        style={{
          background: cardBackground,
          borderRadius: "18px",
          padding: "25px 28px",
          marginBottom: "25px",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.08)",
          borderLeft: "5px solid #2563eb",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "8px",
          }}
        >
          Reports Dashboard
        </h2>

        <p
          style={{
            margin: 0,
            color: mutedColor,
          }}
        >
          Generate and analyze operational reports
          using live field service data.
        </p>
      </div>

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            background: darkMode
              ? "#450a0a"
              : "#fef2f2",
            color: "#dc2626",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
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
          marginBottom: "25px",
        }}
      >
        <MetricCard
          title="Total Work Orders"
          value={
            loading
              ? "..."
              : String(totalWorkOrders)
          }
          icon="▣"
          background={cardBackground}
        />

        <MetricCard
          title="Completed Jobs"
          value={
            loading
              ? "..."
              : String(completedJobs)
          }
          icon="✓"
          background={cardBackground}
        />

        <MetricCard
          title="Pending Jobs"
          value={
            loading
              ? "..."
              : String(pendingJobs)
          }
          icon="◷"
          background={cardBackground}
        />

        <MetricCard
          title="Completion Rate"
          value={
            loading
              ? "..."
              : `${completionRate}%`
          }
          icon="%"
          background={cardBackground}
        />
      </div>

      {loading ? (
        <div
          style={{
            background: cardBackground,
            borderRadius: "18px",
            padding: "50px",
            textAlign: "center",
            color: mutedColor,
          }}
        >
          Loading live reports...
        </div>
      ) : !error ? (
        <>
          {/* MAIN CHART ROW */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.15fr) minmax(0, 0.85fr)",
              gap: "25px",
              marginBottom: "25px",
            }}
          >
            {/* STATUS */}
            <ReportCard
              title="Work Order Status Distribution"
              subtitle="Current lifecycle distribution."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {statusData.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {statusData.map(
                          (item, index) => (
                            <Cell
                              key={item.status}
                              fill={
                                STATUS_COLORS[
                                  item.status
                                ] ||
                                [
                                  "#2563eb",
                                  "#f59e0b",
                                  "#8b5cf6",
                                  "#16a34a",
                                  "#64748b",
                                ][
                                  index % 5
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div>
                    {statusData.map(
                      (item, index) => (
                        <div
                          key={item.status}
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            padding:
                              "10px 0",
                            borderBottom:
                              darkMode
                                ? "1px solid #1e293b"
                                : "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "9px",
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "10px",
                                height:
                                  "10px",
                                borderRadius:
                                  "50%",
                                background:
                                  STATUS_COLORS[
                                    item.status
                                  ] ||
                                  [
                                    "#2563eb",
                                    "#f59e0b",
                                    "#8b5cf6",
                                    "#16a34a",
                                    "#64748b",
                                  ][
                                    index %
                                      5
                                  ],
                              }}
                            />

                            <span
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              {item.name}
                            </span>
                          </div>

                          <strong>
                            {item.value}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </ReportCard>

            {/* MONTHLY */}
            <ReportCard
              title="Monthly Service Report"
              subtitle="Work orders created from the live database."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {monthlyData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={300}
                >
                  <AreaChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="reportMonthlyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.4}
                        />

                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        darkMode
                          ? "#334155"
                          : "#e2e8f0"
                      }
                    />

                    <XAxis
                      dataKey="month"
                      stroke={mutedColor}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke={mutedColor}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="requests"
                      name="Work Orders"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#reportMonthlyGradient)"
                      activeDot={{
                        r: 7,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ReportCard>
          </div>

          {/* SECOND CHART ROW */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "25px",
              marginBottom: "25px",
            }}
          >
            {/* TECHNICIAN */}
            <ReportCard
              title="Technician Performance"
              subtitle="Live work-order assignments by technician."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {technicianData.length === 0 ? (
                <EmptyState
                  title="No assigned technician data available."
                  description="Technician performance will appear here once work orders are assigned."
                />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={technicianData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        darkMode
                          ? "#334155"
                          : "#e2e8f0"
                      }
                    />

                    <XAxis
                      dataKey="technician"
                      stroke={mutedColor}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke={mutedColor}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="assigned"
                      name="Assigned"
                      fill="#2563eb"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="completed"
                      name="Completed"
                      fill="#16a34a"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ReportCard>

            {/* LOCATION */}
            <ReportCard
              title="Service Requests by Location"
              subtitle="Live work-order distribution across service sites."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {locationData.length === 0 ? (
                <EmptyState
                  title="No location data available."
                  description="Service locations will appear here when work orders contain site information."
                />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart
                    data={locationData}
                    layout="vertical"
                    margin={{
                      top: 10,
                      right: 20,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        darkMode
                          ? "#334155"
                          : "#e2e8f0"
                      }
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      stroke={mutedColor}
                    />

                    <YAxis
                      type="category"
                      dataKey="location"
                      width={130}
                      stroke={mutedColor}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="requests"
                      name="Work Orders"
                      fill="#8b5cf6"
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ReportCard>
          </div>

          {/* OPERATIONAL METRICS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "20px",
              marginBottom: "25px",
            }}
          >
            <InfoMetric
              title="SLA Compliance"
              value={
                slaStats.percentage === null
                  ? "N/A"
                  : `${slaStats.percentage}%`
              }
              description={
                slaStats.evaluated === 0
                  ? "No SLA-evaluable work orders"
                  : `${slaStats.evaluated} work orders evaluated`
              }
              background={cardBackground}
            />

            <InfoMetric
              title="Average Response Time"
              value={
                averageResponseHours === null
                  ? "N/A"
                  : `${averageResponseHours} hrs`
              }
              description={
                averageResponseHours === null
                  ? "No valid timing data"
                  : "Based on live created/updated timestamps"
              }
              background={cardBackground}
            />

            <InfoMetric
              title="Customers Served"
              value={String(customersServed)}
              description={
                customersServed === 0
                  ? "No customer data available"
                  : "Unique customer organisations"
              }
              background={cardBackground}
            />
          </div>

          {/* CUSTOMER SERVICE REPORT */}
          <ReportCard
            title="Customer Service Report"
            subtitle="Live work-order volume by customer organisation."
            background={cardBackground}
            mutedColor={mutedColor}
          >
            {customerData.length === 0 ? (
              <EmptyState
                title="No customer data available."
                description="Customer service analytics will appear when work orders contain customer information."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "15px",
                }}
              >
                {customerData.map(
                  (customer) => (
                    <div
                      key={customer.customer}
                      style={{
                        padding: "18px",
                        borderRadius:
                          "12px",
                        background:
                          darkMode
                            ? "#020617"
                            : "#f8fafc",
                        border:
                          darkMode
                            ? "1px solid #1e293b"
                            : "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          color:
                            mutedColor,
                          fontSize:
                            "13px",
                          marginBottom:
                            "7px",
                        }}
                      >
                        CUSTOMER
                      </div>

                      <div
                        style={{
                          fontWeight:
                            "bold",
                          fontSize:
                            "16px",
                        }}
                      >
                        {customer.customer}
                      </div>

                      <div
                        style={{
                          marginTop:
                            "10px",
                          color:
                            "#2563eb",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {customer.requests}{" "}
                        work order
                        {customer.requests ===
                        1
                          ? ""
                          : "s"}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </ReportCard>

          {/* BUSINESS SUMMARY */}
          <div
            style={{
              marginTop: "25px",
              background: cardBackground,
              borderRadius: "18px",
              padding: "28px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#2563eb",
              }}
            >
              Business Summary
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "15px",
              }}
            >
              <SummaryItem
                text={`${completionRate}% of current work orders are completed.`}
              />

              <SummaryItem
                text={`${pendingJobs} work order${
                  pendingJobs === 1
                    ? ""
                    : "s"
                } currently require${
                  pendingJobs === 1
                    ? "s"
                    : ""
                } active attention.`}
              />

              <SummaryItem
                text={
                  activeTechnicians > 0
                    ? `${activeTechnicians} technician${
                        activeTechnicians ===
                        1
                          ? ""
                          : "s"
                      } currently have assigned work orders.`
                    : "No technician assignment data is currently available."
                }
              />

              <SummaryItem
                text={
                  customersServed > 0
                    ? `${customersServed} customer organisation${
                        customersServed ===
                        1
                          ? ""
                          : "s"
                      } are represented in the current work-order data.`
                    : "No customer organisation data is currently available."
                }
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  background,
}: {
  title: string;
  value: string;
  icon: string;
  background: string;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {title}
        </span>

        <span
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#dbeafe",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {icon}
        </span>
      </div>

      <h2
        style={{
          marginTop: "15px",
          marginBottom: 0,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function ReportCard({
  title,
  subtitle,
  background,
  mutedColor,
  children,
}: {
  title: string;
  subtitle: string;
  background: string;
  mutedColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "18px",
        padding: "25px",
        boxShadow:
          "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "6px",
          color: "#2563eb",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          marginTop: 0,
          marginBottom: "20px",
          color: mutedColor,
          fontSize: "14px",
        }}
      >
        {subtitle}
      </p>

      {children}
    </div>
  );
}

function InfoMetric({
  title,
  value,
  description,
  background,
}: {
  title: string;
  value: string;
  description: string;
  background: string;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "16px",
        padding: "25px",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginTop: "12px",
          color: "#2563eb",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "8px",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function EmptyState({
  title = "No live data available.",
  description = "There is currently no data to display.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      style={{
        height: "280px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#64748b",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          marginBottom: "15px",
        }}
      >
        ◌
      </div>

      <strong
        style={{
          color: "#475569",
          marginBottom: "7px",
        }}
      >
        {title}
      </strong>

      <span
        style={{
          fontSize: "13px",
          maxWidth: "380px",
        }}
      >
        {description}
      </span>
    </div>
  );
}

function SummaryItem({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "12px",
        background: "#f8fafc",
        borderLeft: "4px solid #2563eb",
        color: "#475569",
        lineHeight: "1.5",
      }}
    >
      • {text}
    </div>
  );
}
