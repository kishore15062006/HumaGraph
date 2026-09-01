import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import { fetchGrants } from "../../store/slices/practitionerGrantSlice";
import healthReadingService from "../../services/healthReadingService";
import PractitionerGrantForm from "./PractitionerGrantForm";

import "../../styles/PractitionerPortal.css";

const PractitionerReadings = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const grants = useSelector(
    (state) => state.practitionerGrants?.items || []
  );
  const grantsLoading = useSelector(
    (state) => state.practitionerGrants?.loading || false
  );

  const activeGrants = useMemo(() => {
    return grants.filter((g) => g.status === "ACTIVE");
  }, [grants]);

  const [selectedGrant, setSelectedGrant] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [readingsError, setReadingsError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [metricFilter, setMetricFilter] = useState("ALL");

  // Modal
  const [showRequestForm, setShowRequestForm] = useState(false);

  // 1. Initial grants fetch
  useEffect(() => {
    dispatch(fetchGrants());
  }, [dispatch]);

  // 2. Select patient based on search param or first active patient
  useEffect(() => {
    if (activeGrants.length === 0) {
      setSelectedGrant(null);
      setReadings([]);
      return;
    }

    const patientParamId = searchParams.get("patientProfileId");
    if (patientParamId) {
      const matched = activeGrants.find(
        (g) => String(g.patientProfileId) === String(patientParamId)
      );
      if (matched) {
        setSelectedGrant(matched);
        return;
      }
    }

    // Default to currently selected or first active grant
    if (!selectedGrant || !activeGrants.some((g) => g.id === selectedGrant.id)) {
      setSelectedGrant(activeGrants[0]);
    }
  }, [activeGrants, searchParams, selectedGrant]);

  // 3. Load readings when selected patient changes
  useEffect(() => {
    if (!selectedGrant) {
      setReadings([]);
      return;
    }

    const profileId =
      selectedGrant.patientProfileId || selectedGrant.patientProfile?.id;

    if (!profileId) {
      setReadingsError("Patient profile ID not found.");
      return;
    }

    const loadPatientReadings = async () => {
      try {
        setLoadingReadings(true);
        setReadingsError("");

        const response = await healthReadingService.getPatientReadings(profileId);
        const data = response?.data !== undefined ? response.data : response;
        setReadings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load patient health readings:", err);
        setReadingsError(
          err?.response?.data?.error ||
            err?.message ||
            "Unable to load patient health readings."
        );
        setReadings([]);
      } finally {
        setLoadingReadings(false);
      }
    };

    loadPatientReadings();
  }, [selectedGrant]);

  const handleSelectPatient = (grant) => {
    setSelectedGrant(grant);
    if (grant.patientProfileId) {
      setSearchParams({ patientProfileId: grant.patientProfileId });
    }
  };

  const handleRefresh = async () => {
    if (!selectedGrant) return;
    const profileId = selectedGrant.patientProfileId;
    if (!profileId) return;

    try {
      setLoadingReadings(true);
      const response = await healthReadingService.getPatientReadings(profileId);
      const data = response?.data !== undefined ? response.data : response;
      setReadings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReadings(false);
    }
  };

  // Filtered readings
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      const metricName = r.metricName || "";
      const matchesSearch =
        metricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.numericValue).includes(searchQuery);

      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;

      const matchesMetric =
        metricFilter === "ALL" ||
        metricName.toLowerCase() === metricFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMetric;
    });
  }, [readings, searchQuery, statusFilter, metricFilter]);

  // Distinct metric names for filter dropdown
  const availableMetrics = useMemo(() => {
    const set = new Set();
    readings.forEach((r) => {
      if (r.metricName) set.add(r.metricName);
    });
    return Array.from(set);
  }, [readings]);

  // Key vital metric stats
  const latestVitals = useMemo(() => {
    const map = {};
    readings.forEach((r) => {
      if (r.metricName && !map[r.metricName]) {
        map[r.metricName] = r;
      }
    });
    return map;
  }, [readings]);

  const outOfBoundsCount = useMemo(() => {
    return readings.filter((r) => r.status === "OUT_OF_BOUNDS").length;
  }, [readings]);

  const getMetricIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("heart") || lower.includes("pulse")) return { icon: "♥", className: "icon-heart" };
    if (lower.includes("pressure") || lower.includes("bp")) return { icon: "🩺", className: "icon-bp" };
    if (lower.includes("glucose") || lower.includes("sugar")) return { icon: "🩸", className: "icon-glucose" };
    if (lower.includes("weight") || lower.includes("mass")) return { icon: "⚖", className: "icon-weight" };
    return { icon: "📊", className: "icon-general" };
  };

  return (
    <main className="practitioner-portal-page">
      {/* ========================================
          PAGE HEADER
      ======================================== */}
      <section className="portal-header">
        <div className="portal-header-content">
          <p className="hero-eyebrow">PATIENT HEALTH DATA</p>
          <h1>Patient Health Readings</h1>
          <p>
            Monitor verified biometric measurements and health trends for your
            authorized patients.
          </p>
        </div>

        <div className="portal-header-actions">
          <Link to="/practitioner/grants" className="btn-outline-action">
            👥 Patient Roster
          </Link>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowRequestForm(true)}
          >
            + Request Access
          </button>
        </div>
      </section>

      {/* ========================================
          PATIENT SELECTOR BAR
      ======================================== */}
      {activeGrants.length > 0 ? (
        <section className="patient-selector-card">
          <div className="selector-header">
            <div className="selector-title">
              <span>Authorized Patients</span>
              <span className="selector-badge">{activeGrants.length} Active</span>
            </div>

            {selectedGrant && (
              <Link
                to={`/practitioner/notes?patientProfileId=${selectedGrant.patientProfileId}`}
                className="btn-outline-action"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                📝 Clinical Notes for {selectedGrant.patientName || "Patient"}
              </Link>
            )}
          </div>

          <div className="patient-chips-container">
            {activeGrants.map((grant) => {
              const isSelected = selectedGrant?.id === grant.id;
              const displayName =
                grant.patientName || grant.patientEmail || "Patient";
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <button
                  key={grant.id}
                  type="button"
                  className={`patient-chip ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectPatient(grant)}
                >
                  <div className="patient-chip-avatar">{initial}</div>
                  <div className="patient-chip-info">
                    <span className="patient-chip-name">{displayName}</span>
                    <span className="patient-chip-email">
                      {grant.patientEmail || "Authorized"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : !grantsLoading && (
        <div className="portal-empty-card">
          <div className="portal-empty-icon">👥</div>
          <h3>No Authorized Patients Found</h3>
          <p>
            You currently do not have any patients with active access grants.
            Send an access request to start viewing patient health data.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowRequestForm(true)}
            >
              + Request Patient Access
            </button>
            <Link to="/practitioner/grants" className="btn-outline-action">
              View Access Requests
            </Link>
          </div>
        </div>
      )}

      {/* ========================================
          SELECTED PATIENT DATA WORKSPACE
      ======================================== */}
      {selectedGrant && (
        <>
          {/* Patient Overview Banner */}
          <section className="patient-overview-banner">
            <div className="overview-patient-info">
              <div className="overview-avatar">
                {(selectedGrant.patientName || selectedGrant.patientEmail || "P")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="overview-details">
                <h2>{selectedGrant.patientName || "Patient"}</h2>
                <p>
                  <span>✉ {selectedGrant.patientEmail || "No email"}</span>
                  {selectedGrant.grantedAt && (
                    <span>
                      • Access granted:{" "}
                      {new Date(selectedGrant.grantedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="overview-metrics-summary">
              <div className="overview-stat-badge">
                <span className="stat-badge-value">{readings.length}</span>
                <span className="stat-badge-label">Total Readings</span>
              </div>

              <div className="overview-stat-badge">
                <span
                  className="stat-badge-value"
                  style={{ color: outOfBoundsCount > 0 ? "#f87171" : "#4ade80" }}
                >
                  {outOfBoundsCount}
                </span>
                <span className="stat-badge-label">Out of Bounds</span>
              </div>
            </div>
          </section>

          {/* Quick Metrics Summary Cards */}
          {readings.length > 0 && (
            <section className="metric-summary-grid">
              {Object.entries(latestVitals).slice(0, 4).map(([metricName, reading]) => {
                const meta = getMetricIcon(metricName);
                return (
                  <div key={metricName} className="metric-summary-card">
                    <div className={`metric-card-icon ${meta.className}`}>
                      {meta.icon}
                    </div>
                    <div className="metric-card-body">
                      <span className="metric-card-name">{metricName}</span>
                      <div className="metric-card-val">
                        {reading.numericValue}
                        <span className="metric-card-unit">{reading.unit}</span>
                      </div>
                      <span className="metric-card-time">
                        Latest:{" "}
                        {reading.recordedAt
                          ? new Date(reading.recordedAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Readings Table Card */}
          <section className="readings-table-card">
            <div className="table-filter-bar">
              <div className="filter-left-group">
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search metric or value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="table-select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NORMAL">Normal</option>
                  <option value="OUT_OF_BOUNDS">Out of Bounds</option>
                </select>

                {availableMetrics.length > 1 && (
                  <select
                    className="table-select-filter"
                    value={metricFilter}
                    onChange={(e) => setMetricFilter(e.target.value)}
                  >
                    <option value="ALL">All Metrics</option>
                    {availableMetrics.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="button"
                className="btn-outline-action"
                onClick={handleRefresh}
                disabled={loadingReadings}
              >
                ↻ {loadingReadings ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loadingReadings ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                Loading health readings for {selectedGrant.patientName || "patient"}...
              </div>
            ) : readingsError ? (
              <div style={{ padding: "32px 24px", textAlign: "center", color: "#ef4444" }}>
                {readingsError}
              </div>
            ) : filteredReadings.length === 0 ? (
              <div className="portal-empty-card" style={{ border: "none", padding: "40px" }}>
                <div className="portal-empty-icon">📊</div>
                <h3>No Health Readings Found</h3>
                <p>
                  {readings.length === 0
                    ? "This patient has not logged any biometric readings yet."
                    : "No readings match your search/filter criteria."}
                </p>
              </div>
            ) : (
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Recorded At</th>
                    <th>Source</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((reading) => {
                    const isAlert = reading.status === "OUT_OF_BOUNDS";
                    const meta = getMetricIcon(reading.metricName);

                    return (
                      <tr key={reading.id}>
                        <td>
                          <div className="metric-badge-primary">
                            <span>{meta.icon}</span>
                            <span>{reading.metricName}</span>
                          </div>
                        </td>

                        <td>
                          <span className="reading-val-highlight">
                            {reading.numericValue}
                          </span>
                          <span className="reading-unit">{reading.unit}</span>
                        </td>

                        <td>
                          {reading.recordedAt
                            ? new Date(reading.recordedAt).toLocaleString([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>

                        <td>
                          <span className="source-badge">
                            {reading.source || "MANUAL"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-tag ${
                              isAlert ? "out-of-bounds" : "normal"
                            }`}
                          >
                            {isAlert ? "⚠️ Out of Bounds" : "✓ Normal"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {/* Access Request Form Modal */}
      {showRequestForm && (
        <PractitionerGrantForm onClose={() => setShowRequestForm(false)} />
      )}
    </main>
  );
};

export default PractitionerReadings;
