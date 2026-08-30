import React from "react";
import "./common.css" 

const CapacityBar = ({
  current = 0,
  capacity = 100,
  label = "Capacity",
  showValues = true,
}) => {
  const safeCurrent = Number(current) || 0;
  const safeCapacity = Number(capacity) || 0;

  const percentage =
    safeCapacity > 0
      ? Math.min((safeCurrent / safeCapacity) * 100, 100)
      : 0;

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
              {safeCurrent.toLocaleString()} /{" "}
              {safeCapacity.toLocaleString()}
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
            {Math.max(safeCapacity - safeCurrent, 0).toLocaleString()}{" "}
            remaining
          </span>
        )}
      </div>
    </div>
  );
};

export default CapacityBar;