import React, { useState } from "react";
import { useDispatch } from "react-redux";

import practitionerGrantService from "../../services/practitionerGrantService";
import { fetchGrants } from "../../store/slices/practitionerGrantSlice";

import "../styles/PractitionerGrantForm.css";

const PractitionerGrantForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const [patientEmail, setPatientEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patientEmail.trim()) {
      return;
    }

    try {
      setLoading(true);

      await practitionerGrantService.requestAccess(patientEmail.trim());

      dispatch(fetchGrants());

      onClose();
    } catch (error) {
      console.error("Failed to send access request:", error);

      alert(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to send access request"
      );
    } finally {
      setLoading(false);
    }
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
