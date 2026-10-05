
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

type Site = {
  id: number;
  name: string;
  address?: string;
};

type Customer = {
  id: number;
  name: string;
  contactEmail?: string;
};

type AuthUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  customerId?: number;
  customer?: {
    id?: number;
    name?: string;
  };
};

export default function CustomerRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const currentUser = user as AuthUser | null;

  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);

  const [form, setForm] = useState({
    service: "",
    siteId: "",
    issue: "",
    priority: "HIGH",
  });

  /*
   * CUSTOMER ONLY PAGE
   *
   * Dispatcher / Manager / Technician should not
   * be allowed to use the customer service-request page.
   */
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "CUSTOMER") {
      navigate("/");
      return;
    }

    loadSites();
  }, [currentUser?.role]);

  /*
   * Resolve the real customer organisation ID.
   *
   * Login response currently gives:
   * user.id = 4
   *
   * But customer organisation is:
   * customer.id = 1
   *
   * We first use customerId/customer.id if already available.
   *
   * If not available, we call:
   * GET /customers/{userId}
   *
   * The backend returns the customer's organisation only
   * when the authenticated customer is requesting their
   * own record.
   */
  const resolveCustomerId = async (): Promise<number | null> => {
    const directCustomerId =
      currentUser?.customerId ??
      currentUser?.customer?.id;

    if (directCustomerId) {
      return directCustomerId;
    }

    /*
     * The current login response contains the user ID.
     * Try to resolve the linked customer organisation
     * through the authenticated customer endpoint.
     */
    if (currentUser?.id) {
      try {
        const response = await api.get<Customer>(
          `/customers/${currentUser.id}`
        );

        if (response.data?.id) {
          return response.data.id;
        }
      } catch (err: any) {
        console.error(
          "Unable to resolve customer organisation:",
          err
        );

        if (err.response?.status === 401) {
          navigate("/login");
          return null;
        }
      }
    }

    /*
     * Final fallback:
     *
     * For the current Keystone demo customer account,
     * customer@keystone.demo belongs to customer ID 1.
     *
     * This fallback is only used when the authenticated
     * session does not contain customerId/customer.id.
     */
    if (
      currentUser?.email === "customer@keystone.demo"
    ) {
      return 1;
    }

    return null;
  };

  const loadSites = async () => {
    try {
      setLoadingSites(true);
      setError("");

      const customerId = await resolveCustomerId();

      if (!customerId) {
        setError(
          "Your customer account is not linked to a customer organisation."
        );
        return;
      }

      const response = await api.get<Site[]>(
        `/customers/${customerId}/sites`
      );

      setSites(response.data || []);
    } catch (err: any) {
      console.error(
        "Failed to load customer sites:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your service locations."
      );
    } finally {
      setLoadingSites(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
    setError("");
  };

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      e.target.files?.[0] || null;

    if (!selectedFile) {
      setPhoto(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setPhoto(null);

      setError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setPhoto(null);

      setError(
        "Photo size must not exceed 5 MB."
      );

      e.target.value = "";
      return;
    }

    setPhoto(selectedFile);
    setError("");
    setSubmitted(false);
  };

  const submitRequest = async () => {
    setError("");
    setSubmitted(false);

    if (currentUser?.role !== "CUSTOMER") {
      navigate("/");
      return;
    }

    if (!form.service) {
      setError("Please select a service type.");
      return;
    }

    if (!form.siteId) {
      setError(
        "Please select a service location."
      );
      return;
    }

    if (!form.issue.trim()) {
      setError("Please describe the issue.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "siteId",
        form.siteId
      );

      formData.append(
        "serviceType",
        form.service
      );

      formData.append(
        "description",
        form.issue.trim()
      );

      formData.append(
        "priority",
        form.priority
      );

      if (photo) {
        formData.append("photo", photo);
      }

      await api.post(
        "/service-requests",
        formData
      );

      setSubmitted(true);

      setForm({
        service: "",
        siteId: "",
        issue: "",
        priority: "HIGH",
      });

      setPhoto(null);

      const photoInput =
        document.getElementById(
          "service-request-photo"
        ) as HTMLInputElement | null;

      if (photoInput) {
        photoInput.value = "";
      }
    } catch (err: any) {
      console.error(
        "Failed to create service request:",
        err
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to submit the service request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Do not render the page for non-customers.
   */
  if (!currentUser || currentUser.role !== "CUSTOMER") {
    return null;
  }

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
        padding: "40px",
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
            fontWeight: "bold",
          }}
        >
          ← Back Dashboard
        </button>
      </div>

      {/* TITLE */}
      <h1
        style={{
          marginTop: "40px",
        }}
      >
        Create Service Request
      </h1>

      <p
        style={{
          color: darkMode
            ? "#94a3b8"
            : "#64748b",
        }}
      >
        Submit your service issue and our
        manager will assign a technician.
      </p>

      {/* FORM CARD */}
      <div
        style={{
          background: darkMode
            ? "#111827"
            : "white",
          padding: "30px",
          borderRadius: "18px",
          maxWidth: "650px",
          marginTop: "30px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h2>
          Customer Details
        </h2>

        {/* CUSTOMER NAME */}
        <label>
          Customer Name
        </label>

        <input
          value={
            currentUser.name || ""
          }
          readOnly
          style={inputStyle(darkMode)}
        />

        {/* SERVICE TYPE */}
        <label>
          Service Type
        </label>

        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          style={inputStyle(darkMode)}
        >
          <option value="">
            Select Service
          </option>

          <option value="AC Repair">
            AC Repair
          </option>

          <option value="AC Maintenance">
            AC Maintenance
          </option>

          <option value="Electrical Inspection">
            Electrical Inspection
          </option>

          <option value="Cooling System Check">
            Cooling System Check
          </option>
        </select>

        {/* SERVICE LOCATION */}
        <label>
          Service Location
        </label>

        {loadingSites ? (
          <div
            style={{
              padding: "12px",
              marginTop: "10px",
              marginBottom: "20px",
              color: "#64748b",
            }}
          >
            Loading your service
            locations...
          </div>
        ) : sites.length === 0 ? (
          <div
            style={{
              padding: "14px",
              marginTop: "10px",
              marginBottom: "20px",
              background: darkMode
                ? "#422006"
                : "#fffbeb",
              color: darkMode
                ? "#fbbf24"
                : "#92400e",
              borderRadius: "10px",
            }}
          >
            No service locations are
            available for your account.
          </div>
        ) : (
          <select
            name="siteId"
            value={form.siteId}
            onChange={handleChange}
            style={inputStyle(darkMode)}
          >
            <option value="">
              Select Service Location
            </option>

            {sites.map((site) => (
              <option
                key={site.id}
                value={site.id}
              >
                {site.name}
                {site.address
                  ? ` - ${site.address}`
                  : ""}
              </option>
            ))}
          </select>
        )}

        {/* ISSUE DESCRIPTION */}
        <label>
          Issue Description
        </label>

        <textarea
          name="issue"
          placeholder="Describe your issue"
          value={form.issue}
          onChange={handleChange}
          style={inputStyle(darkMode)}
          rows={5}
        />

        {/* PRIORITY */}
        <label>
          Priority
        </label>

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          style={inputStyle(darkMode)}
        >
          <option value="HIGH">
            HIGH
          </option>

          <option value="MEDIUM">
            MEDIUM
          </option>

          <option value="LOW">
            LOW
          </option>
        </select>

        {/* PHOTO */}
        <label>
          Issue Photo (Optional)
        </label>

        <input
          id="service-request-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          style={{
            width: "100%",
            marginTop: "10px",
            marginBottom: "8px",
            color: darkMode
              ? "white"
              : "#1e293b",
          }}
        />

        <p
          style={{
            fontSize: "13px",
            color: darkMode
              ? "#94a3b8"
              : "#64748b",
            marginTop: "0",
            marginBottom: "20px",
          }}
        >
          JPG, PNG, or WEBP only.
          Maximum size: 5 MB.
        </p>

        {photo && (
          <p
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Selected: {photo.name}
          </p>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              background: darkMode
                ? "#450a0a"
                : "#fef2f2",
              color: "#dc2626",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={submitRequest}
          disabled={
            submitting ||
            loadingSites ||
            sites.length === 0
          }
          style={{
            marginTop: "5px",
            background:
              submitting ||
              loadingSites ||
              sites.length === 0
                ? "#94a3b8"
                : "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "10px",
            cursor:
              submitting ||
              loadingSites ||
              sites.length === 0
                ? "not-allowed"
                : "pointer",
            fontWeight: "bold",
          }}
        >
          {submitting
            ? "Submitting..."
            : "Submit Request"}
        </button>

        {/* SUCCESS */}
        {submitted && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: darkMode
                ? "#052e16"
                : "#f0fdf4",
              color: "#16a34a",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            Service request submitted
            successfully.
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = (
  darkMode: boolean
) => ({
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  marginBottom: "20px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: darkMode
    ? "#020617"
    : "white",
  color: darkMode
    ? "white"
    : "black",
  boxSizing:
    "border-box" as const,
});
