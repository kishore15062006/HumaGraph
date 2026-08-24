import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchGoals, deleteGoal } from "../../store/slices/healthGoalSlice";

import EmptyState from "../common/EmptyState";
import HealthGoalForm from "./HealthGoalForm";
import CapacityBar from "../common/CapacityBar";

import "../../styles/HealthGoal.css";

const HealthGoalList = () => {
  const dispatch = useDispatch();

  const {
    items: goals = [],
    loading,
    error,
  } = useSelector((state) => state.healthGoals || {});

  const [editingGoal, setEditingGoal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this health goal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteGoal(id)).unwrap();

      setSuccessMessage("HealthGoal deleted successfully");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete health goal:", err);
    }
  };

  const calculateProgress = (goal) => {
    const target = Number(goal.targetValue);
    const current = Number(goal.currentValue);

    if (!target || target <= 0) {
      return 0;
    }

    return Math.min(Math.max((current / target) * 100, 0), 100);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="goals-page-header">
        <div>
          <p className="goals-eyebrow">PERSONAL HEALTH</p>

          <h1>My Health Goals</h1>

          <p>
            Set targets, monitor your progress, and stay consistent with your
            health journey.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setEditingGoal({})}>
          + Set Goal
        </button>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="goal-success-message">
          <span>✓</span>
          {successMessage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="goal-error-message">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="goals-loading">Loading health goals...</div>
      ) : goals.length === 0 ? (
        <EmptyState message="No health goals set yet. Aim high!" />
      ) : (
        <div className="goals-table-card">
          <div className="goals-table-scroll">
            <table className="health-goals-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Target Value</th>
                  <th>Current Value</th>
                  <th>Progress</th>
                  <th>Target Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {goals.map((goal) => {
                  const progress = calculateProgress(goal);

                  const targetDate = new Date(goal.targetDate);

                  const isAchieved = goal.status === "ACHIEVED";

                  return (
                    <tr key={goal.id}>
                      <td>
                        <span className="goal-metric-name">
                          {goal.metricName ||
                            goal.metric?.name ||
                            "Unknown Metric"}
                        </span>
                      </td>

                      <td>
                        <strong>{goal.targetValue}</strong>

                        {goal.metricUnit && (
                          <span className="goal-unit"> {goal.metricUnit}</span>
                        )}
                      </td>

                      <td>
                        <strong>{goal.currentValue}</strong>

                        {goal.metricUnit && (
                          <span className="goal-unit"> {goal.metricUnit}</span>
                        )}
                      </td>

                      <td className="goal-progress-cell">
                        <CapacityBar value={progress} />

                        <span className="goal-progress-text">
                          {Math.round(progress)}%
                        </span>
                      </td>

                      <td>
                        <span className="goal-date">
                          {isNaN(targetDate.getTime())
                            ? goal.targetDate
                            : targetDate.toLocaleDateString()}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isAchieved
                              ? "status-badge status-green"
                              : "status-badge status-amber"
                          }
                        >
                          {goal.status}
                        </span>
                      </td>

                      <td>
                        <div className="goal-actions">
                          <button
                            className="goal-edit-button"
                            onClick={() => setEditingGoal(goal)}
                          >
                            Edit
                          </button>

                          <button
                            className="goal-delete-button"
                            onClick={() => handleDelete(goal.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goal Form */}
      {editingGoal && (
        <HealthGoalForm
          initialData={
            Object.keys(editingGoal).length === 0 ? null : editingGoal
          }
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
};

export default HealthGoalList;
