import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import { fetchGrants } from "../../store/slices/practitionerGrantSlice";
import practitionerGrantService from "../../services/practitionerGrantService";
import PractitionerGrantForm from "./PractitionerGrantForm";

import "../../styles/PractitionerPortal.css";

const CLINICAL_PRESETS = [
  {
    label: "Routine Vitals Normal",
    text: "Routine check-up completed. Vital signs and biometric readings are within normal parameters. Continue current dietary and physical activity routine.",
  },
  {
    label: "Cardiovascular Guidance",
    text: "Please maintain a daily log of morning and evening blood pressure measurements. Reduce sodium intake and engage in 30 minutes of moderate cardio daily.",
  },
  {
    label: "Glycemic Monitoring",
    text: "Target fasting blood glucose below 100 mg/dL and post-prandial below 140 mg/dL. Ensure proper hydration and record readings around meal times.",
  },
  {
    label: "Schedule Follow-up",
    text: "Recommended follow-up review in 4 weeks. Please record regular readings in HumaGraph prior to our next consultation.",
  },
];

const PractitionerNotes = () => {
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
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [notesFilter, setNotesFilter] = useState("ALL"); // ALL, WITH_NOTES, NO_NOTES

  // Modal
  const [showRequestForm, setShowRequestForm] = useState(false);

  // 1. Fetch grants
  useEffect(() => {
    dispatch(fetchGrants());
  }, [dispatch]);

  // 2. Select patient from query param or first active patient
  useEffect(() => {
    if (activeGrants.length === 0) {
      setSelectedGrant(null);
      setNoteContent("");
      return;
    }

    const patientParamId = searchParams.get("patientProfileId");
    if (patientParamId) {
      const matched = activeGrants.find(
        (g) => String(g.patientProfileId) === String(patientParamId)
      );
      if (matched) {
        setSelectedGrant(matched);
        setNoteContent(matched.clinicalNote || "");
        return;
      }
    }

    // Default to first active grant
    if (!selectedGrant || !activeGrants.some((g) => g.id === selectedGrant.id)) {
      setSelectedGrant(activeGrants[0]);
      setNoteContent(activeGrants[0].clinicalNote || "");
    }
  }, [activeGrants, searchParams, selectedGrant]);

  const handleSelectPatient = (grant) => {
    setSelectedGrant(grant);
    setNoteContent(grant.clinicalNote || "");
    setSaveSuccess(false);
    setSaveError("");
    if (grant.patientProfileId) {
      setSearchParams({ patientProfileId: grant.patientProfileId });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedGrant) return;

    try {
      setIsSaving(true);
      setSaveError("");
      setSaveSuccess(false);

      const trimmed = noteContent.trim();
      if (trimmed.length > 1000) {
        setSaveError("Clinical advice cannot exceed 1000 characters.");
        return;
      }

      await practitionerGrantService.updateNote(selectedGrant.id, trimmed);

      // Refresh grants from server
      await dispatch(fetchGrants()).unwrap();

      // Update local state
      setSelectedGrant((prev) =>
        prev ? { ...prev, clinicalNote: trimmed } : null
      );

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to save clinical note:", err);
      setSaveError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to save clinical note."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (presetText) => {
    if (noteContent && !noteContent.endsWith("\n") && !noteContent.endsWith(" ")) {
      setNoteContent((prev) => `${prev}\n\n${presetText}`);
    } else if (noteContent) {
      setNoteContent((prev) => `${prev}${presetText}`);
    } else {
      setNoteContent(presetText);
    }
  };

  const handleDiscard = () => {
    if (!selectedGrant) return;
    setNoteContent(selectedGrant.clinicalNote || "");
    setSaveError("");
  };

  // Filtered patients for sidebar list
  const filteredRoster = useMemo(() => {
    return activeGrants.filter((grant) => {
      const name = grant.patientName || "";
      const email = grant.patientEmail || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());

      const hasNote = Boolean(grant.clinicalNote && grant.clinicalNote.trim());
      const matchesNotesFilter =
        notesFilter === "ALL" ||
        (notesFilter === "WITH_NOTES" && hasNote) ||
        (notesFilter === "NO_NOTES" && !hasNote);

      return matchesSearch && matchesNotesFilter;
    });
  }, [activeGrants, searchTerm, notesFilter]);

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedGrant) return false;
    return (selectedGrant.clinicalNote || "") !== noteContent;
  }, [selectedGrant, noteContent]);

  return (
    <main className="practitioner-portal-page">
      {/* ========================================
          PAGE HEADER
      ======================================== */}
      <section className="portal-header">
        <div className="portal-header-content">
          <p className="hero-eyebrow">CLINICAL MANAGEMENT</p>
          <h1>Clinical Notes & Advice</h1>
          <p>
            Write and share clinical observations, recommendations, and
            actionable guidance directly with your patients.
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
          WORKSPACE: ROSTER & EDITOR
      ======================================== */}
      {activeGrants.length > 0 ? (
        <section className="notes-workspace-grid">
          {/* LEFT: Patient Roster Column */}
          <div className="roster-sidebar-card">
            <div className="roster-sidebar-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h3>Active Patients ({activeGrants.length})</h3>
              </div>

              <input
                type="text"
                className="roster-search-input"
                placeholder="Search patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  className={`template-pill-btn ${
                    notesFilter === "ALL" ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      notesFilter === "ALL" ? "#eff6ff" : "transparent",
                    color: notesFilter === "ALL" ? "#2563eb" : "#64748b",
                    fontWeight: notesFilter === "ALL" ? "600" : "500",
                  }}
                  onClick={() => setNotesFilter("ALL")}
                >
                  All ({activeGrants.length})
                </button>
                <button
                  type="button"
                  className={`template-pill-btn ${
                    notesFilter === "WITH_NOTES" ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      notesFilter === "WITH_NOTES" ? "#eff6ff" : "transparent",
                    color:
                      notesFilter === "WITH_NOTES" ? "#2563eb" : "#64748b",
                    fontWeight: notesFilter === "WITH_NOTES" ? "600" : "500",
                  }}
                  onClick={() => setNotesFilter("WITH_NOTES")}
                >
                  With Advice
                </button>
                <button
                  type="button"
                  className={`template-pill-btn ${
                    notesFilter === "NO_NOTES" ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      notesFilter === "NO_NOTES" ? "#eff6ff" : "transparent",
                    color:
                      notesFilter === "NO_NOTES" ? "#2563eb" : "#64748b",
                    fontWeight: notesFilter === "NO_NOTES" ? "600" : "500",
                  }}
                  onClick={() => setNotesFilter("NO_NOTES")}
                >
                  No Advice
                </button>
              </div>
            </div>

            <div className="roster-list">
              {filteredRoster.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  No patients match your search.
                </div>
              ) : (
                filteredRoster.map((grant) => {
                  const isSelected = selectedGrant?.id === grant.id;
                  const displayName =
                    grant.patientName || grant.patientEmail || "Patient";
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={grant.id}
                      className={`roster-item ${isSelected ? "active" : ""}`}
                      onClick={() => handleSelectPatient(grant)}
                    >
                      <div className="roster-item-avatar">{initial}</div>
                      <div className="roster-item-info">
                        <div className="roster-item-name">{displayName}</div>
                        <div className="roster-item-email">
                          {grant.patientEmail || "Authorized"}
                        </div>
                        {grant.clinicalNote ? (
                          <span
                            className="roster-item-note-preview"
                            title={grant.clinicalNote}
                          >
                            📝 {grant.clinicalNote}
                          </span>
                        ) : (
                          <span
                            className="roster-item-note-preview"
                            style={{ fontStyle: "italic", color: "#94a3b8" }}
                          >
                            + Add clinical advice...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Note Editor Workspace */}
          {selectedGrant ? (
            <div className="note-editor-card">
              {/* Header */}
              <div className="note-editor-header">
                <div className="note-editor-patient-title">
                  <div className="editor-avatar">
                    {(selectedGrant.patientName || selectedGrant.patientEmail || "P")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="editor-patient-details">
                    <h2>{selectedGrant.patientName || "Patient"}</h2>
                    <p>
                      {selectedGrant.patientEmail && (
                        <span>{selectedGrant.patientEmail} • </span>
                      )}
                      {selectedGrant.grantedAt && (
                        <span>
                          Connected since{" "}
                          {new Date(selectedGrant.grantedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/practitioner/readings?patientProfileId=${selectedGrant.patientProfileId}`}
                  className="btn-outline-action"
                >
                  ♥ View Health Readings
                </Link>
              </div>

              {/* Success Notification */}
              {saveSuccess && (
                <div className="note-saved-toast">
                  ✓ Clinical advice saved successfully! Patient can now view this in their portal.
                </div>
              )}

              {/* Error Message */}
              {saveError && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    color: "#b91c1c",
                    fontSize: "13px",
                  }}
                >
                  {saveError}
                </div>
              )}

              {/* Quick Presets Section */}
              <div className="quick-templates-section">
                <span className="quick-templates-label">Quick Clinical Guidance Presets:</span>
                <div className="templates-pill-group">
                  {CLINICAL_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="template-pill-btn"
                      onClick={() => handleApplyPreset(preset.text)}
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                className="clinical-textarea"
                placeholder="Enter clinical observations, guidance, lifestyle recommendations, diet/exercise notes, or medications..."
                value={noteContent}
                onChange={(e) => {
                  setNoteContent(e.target.value);
                  setSaveSuccess(false);
                }}
                maxLength={1000}
                rows={8}
              />

              {/* Editor Footer */}
              <div className="note-editor-footer">
                <div className="char-counter">
                  <span>{noteContent.length} / 1000 characters</span>
                  {hasUnsavedChanges && (
                    <span style={{ color: "#d97706", marginLeft: "10px" }}>
                      • Unsaved changes
                    </span>
                  )}
                </div>

                <div className="editor-button-group">
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      className="btn-outline-action"
                      onClick={handleDiscard}
                      disabled={isSaving}
                    >
                      Discard
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-save-note"
                    onClick={handleSaveNote}
                    disabled={isSaving || !hasUnsavedChanges}
                  >
                    {isSaving ? "Saving..." : "Save Clinical Advice"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="portal-empty-card">
              <div className="portal-empty-icon">📝</div>
              <h3>Select a Patient</h3>
              <p>Choose an authorized patient from the list on the left to write or edit clinical advice.</p>
            </div>
          )}
        </section>
      ) : !grantsLoading && (
        <div className="portal-empty-card">
          <div className="portal-empty-icon">👥</div>
          <h3>No Authorized Patients Found</h3>
          <p>
            You currently do not have any patients with active access grants.
            Request access to a patient to begin providing clinical advice.
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

      {/* Access Request Modal */}
      {showRequestForm && (
        <PractitionerGrantForm onClose={() => setShowRequestForm(false)} />
      )}
    </main>
  );
};

export default PractitionerNotes;
