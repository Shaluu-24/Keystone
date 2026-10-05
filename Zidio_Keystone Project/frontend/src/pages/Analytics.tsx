
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
  status: string;
  createdAt?: string;
  updatedAt?: string;
  slaDueAt?: string;

  assignedTo?: {
    id?: number;
    name?: string;
  };

  assignedToName?: string;

  site?: {
    id?: number;
    name?: string;
    address?: string;
  };

  siteName?: string;
  location?: string;
};

type WorkOrderResponse = {
  content?: WorkOrder[];
};

export default function Analytics() {
  const { darkMode } = useTheme();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<WorkOrderResponse | WorkOrder[]>(
        "/work-orders",
        {
          params: {
            page: 0,
            size: 500,
          },
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setWorkOrders(data);
      } else {
        setWorkOrders(data.content ?? []);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * MONTHLY SERVICE REPORT
   * Live database data only.
   */
  const monthlyServiceData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};

    workOrders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const month = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });

    return Object.entries(monthlyMap)
      .map(([month, requests]) => ({
        month,
        requests,
      }))
      .sort(
        (a, b) =>
          new Date(`1 ${a.month}`).getTime() -
          new Date(`1 ${b.month}`).getTime()
      );
  }, [workOrders]);

  /*
   * WORK ORDER STATUS
   */
  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {};

    workOrders.forEach((order) => {
      const status = order.status || "UNKNOWN";

      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([status, value]) => ({
      name: status.replace(/_/g, " "),
      value,
    }));
  }, [workOrders]);

  /*
   * TECHNICIAN PRODUCTIVITY
   */
  const technicianData = useMemo(() => {
    const technicianMap: Record<string, number> = {};

    workOrders.forEach((order) => {
      const technician =
        order.assignedTo?.name ||
        order.assignedToName;

      if (!technician) return;

      technicianMap[technician] =
        (technicianMap[technician] || 0) + 1;
    });

    return Object.entries(technicianMap)
      .map(([technician, jobs]) => ({
        technician,
        jobs,
      }))
      .sort((a, b) => b.jobs - a.jobs);
  }, [workOrders]);

  /*
   * SERVICE REQUESTS BY LOCATION
   */
  const locationData = useMemo(() => {
    const locationMap: Record<string, number> = {};

    workOrders.forEach((order) => {
      const location =
        order.site?.name ||
        order.site?.address ||
        order.siteName ||
        order.location;

      if (!location) return;

      locationMap[location] =
        (locationMap[location] || 0) + 1;
    });

    return Object.entries(locationMap)
      .map(([location, requests]) => ({
        location,
        requests,
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [workOrders]);

  const totalWorkOrders = workOrders.length;

  const completedWorkOrders = workOrders.filter(
    (order) =>
      order.status === "COMPLETED" ||
      order.status === "CLOSED"
  ).length;

  const pendingWorkOrders = workOrders.filter(
    (order) =>
      order.status !== "COMPLETED" &&
      order.status !== "CLOSED" &&
      order.status !== "CANCELLED"
  ).length;

  const completionRate =
    totalWorkOrders > 0
      ? Math.round(
          (completedWorkOrders / totalWorkOrders) * 100
        )
      : 0;

  const cardBackground = darkMode ? "#111827" : "#ffffff";
  const textColor = darkMode ? "#f8fafc" : "#1e293b";
  const mutedColor = darkMode ? "#94a3b8" : "#64748b";
  const pageBackground = darkMode ? "#020617" : "#f1f5f9";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: textColor,
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
          marginBottom: "35px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#2563eb",
              fontSize: "32px",
            }}
          >
            Analytics
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: mutedColor,
            }}
          >
            Real-time service performance from the live database
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <MetricCard
          title="Total Work Orders"
          value={loading ? "..." : String(totalWorkOrders)}
          background={cardBackground}
          textColor={textColor}
        />

        <MetricCard
          title="Completed"
          value={
            loading
              ? "..."
              : String(completedWorkOrders)
          }
          background={cardBackground}
          textColor={textColor}
        />

        <MetricCard
          title="Pending"
          value={
            loading
              ? "..."
              : String(pendingWorkOrders)
          }
          background={cardBackground}
          textColor={textColor}
        />

        <MetricCard
          title="Completion Rate"
          value={
            loading
              ? "..."
              : `${completionRate}%`
          }
          background={cardBackground}
          textColor={textColor}
        />
      </div>

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            background: darkMode ? "#450a0a" : "#fef2f2",
            color: "#dc2626",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          style={{
            background: cardBackground,
            padding: "30px",
            borderRadius: "16px",
            color: mutedColor,
          }}
        >
          Loading analytics...
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ROW 1 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "25px",
            }}
          >
            {/* MONTHLY SERVICE REPORT */}
            <ChartCard
              title="Monthly Service Report"
              description="Work orders created from the live database."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {monthlyServiceData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <AreaChart
                    data={monthlyServiceData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="monthlyAreaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.45}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.05}
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
                      name="Requests"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#monthlyAreaGradient)"
                      activeDot={{
                        r: 7,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* WORK ORDER STATUS */}
            <ChartCard
              title="Work Order Status"
              description="Current status distribution from live work orders."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {statusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={115}
                      paddingAngle={3}
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            [
                              "#2563eb",
                              "#f59e0b",
                              "#16a34a",
                              "#8b5cf6",
                              "#dc2626",
                              "#64748b",
                            ][index %
                              6]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ROW 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "25px",
              marginTop: "25px",
            }}
          >
            {/* TECHNICIAN PRODUCTIVITY */}
            <ChartCard
              title="Technician Productivity"
              description="Work orders handled by each technician."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {technicianData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <LineChart
                    data={technicianData}
                    margin={{
                      top: 20,
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

                    <Line
                      type="monotone"
                      dataKey="jobs"
                      name="Jobs"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                      }}
                      activeDot={{
                        r: 7,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* SERVICE REQUESTS BY LOCATION */}
            <ChartCard
              title="Service Requests by Location"
              description="Work orders grouped by actual site/location."
              background={cardBackground}
              mutedColor={mutedColor}
            >
              {locationData.length === 0 ? (
                <EmptyChart />
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
                      name="Requests"
                      fill="#2563eb"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  background,
  textColor,
}: {
  title: string;
  value: string;
  background: string;
  textColor: string;
}) {
  return (
    <div
      style={{
        background,
        padding: "25px",
        borderRadius: "16px",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.12)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginTop: "12px",
          marginBottom: 0,
          color: textColor,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function ChartCard({
  title,
  description,
  background,
  mutedColor,
  children,
}: {
  title: string;
  description: string;
  background: string;
  mutedColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background,
        padding: "25px",
        borderRadius: "18px",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.12)",
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
          color: mutedColor,
          fontSize: "14px",
        }}
      >
        {description}
      </p>

      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div
      style={{
        height: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
      }}
    >
      No live data available.
    </div>
  );
}
