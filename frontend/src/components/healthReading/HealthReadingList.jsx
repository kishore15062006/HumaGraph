import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchReadings,
  deleteReading,
  setSearchQuery,
  setFilterByStatus,
} from "../../store/slices/healthReadingSlice";

import SearchFilterBar from "../common/SearchFilterBar";
import EmptyState from "../common/EmptyState";
import HealthReadingForm from "./HealthReadingForm";

import "../../styles/HealthComponent.css";

const HealthReadingList = () => {
  const dispatch = useDispatch();

  const {
    items: readings = [],
    searchQuery = "",
    filterByStatus = "ALL",
    loading,
    error,
  } = useSelector((state) => state.healthReadings || {});

  const auth = useSelector((state) => state.auth);

  const [editingReading, setEditingReading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchReadings());
  }, [dispatch]);

  const userRole = auth?.user?.role;

  const isIndividual = userRole === "INDIVIDUAL";
  const isPractitioner = userRole === "PRACTITIONER";

  const filteredItems = useMemo(() => {
    return readings.filter((reading) => {
      const metricName = reading.metricName || "";

      const matchesSearch = metricName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterByStatus === "ALL" || reading.status === filterByStatus;

      return matchesSearch && matchesStatus;
    });
  }, [readings, searchQuery, filterByStatus]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this health reading?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteReading(id)).unwrap();

      setSuccessMessage("HealthReading deleted successfully");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete reading:", err);
    }
  };

  const handleSearchChange = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleStatusChange = (value) => {
    dispatch(setFilterByStatus(value));
  };

  return (
    <section className="health-readings-page">
      {/* Header */}
      <div className="readings-hero">
        <div>
          <p className="readings-eyebrow">HEALTH MONITORING</p>

          <h1>Health Readings</h1>

          <p>Track and manage your latest biometric measurements.</p>
        </div>

        {isIndividual && (
          <button
            className="primary-health-button"
            onClick={() => setEditingReading({})}
          >
            + Add Reading
          </button>
        )}
      </div>

      {/* Success */}
      {successMessage && (
        <div className="health-success-message">
          <span>✓</span>
          {successMessage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="health-error-message">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Search */}
      <SearchFilterBar
        searchQuery={searchQuery}
        filterByStatus={filterByStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Loading */}
      {loading ? (
        <div className="readings-loading">Loading health readings...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState message="No health readings found. Start tracking today!" />
      ) : (
        <div className="readings-table-card">
          <div className="table-scroll">
            <table className="health-readings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Status</th>

                  {isIndividual && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((reading) => {
                  const recordedDate = new Date(reading.recordedAt);

                  return (
                    <tr key={reading.id}>
                      <td>
                        <span className="reading-date">
                          {isNaN(recordedDate.getTime())
                            ? reading.recordedAt
                            : recordedDate.toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <span className="metric-name">
                          {reading.metricName}
                        </span>
                      </td>

                      <td>
                        <span className="reading-value">
                          {reading.numericValue}
                        </span>

                        <span className="reading-unit">{reading.unit}</span>
                      </td>

                      <td>
                        <span className="source-badge">{reading.source}</span>
                      </td>

                      <td>
                        <span
                          className={
                            reading.status === "OUT_OF_BOUNDS"
                              ? "status-badge status-red"
                              : "status-badge status-green"
                          }
                        >
                          {reading.status === "OUT_OF_BOUNDS"
                            ? "OUT OF BOUNDS"
                            : "NORMAL"}
                        </span>
                      </td>

                      {isIndividual && (
                        <td>
                          <div className="reading-actions">
                            <button
                              className="reading-edit-button"
                              onClick={() => setEditingReading(reading)}
                            >
                              Edit
                            </button>

                            <button
                              className="reading-delete-button"
                              onClick={() => handleDelete(reading.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isPractitioner && (
            <div className="read-only-note">
              Practitioner view is read-only.
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {editingReading && isIndividual && (
        <HealthReadingForm
          initialData={
            Object.keys(editingReading).length === 0 ? null : editingReading
          }
          onClose={() => setEditingReading(null)}
        />
      )}
    </section>
  );
};

export default HealthReadingList;
