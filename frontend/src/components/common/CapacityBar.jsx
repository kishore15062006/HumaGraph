import React from "react";
import "./common.css";

const CapacityBar = ({
  value,
  current,
  capacity,
  label = null,
  showValues = false,
  compact = false,
}) => {
  let percentage = 0;
  let safeCurrent = 0;
  let safeCapacity = 100;

  if (value !== undefined && value !== null) {
    percentage = Math.min(Math.max(Number(value) || 0, 0), 100);
    safeCurrent = Number(current) || Math.round(percentage);
    safeCapacity = Number(capacity) || 100;
  } else {
    safeCurrent = Number(current) || 0;
    safeCapacity = Number(capacity) || 100;
    percentage =
      safeCapacity > 0
        ? Math.min(Math.max((safeCurrent / safeCapacity) * 100, 0), 100)
        : 0;
  }

  const getProgressColor = () => {
    if (percentage >= 100) return "#16a34a"; // Green
    if (percentage >= 50) return "#2563eb";  // Blue
    if (percentage > 0) return "#d97706";   // Amber
    return "#94a3b8";                        // Slate
  };

  // Compact rendering for tables
  if (compact || !label) {
    return (
      <div
        className="capacity-track"
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#e2e8f0",
          borderRadius: "999px",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="capacity-fill"
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: getProgressColor(),
            borderRadius: "inherit",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    );
  }

  const getStatus = () => {
    if (percentage >= 90) {
      return {
        className: "capacity-danger",
        text: "Critical",
      };
    }

    if (percentage >= 75) {
      return {
        className: "capacity-warning",
        text: "High",
      };
    }

    return {
      className: "capacity-safe",
      text: "Available",
    };
  };

  const status = getStatus();

  return (
    <div className="capacity-container">
      <div className="capacity-header">
        <div>
          <span className="capacity-label">{label}</span>

          {showValues && (
            <span className="capacity-values">
              {safeCurrent.toLocaleString()} / {safeCapacity.toLocaleString()}
            </span>
          )}
        </div>

        <span className={`capacity-status ${status.className}`}>
          {status.text}
        </span>
      </div>

      <div
        className="capacity-track"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${label} usage`}
      >
        <div
          className={`capacity-fill ${status.className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="capacity-footer">
        <span>{Math.round(percentage)}% used</span>

        {showValues && (
          <span>
            {Math.max(safeCapacity - safeCurrent, 0).toLocaleString()} remaining
          </span>
        )}
      </div>
    </div>
  );
};

export default CapacityBar;