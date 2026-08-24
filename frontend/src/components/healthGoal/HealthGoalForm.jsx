import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import api from "../api/axios";
import { createGoal, updateGoal } from "../../store/slices/healthGoalSlice";

import "../../styles/HealthGoalForm.css";

const HealthGoalForm = ({ initialData = null, onClose }) => {
  const dispatch = useDispatch();

  const [metrics, setMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [formData, setFormData] = useState({
    metricId: "",
    targetValue: "",
    targetDate: "",
  });

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get("/metrics");

        const data = response.data || [];

        setMetrics(data);

        // For a new goal, automatically select first metric
        if (!initialData && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            metricId: data[0].id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        metricId: initialData.metricId || initialData.metric?.id || "",
        targetValue: initialData.targetValue ?? "",
        targetDate: initialData.targetDate
          ? String(initialData.targetDate).substring(0, 10)
          : "",
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const dto = {
      metricId: Number(formData.metricId),
      targetValue: Number(formData.targetValue),
      targetDate: formData.targetDate,
    };

    if (isEditMode) {
      dispatch(
        updateGoal({
          id: initialData.id,
          dto,
        })
      );
    } else {
      dispatch(createGoal(dto));
    }

    // Requirement: close immediately after dispatch
    onClose();
  };

  return (
    <div className="health-goal-modal-overlay">
      <div className="health-goal-form-modal">
        <div className="health-goal-form-header">
          <div>
            <p className="form-eyebrow">HEALTH GOAL</p>

            <h2>{isEditMode ? "Edit Health Goal" : "Set New Health Goal"}</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="health-goal-form" onSubmit={handleSubmit}>
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
              <option value="">
                {loadingMetrics ? "Loading metrics..." : "Select a metric"}
              </option>

              {metrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name} ({metric.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetValue">Target Value</label>

            <input
              id="targetValue"
              name="targetValue"
              type="number"
              step="0.1"
              placeholder="e.g. 72.0"
              value={formData.targetValue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date</label>

            <input
              id="targetDate"
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="health-goal-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loadingMetrics}
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthGoalForm;
