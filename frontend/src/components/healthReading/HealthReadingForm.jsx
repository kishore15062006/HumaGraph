import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  createReading,
  updateReading,
} from "../../store/slices/healthReadingSlice";
import api from "../../services/api";

import "../../styles/HealthForm.css";

const HealthReadingForm = ({ initialData, onClose }) => {
  const dispatch = useDispatch();

  const [metrics, setMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [formData, setFormData] = useState({
    metricId: "",
    numericValue: "",
    recordedAt: new Date().toISOString().slice(0, 16),
    source: "MANUAL",
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await api.get("/metrics");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        setMetrics(data);

        if (!initialData && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            metricId: data[0].id,
          }));
        }
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadMetrics();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        metricId: initialData.metricId || initialData.metric?.id || "",
        numericValue: initialData.numericValue ?? initialData.value ?? "",
        recordedAt: initialData.recordedAt
          ? new Date(initialData.recordedAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        source: initialData.source || "MANUAL",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dto = {
      metricId: Number(formData.metricId),
      numericValue: Number(formData.numericValue),
      recordedAt: formData.recordedAt,
      source: formData.source,
    };

    if (isEditMode) {
      dispatch(
        updateReading({
          id: initialData.id,
          dto,
        })
      );

      onClose();
      return;
    }

    dispatch(createReading(dto));

    onClose();
  };

  return (
    <div className="health-modal-overlay">
      <div className="health-form-modal">
        <div className="health-form-header">
          <div>
            <p className="form-eyebrow">HEALTH MONITORING</p>

            <h2>{isEditMode ? "Edit Health Reading" : "Add Health Reading"}</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="health-reading-form" onSubmit={handleSubmit}>
          {/* Metric */}
          <div className="form-group">
            <label htmlFor="metricSelect">Select Metric</label>

            <select
              id="metricSelect"
              name="metricId"
              value={formData.metricId}
              onChange={handleChange}
              required
              disabled={loadingMetrics}
            >
              {loadingMetrics ? (
                <option value="">Loading metrics...</option>
              ) : (
                <>
                  <option value="">Select a metric</option>

                  {metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name} ({metric.unit})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Value */}
          <div className="form-group">
            <label htmlFor="numericValue">Value</label>

            <input
              id="numericValue"
              name="numericValue"
              type="number"
              step="0.1"
              placeholder="e.g. 75.5"
              value={formData.numericValue}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="recordedAt">Date & Time</label>

            <input
              id="recordedAt"
              name="recordedAt"
              type="datetime-local"
              value={formData.recordedAt}
              onChange={handleChange}
              required
            />
          </div>

          {/* Source */}
          <div className="form-group">
            <label htmlFor="source">Source</label>

            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="MANUAL">Manual Entry</option>

              <option value="DEVICE">Wearable Device</option>
            </select>
          </div>

          {/* Actions */}
          <div className="health-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthReadingForm;
