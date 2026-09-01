import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { requestAccess, fetchGrants } from "../../store/slices/practitionerGrantSlice";

import "../../styles/PractitionerGrantForm.css";

const PractitionerGrantForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const [patientEmail, setPatientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedEmail = patientEmail.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter a valid patient email address.");
      return;
    }

    try {
      setLoading(true);

      const resultAction = await dispatch(
        requestAccess({ patientEmail: trimmedEmail })
      );

      if (requestAccess.fulfilled.match(resultAction)) {
        dispatch(fetchGrants());
        onClose();
      } else if (requestActionIsRejected(resultAction)) {
        setErrorMessage(
          resultAction.payload ||
            resultAction.error?.message ||
            "Failed to send access request."
        );
      }
    } catch (error) {
      console.error("Failed to send access request:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to send access request"
      );
    } finally {
      setLoading(false);
    }
  };

  const requestActionIsRejected = (action) => {
    return requestAccess.rejected.match(action);
  };

  return (
    <div className="grant-form-overlay">
      <div className="grant-form-modal">
        <div className="grant-form-header">
          <div>
            <p className="page-eyebrow">PATIENT ACCESS</p>

            <h2>Request Patient Access</h2>

            <p>
              Send a secure request to access a patient's health information.
            </p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form className="grant-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              className="grant-form-error-banner"
              style={{
                color: "#f87171",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                lineHeight: "1.4",
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="patientEmail">Patient Email</label>

            <input
              id="patientEmail"
              type="email"
              placeholder="patient@example.com"
              value={patientEmail}
              onChange={(event) => setPatientEmail(event.target.value)}
              required
              disabled={loading}
            />

            <span className="form-help">
              Enter the email address associated with the patient's HumaGraph
              account.
            </span>
          </div>

          <div className="grant-form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PractitionerGrantForm;
