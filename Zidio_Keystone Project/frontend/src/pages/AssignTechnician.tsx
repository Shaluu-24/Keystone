
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export default function AssignTechnician() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();

  const [technician, setTechnician] = useState("");
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const technicians = [
    {
      id: 1,
      name: "Arun Kumar",
      skill: "AC Repair",
      jobs: 12,
      availability: "Available",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      skill: "Electrical Inspection",
      jobs: 9,
      availability: "Available",
    },
    {
      id: 3,
      name: "Vijay Kumar",
      skill: "Cooling System",
      jobs: 7,
      availability: "Busy",
    },
    {
      id: 4,
      name: "Suresh Raj",
      skill: "Maintenance",
      jobs: 5,
      availability: "Available",
    },
  ];

  const selectedTech = technicians.find(
    (item) => item.name === technician
  );

  const handleAssign = async () => {
    if (!selectedTech || !id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAssigned(false);

      const token = localStorage.getItem("keystone_token");

      await axios.post(
        `http://localhost:8080/api/work-orders/${id}/assign`,
        {
          technicianId: selectedTech.id,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
          }}
        >
          ← Back Dashboard
        </button>
      </div>

      {/* Main Card */}
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

        <h3
          style={{
            color: "#3b82f6",
          }}
        >
          Work Order : {id}
        </h3>

        <p style={{ color: "#94a3b8" }}>
          Select suitable technician for this service request
        </p>

        {/* Technician Dropdown */}
        <select
          value={technician}
          onChange={(e) => {
            setTechnician(e.target.value);
            setAssigned(false);
            setError("");
          }}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "16px",
            marginTop: "20px",
          }}
        >
          <option value="">Select Technician</option>

          {technicians.map((tech) => (
            <option key={tech.id} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>

        {/* Technician Details */}
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
              Skill : <b>{selectedTech.skill}</b>
            </p>

            <p>
              Current Jobs : <b>{selectedTech.jobs}</b>
            </p>

            <p>
              Availability :{" "}
              <b
                style={{
                  color:
                    selectedTech.availability === "Available"
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {selectedTech.availability}
              </b>
            </p>
          </div>
        )}

        {/* Error */}
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

        {/* Assign Button */}
        <button
          disabled={!technician || loading}
          onClick={handleAssign}
          style={{
            marginTop: "30px",
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "14px 30px",
            borderRadius: "10px",
            cursor:
              technician && !loading
                ? "pointer"
                : "not-allowed",
            opacity: technician && !loading ? 1 : 0.5,
          }}
        >
          {loading ? "Assigning..." : "Assign Technician"}
        </button>

        {/* Success */}
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
              <b>{id}</b>
            </p>

            <p>
              Status : <b>ASSIGNED</b>
            </p>

            <p>
              Assigned Date :{" "}
              <b>{new Date().toLocaleString()}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

