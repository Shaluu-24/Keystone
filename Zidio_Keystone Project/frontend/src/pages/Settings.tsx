
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useTheme } from "../context/ThemeContext";

type UserSession = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

type Preferences = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoAssignTechnician: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  emailNotifications: true,
  smsNotifications: true,
  autoAssignTechnician: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [settingsSaved, setSettingsSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("keystone_user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }

    const storedPreferences = localStorage.getItem(
      "keystone_settings"
    );

    if (storedPreferences) {
      try {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(storedPreferences),
        });
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  const updatePreference = (key: keyof Preferences) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setSettingsSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "keystone_settings",
      JSON.stringify(preferences)
    );

    setSettingsSaved(true);

    setTimeout(() => {
      setSettingsSaved(false);
    }, 3000);
  };

  const handleChangePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword.trim()) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        response.data?.message ||
          "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update failed:", error);

      setPasswordError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("keystone_token");
    localStorage.removeItem("keystone_user");
    navigate("/login");
  };

  const pageBackground = darkMode ? "#020617" : "#f1f5f9";
  const cardBackground = darkMode ? "#111827" : "#ffffff";
  const borderColor = darkMode ? "#1f2937" : "#e2e8f0";
  const primaryText = darkMode ? "#f8fafc" : "#0f172a";
  const secondaryText = darkMode ? "#94a3b8" : "#64748b";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: primaryText,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
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
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              KEYSTONE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 750,
              }}
            >
              Manager Settings
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: secondaryText,
                fontSize: "15px",
              }}
            >
              Manage your account, preferences, security and
              workspace experience.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            style={secondaryButtonStyle}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* PROFILE CARD */}
        <section
          style={{
            ...cardStyle,
            background: cardBackground,
            border: `1px solid ${borderColor}`,
            marginBottom: "24px",
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Account Information</h2>
              <p style={sectionDescriptionStyle}>
                Your KEYSTONE manager account details.
              </p>
            </div>

            <div
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                padding: "8px 14px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {currentUser?.role || "MANAGER"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            <InfoItem
              label="Full Name"
              value={currentUser?.name || "Manager"}
              darkMode={darkMode}
            />

            <InfoItem
              label="Email Address"
              value={
                currentUser?.email || "manager@keystone.demo"
              }
              darkMode={darkMode}
            />

            <InfoItem
              label="Role"
              value={currentUser?.role || "MANAGER"}
              darkMode={darkMode}
            />

            <InfoItem
              label="Account Status"
              value="Active"
              darkMode={darkMode}
              valueColor="#16a34a"
            />
          </div>
        </section>

        {/* APPLICATION PREFERENCES */}
        <section
          style={{
            ...cardStyle,
            background: cardBackground,
            border: `1px solid ${borderColor}`,
            marginBottom: "24px",
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Application Preferences
              </h2>

              <p style={sectionDescriptionStyle}>
                Configure how KEYSTONE behaves for your manager
                account.
              </p>
            </div>
          </div>

          <PreferenceRow
            title="Email Notifications"
            description="Receive important work-order and service-request updates."
            enabled={preferences.emailNotifications}
            onToggle={() =>
              updatePreference("emailNotifications")
            }
            darkMode={darkMode}
          />

          <PreferenceRow
            title="SMS Notifications"
            description="Receive critical operational alerts through SMS."
            enabled={preferences.smsNotifications}
            onToggle={() =>
              updatePreference("smsNotifications")
            }
            darkMode={darkMode}
          />

          <PreferenceRow
            title="Dark Mode"
            description="Use a darker interface for comfortable viewing."
            enabled={darkMode}
            onToggle={toggleDarkMode}
            darkMode={darkMode}
          />

          <PreferenceRow
            title="Auto Assign Technician"
            description="Allow automatic technician assignment for eligible jobs."
            enabled={preferences.autoAssignTechnician}
            onToggle={() =>
              updatePreference("autoAssignTechnician")
            }
            darkMode={darkMode}
          />

          <div
            style={{
              marginTop: "25px",
              paddingTop: "22px",
              borderTop: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong style={{ color: primaryText }}>
                Language
              </strong>

              <div
                style={{
                  color: secondaryText,
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                English
              </div>
            </div>

            <button
              onClick={saveSettings}
              style={{
                ...primaryButtonStyle,
                opacity: settingsSaved ? 0.85 : 1,
              }}
            >
              {settingsSaved
                ? "✓ Settings Saved"
                : "Save Preferences"}
            </button>
          </div>
        </section>

        {/* SECURITY */}
        <section
          style={{
            ...cardStyle,
            background: cardBackground,
            border: `1px solid ${borderColor}`,
            marginBottom: "24px",
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Security & Password
              </h2>

              <p style={sectionDescriptionStyle}>
                Keep your manager account secure by updating your
                password regularly.
              </p>
            </div>

            <div
              style={{
                fontSize: "28px",
              }}
            >
              🔐
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
              darkMode={darkMode}
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
              darkMode={darkMode}
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm new password"
              darkMode={darkMode}
            />
          </div>

          <p
            style={{
              color: secondaryText,
              fontSize: "13px",
              marginTop: "18px",
            }}
          >
            Password must contain at least 8 characters.
          </p>

          {passwordError && (
            <div
              style={{
                marginTop: "18px",
                padding: "13px 16px",
                borderRadius: "10px",
                background: darkMode ? "#450a0a" : "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                fontSize: "14px",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div
              style={{
                marginTop: "18px",
                padding: "13px 16px",
                borderRadius: "10px",
                background: darkMode ? "#052e16" : "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              ✓ {passwordMessage}
            </div>
          )}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              style={{
                ...primaryButtonStyle,
                background: passwordLoading
                  ? "#94a3b8"
                  : "#16a34a",
                cursor: passwordLoading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </section>

        {/* SESSION / ACCOUNT ACTIONS */}
        <section
          style={{
            ...cardStyle,
            background: cardBackground,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Account Actions
              </h2>

              <p style={sectionDescriptionStyle}>
                Manage your current KEYSTONE session.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong style={{ color: primaryText }}>
                Sign out of KEYSTONE
              </strong>

              <p
                style={{
                  margin: "5px 0 0",
                  color: secondaryText,
                  fontSize: "14px",
                }}
              >
                End your current manager session on this device.
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "11px 22px",
                borderRadius: "9px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  darkMode,
  valueColor,
}: {
  label: string;
  value: string;
  darkMode: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        borderRadius: "12px",
        padding: "17px",
        border: darkMode
          ? "1px solid #1e293b"
          : "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: darkMode ? "#64748b" : "#64748b",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          marginBottom: "7px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: valueColor || (darkMode ? "#f8fafc" : "#0f172a"),
          fontWeight: 650,
          fontSize: "15px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  enabled,
  onToggle,
  darkMode,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  darkMode: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "25px",
        padding: "20px 0",
        borderBottom: darkMode
          ? "1px solid #1f2937"
          : "1px solid #e2e8f0",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 650,
            fontSize: "15px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: darkMode ? "#94a3b8" : "#64748b",
            fontSize: "13px",
            marginTop: "5px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>

      <button
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        style={{
          width: "52px",
          height: "28px",
          border: "none",
          borderRadius: "999px",
          padding: "3px",
          cursor: "pointer",
          background: enabled ? "#2563eb" : "#64748b",
          transition: "0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "white",
            transform: enabled
              ? "translateX(24px)"
              : "translateX(0)",
            transition: "0.2s",
          }}
        />
      </button>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  darkMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  darkMode: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 650,
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          borderRadius: "9px",
          border: darkMode
            ? "1px solid #334155"
            : "1px solid #cbd5e1",
          background: darkMode ? "#020617" : "#ffffff",
          color: darkMode ? "#f8fafc" : "#0f172a",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </div>
  );
}

const cardStyle = {
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "22px",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "19px",
  fontWeight: 700,
};

const sectionDescriptionStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "14px",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "11px 20px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "14px",
};

const secondaryButtonStyle = {
  background: "white",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "11px 18px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 650,
};
