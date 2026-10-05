
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useTheme } from "../context/ThemeContext";

type Customer = {
  id: number;
  name: string;
  contactEmail?: string;
  createdAt?: string;
};

type CustomerPage = {
  content: Customer[];
  totalElements: number;
};

type Site = {
  id: number;
  name: string;
  address?: string;
};

type ServiceRequest = {
  id: number;
  serviceType?: string;
  status?: string;
  customer?: {
    id?: number;
  };
};

export default function Customers() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sitesByCustomer, setSitesByCustomer] = useState<
    Record<number, Site[]>
  >({});
  const [requestsByCustomer, setRequestsByCustomer] = useState<
    Record<number, number>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * /api/customers returns Spring Page<Customer>,
       * so customer records are inside response.data.content.
       */
      const customerResponse = await api.get<CustomerPage>("/customers", {
        params: {
          page: 0,
          size: 100,
        },
      });

      const customerList = customerResponse.data?.content ?? [];

      setCustomers(customerList);

      /*
       * Load real service locations for every customer.
       */
      const siteResults = await Promise.all(
        customerList.map(async (customer) => {
          try {
            const response = await api.get<Site[]>(
              `/customers/${customer.id}/sites`
            );

            return {
              customerId: customer.id,
              sites: Array.isArray(response.data)
                ? response.data
                : [],
            };
          } catch (err) {
            console.error(
              `Failed to load sites for customer ${customer.id}:`,
              err
            );

            return {
              customerId: customer.id,
              sites: [],
            };
          }
        })
      );

      const siteMap: Record<number, Site[]> = {};

      siteResults.forEach((item) => {
        siteMap[item.customerId] = item.sites;
      });

      setSitesByCustomer(siteMap);

      /*
       * Load real service requests.
       */
      try {
        const requestResponse = await api.get<any>(
          "/service-requests",
          {
            params: {
              page: 0,
              size: 500,
            },
          }
        );

        const requestData = requestResponse.data;

        const requestList: ServiceRequest[] = Array.isArray(requestData)
          ? requestData
          : requestData?.content ?? [];

        const requestMap: Record<number, number> = {};

        requestList.forEach((request) => {
          const customerId = request.customer?.id;

          if (customerId) {
            requestMap[customerId] =
              (requestMap[customerId] || 0) + 1;
          }
        });

        setRequestsByCustomer(requestMap);
      } catch (err) {
        console.error(
          "Failed to load service request counts:",
          err
        );

        setRequestsByCustomer({});
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("keystone_token");
        localStorage.removeItem("keystone_user");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view customer management data."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load customer management data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadCustomers();
  };

  const totalRequests = useMemo(() => {
    return Object.values(requestsByCustomer).reduce(
      (total, count) => total + count,
      0
    );
  }, [requestsByCustomer]);

  const getCustomerSites = (customerId: number) => {
    return sitesByCustomer[customerId] || [];
  };

  const getCustomerLocation = (customerId: number) => {
    const sites = getCustomerSites(customerId);

    if (sites.length === 0) {
      return "No service location";
    }

    if (sites.length === 1) {
      return sites[0].address
        ? `${sites[0].name} — ${sites[0].address}`
        : sites[0].name;
    }

    return `${sites.length} service locations`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#f1f5f9",
        color: darkMode ? "#f8fafc" : "#1e293b",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
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
            KEYSTONE
          </h1>

          <h2
            style={{
              marginTop: "10px",
              marginBottom: "6px",
              fontSize: "26px",
            }}
          >
            Customer Management
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Live customer organisations, service locations and requests.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={refresh}
            disabled={refreshing}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              background: darkMode ? "#1e293b" : "white",
              color: darkMode ? "white" : "#334155",
              border: "1px solid #cbd5e1",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back Dashboard
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <StatCard
          title="Total Customers"
          value={loading ? "..." : String(customers.length)}
          subtitle="Registered customer organisations"
          darkMode={darkMode}
        />

        <StatCard
          title="Active Customers"
          value={loading ? "..." : String(customers.length)}
          subtitle="Currently registered organisations"
          darkMode={darkMode}
        />

        <StatCard
          title="Service Requests"
          value={loading ? "..." : String(totalRequests)}
          subtitle="Requests from live service data"
          darkMode={darkMode}
        />
      </div>

      {/* CUSTOMER LIST */}
      <section
        style={{
          background: darkMode ? "#111827" : "white",
          borderRadius: "18px",
          padding: "30px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h2
            style={{
              margin: 0,
              color: "#2563eb",
            }}
          >
            Customer List
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Live customer accounts and workload from KEYSTONE data.
          </p>
        </div>

        {loading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading customer data...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: darkMode ? "#450a0a" : "#fef2f2",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <h3>No customers found</h3>
            <p>
              Customer organisations created in KEYSTONE will appear here.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          customers.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "22px",
              }}
            >
              {customers.map((customer) => {
                const sites = getCustomerSites(customer.id);

                const requestCount =
                  requestsByCustomer[customer.id] || 0;

                return (
                  <div
                    key={customer.id}
                    style={{
                      background: darkMode
                        ? "#020617"
                        : "#f8fafc",
                      borderRadius: "16px",
                      padding: "25px",
                      border: darkMode
                        ? "1px solid #1e293b"
                        : "1px solid #e2e8f0",
                      boxShadow:
                        "0 5px 15px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "15px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            color: "#2563eb",
                            fontSize: "21px",
                          }}
                        >
                          {customer.name}
                        </h2>

                        <p
                          style={{
                            marginTop: "8px",
                            color: "#64748b",
                            fontSize: "14px",
                          }}
                        >
                          Customer ID: {customer.id}
                        </p>
                      </div>

                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        ACTIVE
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        lineHeight: "1.8",
                      }}
                    >
                      <p style={{ margin: "5px 0" }}>
                        <strong>Contact:</strong>{" "}
                        {customer.contactEmail ||
                          "Not provided"}
                      </p>

                      <p style={{ margin: "5px 0" }}>
                        <strong>Service Locations:</strong>{" "}
                        {getCustomerLocation(customer.id)}
                      </p>

                      <p style={{ margin: "5px 0" }}>
                        <strong>Service Requests:</strong>{" "}
                        <span
                          style={{
                            color: "#2563eb",
                            fontWeight: "bold",
                          }}
                        >
                          {requestCount}
                        </span>
                      </p>
                    </div>

                    {sites.length > 0 && (
                      <div
                        style={{
                          marginTop: "18px",
                          padding: "15px",
                          borderRadius: "10px",
                          background: darkMode
                            ? "#111827"
                            : "#ffffff",
                        }}
                      >
                        <strong>
                          Service Sites
                        </strong>

                        <div style={{ marginTop: "8px" }}>
                          {sites.map((site) => (
                            <div
                              key={site.id}
                              style={{
                                padding: "7px 0",
                                color: "#64748b",
                                fontSize: "14px",
                              }}
                            >
                              • {site.name}
                              {site.address
                                ? ` — ${site.address}`
                                : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/customers/${customer.id}`)
                      }
                      style={{
                        width: "100%",
                        marginTop: "20px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: "9px",
                        cursor: "pointer",
                        fontWeight: "bold",
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
  );
}

function StatCard({
  title,
  value,
  subtitle,
  darkMode,
}: {
  title: string;
  value: string;
  subtitle: string;
  darkMode: boolean;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#111827" : "white",
        padding: "24px",
        borderRadius: "16px",
        border: darkMode
          ? "1px solid #1e293b"
          : "1px solid #e2e8f0",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontWeight: "bold",
        }}
      >
        {title}
      </p>

      <h1
        style={{
          margin: "10px 0 5px",
          color: "#2563eb",
          fontSize: "34px",
        }}
      >
        {value}
      </h1>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
