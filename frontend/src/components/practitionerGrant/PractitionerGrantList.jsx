import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchGrants,
  updateGrantStatus,
  deleteGrant,
} from "../../store/slices/practitionerGrantSlice";

import practitionerGrantService from "../../services/practitionerGrantService";
import healthReadingService from "../../services/healthReadingService";

import PractitionerGrantForm from "./PractitionerGrantForm";

import "../../styles/PractitionerGrantList.css";

const PractitionerGrantList = () => {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const grants = useSelector((state) => state.practitionerGrant?.grants || []);

  const user = auth?.user;

  const isPractitioner = user?.role === "PRACTITIONER";
  const isIndividual = user?.role === "INDIVIDUAL";

  const [showForm, setShowForm] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReadings, setPatientReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(false);

  useEffect(() => {
    dispatch(fetchGrants());
  }, [dispatch]);

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-green";

      case "REQUESTED":
        return "status-amber";

      case "REVOKED":
        return "status-red";

      default:
        return "status-neutral";
    }
  };

  const getDisplayName = (grant) => {
    if (isIndividual) {
      return (
        grant.practitionerName || grant.practitionerEmail || "Practitioner"
      );
    }

    return grant.patientName || grant.patientEmail || "Patient";
  };

  const getGrantedDate = (grant) => {
    if (!grant.grantedAt) {
      return "—";
    }

    return new Date(grant.grantedAt).toLocaleString();
  };

  const handleApprove = (id) => {
    dispatch(
      updateGrantStatus({
        id,
        status: "ACTIVE",
      })
    );
  };

  const handleRevoke = (id) => {
    dispatch(
      updateGrantStatus({
        id,
        status: "REVOKED",
      })
    );
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this access grant?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(deleteGrant(id));
  };

  const startNoteEdit = (grant) => {
    setEditingNoteId(grant.id);
    setNoteText(grant.clinicalNote || "");
  };

  const cancelNoteEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  const saveClinicalNote = async (id) => {
    try {
      await practitionerGrantService.updateNote(id, noteText);

      setEditingNoteId(null);
      setNoteText("");

      dispatch(fetchGrants());
    } catch (error) {
      console.error("Failed to update clinical note:", error);

      alert(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to update clinical note"
      );
    }
  };

  const handleViewData = async (grant) => {
    try {
      setLoadingReadings(true);

      const profileId = grant.patientProfileId || grant.patientProfile?.id;

      if (!profileId) {
        alert("Patient profile ID not available.");
        return;
      }

      const response = await healthReadingService.getPatientReadings(profileId);

      const readings = response?.data !== undefined ? response.data : response;

      setPatientReadings(readings || []);
      setSelectedPatient(grant);
    } catch (error) {
      console.error("Failed to fetch patient readings:", error);

      alert(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to load patient readings"
      );
    } finally {
      setLoadingReadings(false);
    }
  };

  const handleRequestAgain = async (grant) => {
    try {
      const patientEmail = grant.patientEmail || grant.patient?.email;

      if (!patientEmail) {
        alert("Patient email not available.");
        return;
      }

      await practitionerGrantService.requestAccess(patientEmail);

      dispatch(fetchGrants());
    } catch (error) {
      console.error("Failed to request access again:", error);

      alert(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to request access"
      );
    }
  };

  const renderActions = (grant) => {
    const status = grant.status;

    if (isIndividual) {
      if (status === "REQUESTED") {
        return (
          <button
            className="grant-action grant-approve"
            onClick={() => handleApprove(grant.id)}
          >
            Approve
          </button>
        );
      }

      if (status === "ACTIVE") {
        return (
          <button
            className="grant-action grant-revoke"
            onClick={() => handleRevoke(grant.id)}
          >
            Revoke
          </button>
        );
      }

      if (status === "REVOKED") {
        return (
          <button
            className="grant-action grant-remove"
            onClick={() => handleDelete(grant.id)}
          >
            Remove
          </button>
        );
      }
    }

    if (isPractitioner) {
      if (status === "ACTIVE") {
        return (
          <button
            className="grant-action grant-view"
            onClick={() => handleViewData(grant)}
          >
            View Data
          </button>
        );
      }

      if (status === "REVOKED") {
        return (
          <div className="grant-action-group">
            <button
              className="grant-action grant-request"
              onClick={() => handleRequestAgain(grant)}
            >
              Request Again
            </button>

            <button
              className="grant-action grant-remove"
              onClick={() => handleDelete(grant.id)}
            >
              Remove
            </button>
          </div>
        );
      }

      if (status === "REQUESTED") {
        return (
          <button
            className="grant-action grant-remove"
            onClick={() => handleDelete(grant.id)}
          >
            Cancel Request
          </button>
        );
      }
    }

    return null;
  };

  return (
    <div className="page-container practitioner-grants-page">
      <div className="grants-page-header">
        <div>
          <p className="page-eyebrow">ACCESS MANAGEMENT</p>

          <h1>{isIndividual ? "Practitioner Access" : "Patient Roster"}</h1>

          <p className="page-description">
            {isIndividual
              ? "Manage healthcare practitioners who can access your health information."
              : "Manage patient access requests and securely view authorized health data."}
          </p>
        </div>

        {isPractitioner && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Request Access
          </button>
        )}
      </div>

      <div className="grant-summary-card">
        <div className="grant-summary-icon">{isPractitioner ? "P" : "A"}</div>

        <div>
          <span className="grant-summary-label">
            {isPractitioner ? "Connected Patients" : "Authorized Practitioners"}
          </span>

          <strong className="grant-summary-value">{grants.length}</strong>
        </div>
      </div>

      <div className="grant-table-card">
        <div className="grant-table-header">
          <div>
            <h2>{isPractitioner ? "Patient Access" : "Access Requests"}</h2>

            <span>Manage your secure healthcare connections</span>
          </div>
        </div>

        {grants.length === 0 ? (
          <div className="grant-empty-state">
            <div className="empty-icon">◌</div>

            <h3>No access grants found</h3>

            <p>
              {isPractitioner
                ? "Request access to a patient to start viewing their health information."
                : "Practitioner access requests will appear here."}
            </p>
          </div>
        ) : (
          <div className="grant-table-wrapper">
            <table className="grant-table">
              <thead>
                <tr>
                  <th>{isIndividual ? "Practitioner" : "Patient"}</th>

                  <th>Status</th>

                  <th>Clinical Advice</th>

                  <th>Granted At</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {grants.map((grant) => (
                  <tr key={grant.id}>
                    <td>
                      <div className="grant-person">
                        <div className="person-avatar">
                          {getDisplayName(grant).charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{getDisplayName(grant)}</strong>

                          {(grant.patientEmail || grant.practitionerEmail) && (
                            <small>
                              {isIndividual
                                ? grant.practitionerEmail
                                : grant.patientEmail}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          grant.status
                        )}`}
                      >
                        {grant.status}
                      </span>
                    </td>

                    <td>
                      {isPractitioner ? (
                        editingNoteId === grant.id ? (
                          <div className="note-editor">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add clinical advice..."
                              rows="3"
                            />

                            <div className="note-actions">
                              <button
                                className="note-save"
                                onClick={() => saveClinicalNote(grant.id)}
                              >
                                Save
                              </button>

                              <button
                                className="note-cancel"
                                onClick={cancelNoteEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="clinical-note-display"
                            onClick={() => startNoteEdit(grant)}
                            title="Click to edit"
                          >
                            {grant.clinicalNote || "Add clinical advice..."}
                          </button>
                        )
                      ) : (
                        <span className="clinical-note-readonly">
                          {grant.clinicalNote || "No clinical advice"}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="granted-date">
                        {getGrantedDate(grant)}
                      </span>
                    </td>

                    <td>
                      <div className="grant-actions">
                        {renderActions(grant)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <PractitionerGrantForm onClose={() => setShowForm(false)} />}

      {selectedPatient && (
        <div className="patient-viewer-overlay">
          <div className="patient-viewer-modal">
            <div className="patient-viewer-header">
              <div>
                <p className="page-eyebrow">AUTHORIZED HEALTH DATA</p>

                <h2>{getDisplayName(selectedPatient)}</h2>

                <p>Patient health readings</p>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedPatient(null)}
              >
                ×
              </button>
            </div>

            <div className="patient-reading-content">
              {loadingReadings ? (
                <div className="reading-loading">
                  Loading patient readings...
                </div>
              ) : patientReadings.length === 0 ? (
                <div className="reading-empty">
                  No health readings available.
                </div>
              ) : (
                <div className="patient-reading-table-wrapper">
                  <table className="patient-reading-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Recorded At</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {patientReadings.map((reading) => (
                        <tr key={reading.id}>
                          <td>
                            <strong>{reading.metricName}</strong>
                          </td>

                          <td>
                            {reading.numericValue} {reading.unit}
                          </td>

                          <td>
                            {reading.recordedAt
                              ? new Date(reading.recordedAt).toLocaleString()
                              : "—"}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                reading.status === "NORMAL"
                                  ? "status-green"
                                  : "status-red"
                              }`}
                            >
                              {reading.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="patient-viewer-footer">
              <button
                className="btn-secondary"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PractitionerGrantList;
