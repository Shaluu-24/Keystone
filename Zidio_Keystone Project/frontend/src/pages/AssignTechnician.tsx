
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

type Technician = {
  id: number;
  name: string;
  email: string;
};

export default function AssignTechnician() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [technicianId, setTechnicianId] = useState("");
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      setError("");

      const response = await api.get<Technician[]>("/users/technicians");

      setTechnicians(response.data);
    } catch (err: any) {
      console.error("Technician loading error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load technicians.";

      setError(message);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const selectedTech = technicians.find(
    (tech) => String(tech.id) === technicianId
  );

  const handleAssign = async () => {
    if (!selectedTech || !id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAssigned(false);

      await api.post(`/work-orders/${id}/assign`, {
        technicianId: selectedTech.id,
        note: "Technician assigned by manager.",
      });

      setAssigned(true);
    } catch (err: any) {
      console.error("Technician assignment error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to assign technician.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#2563eb" }}>KEYSTONE</h1>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ← Back Dashboard
        </button>
      </div>

      <div
        style={{
          background: darkMode ? "#111827" : "white",
          marginTop: "40px",
          padding: "35px",
          borderRadius: "18px",
          maxWidth: "700px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        <h2>Assign Technician</h2>

        <h3 style={{ color: "#3b82f6" }}>
          Work Order : {id}
        </h3>

        <p style={{ color: "#94a3b8" }}>
          Select suitable technician for this service request
        </p>

        <select
          value={technicianId}
          onChange={(e) => {
            setTechnicianId(e.target.value);
            setAssigned(false);
            setError("");
          }}
          disabled={loadingTechnicians}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "16px",
            marginTop: "20px",
          }}
        >
          <option value="">
            {loadingTechnicians
              ? "Loading Technicians..."
              : technicians.length === 0
                ? "No technicians available"
                : "Select Technician"}
          </option>

          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name} — {tech.email}
            </option>
          ))}
        </select>

        {selectedTech && (
          <div
            style={{
              marginTop: "25px",
              background: darkMode ? "#1e293b" : "#f8fafc",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3>Technician Details</h3>

            <p>
              Name : <b>{selectedTech.name}</b>
            </p>

            <p>
              Email : <b>{selectedTech.email}</b>
            </p>

            <p>
              Role : <b>TECHNICIAN</b>
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: darkMode ? "#450a0a" : "#fee2e2",
              color: darkMode ? "#fecaca" : "#991b1b",
              borderRadius: "10px",
            }}
          >
            {error}
          </div>
        )}

        <button
          disabled={!selectedTech || loading || loadingTechnicians}
          onClick={handleAssign}
          style={{
            marginTop: "30px",
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "14px 30px",
            borderRadius: "10px",
            cursor:
              selectedTech && !loading ? "pointer" : "not-allowed",
            opacity:
              selectedTech && !loading ? 1 : 0.5,
          }}
        >
          {loading ? "Assigning..." : "Assign Technician"}
        </button>

        {assigned && selectedTech && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: darkMode ? "#14532d" : "#dcfce7",
              color: darkMode ? "#bbf7d0" : "#166534",
              borderRadius: "12px",
            }}
          >
            <h3>Assignment Successful</h3>

            <p>
              Technician <b>{selectedTech.name}</b> assigned to{" "}
              <b>WO-{String(id).padStart(5, "0")}</b>
            </p>

            <p>
              Status : <b>ASSIGNED</b>
            </p>

            <button
              onClick={() => navigate(`/work-orders/${id}`)}
              style={{
                marginTop: "10px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              View Work Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
