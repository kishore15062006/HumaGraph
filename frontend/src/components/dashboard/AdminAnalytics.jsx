import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../../styles/AdminAnalytics.css";

const ROLE_COLORS = {
  Patients: "#3b82f6",
  Practitioners: "#10b981",
  Administrators: "#8b5cf6",
};

const GRANT_COLORS = {
  Active: "#10b981",
  Requested: "#f59e0b",
  Revoked: "#ef4444",
};

const GOAL_COLORS = {
  Achieved: "#10b981",
  "In Progress": "#3b82f6",
  Failed: "#ef4444",
};

const CATEGORY_COLORS = {
  CARDIO: "#ef4444",
  METABOLIC: "#f59e0b",
  FITNESS: "#10b981",
  SLEEP: "#8b5cf6",
};

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

/* =========================================================
   1. NATIVE SVG DONUT CHART (React 19 Compatible)
   ========================================================= */
const DonutChart = ({ data, size = 200, strokeWidth = 28, centerLabel = "Total", centerValue }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = useMemo(() => data.reduce((acc, cur) => acc + (Number(cur.value) || 0), 0), [data]);

  const radius = size / 2 - 12;
  const innerRadius = radius - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <div className="chart-empty-state">
        <div className="empty-icon">👥</div>
        <h4 className="empty-title">No records available</h4>
        <p className="empty-desc">Data registered in the database will appear here.</p>
      </div>
    );
  }

  let accumulatedAngle = -Math.PI / 2;
  const validSlices = data.filter((d) => (Number(d.value) || 0) > 0);

  const slices = validSlices.map((item) => {
    const sliceAngle = (Number(item.value) / total) * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle = endAngle;

    const isFullCircle = validSlices.length === 1 || sliceAngle >= 2 * Math.PI - 0.001;

    let pathData;
    if (isFullCircle) {
      pathData = `
        M ${cx} ${cy - radius}
        A ${radius} ${radius} 0 1 0 ${cx} ${cy + radius}
        A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius}
        M ${cx} ${cy - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy + innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy - innerRadius}
        Z
      `;
    } else {
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const ix1 = cx + innerRadius * Math.cos(endAngle);
      const iy1 = cy + innerRadius * Math.sin(endAngle);
      const ix2 = cx + innerRadius * Math.cos(startAngle);
      const iy2 = cy + innerRadius * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
        Z
      `;
    }

    return {
      ...item,
      pathData,
      color: item.color || "#3b82f6",
      percentage: Math.round((Number(item.value) / total) * 100),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth={validSlices.length > 1 ? 2 : 0}
              style={{
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.2s",
                opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.6,
                transform: hoveredIndex === idx ? "scale(1.03)" : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {hoveredIndex !== null ? slices[hoveredIndex]?.value : (centerValue !== undefined ? centerValue : total)}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "3px" }}>
            {hoveredIndex !== null ? slices[hoveredIndex]?.name : centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginTop: "12px", fontSize: "12px" }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              opacity: hoveredIndex === null || (validSlices[hoveredIndex]?.name === item.name) ? 1 : 0.5,
              transition: "opacity 0.15s",
            }}
          >
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: item.color }} />
            <span style={{ color: "#475569", fontWeight: 600 }}>{item.name}:</span>
            <strong style={{ color: "#0f172a" }}>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   2. NATIVE SVG AREA TIMELINE CHART (React 19 Compatible)
   ========================================================= */
const AreaTimelineChart = ({ data, height = 240 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = useMemo(() => {
    const highest = Math.max(...data.map((d) => Math.max(Number(d.normal) || 0, Number(d.outOfBounds) || 0)), 0);
    return Math.max(highest + 1, 4);
  }, [data]);

  const width = 540;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const pointsNormal = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = paddingTop + chartH - ((Number(d.normal) || 0) / maxVal) * chartH;
    return { x, y, val: Number(d.normal) || 0, date: d.date };
  });

  const pointsAlert = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = paddingTop + chartH - ((Number(d.outOfBounds) || 0) / maxVal) * chartH;
    return { x, y, val: Number(d.outOfBounds) || 0, date: d.date };
  });

  const pathNormal = pointsNormal.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaNormal = `${pathNormal} L ${paddingLeft + chartW} ${paddingTop + chartH} L ${paddingLeft} ${paddingTop + chartH} Z`;

  const pathAlert = pointsAlert.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaAlert = `${pathAlert} L ${paddingLeft + chartW} ${paddingTop + chartH} L ${paddingLeft} ${paddingTop + chartH} Z`;

  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id="svgGradNormal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="svgGradAlert" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines and Y labels */}
        {yTicks.map((tick, i) => {
          const yPos = paddingTop + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={paddingLeft + chartW}
                y2={yPos}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text x={paddingLeft - 8} y={yPos + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Normal Area & Line */}
        <path d={areaNormal} fill="url(#svgGradNormal)" />
        <path d={pathNormal} fill="none" stroke="#10b981" strokeWidth="2.5" />

        {/* Alert Area & Line */}
        <path d={areaAlert} fill="url(#svgGradAlert)" />
        <path d={pathAlert} fill="none" stroke="#ef4444" strokeWidth="2.5" />

        {/* Points & X-Labels */}
        {data.map((d, i) => {
          const pN = pointsNormal[i];
          const pA = pointsAlert[i];
          return (
            <g key={i}>
              {/* X Date Label */}
              <text
                x={pN.x}
                y={paddingTop + chartH + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                fontWeight="500"
              >
                {d.date}
              </text>

              {/* Normal Point Dot */}
              <circle
                cx={pN.x}
                cy={pN.y}
                r="4"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Alert Point Dot */}
              <circle
                cx={pA.x}
                cy={pA.y}
                r="4"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Tooltip on Hover */}
              {hoveredIdx === i && (
                <g pointerEvents="none">
                  <rect
                    x={Math.max(10, Math.min(pN.x - 55, width - 120))}
                    y={Math.min(pN.y, pA.y) - 34}
                    width="110"
                    height="28"
                    rx="6"
                    ry="6"
                    fill="#1e293b"
                    opacity="0.95"
                  />
                  <text
                    x={Math.max(10, Math.min(pN.x - 55, width - 120)) + 55}
                    y={Math.min(pN.y, pA.y) - 16}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {`Norm: ${d.normal || 0} | Alert: ${d.outOfBounds || 0}`}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "8px", fontSize: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "4px", borderRadius: "2px", backgroundColor: "#10b981" }} />
          <span style={{ color: "#475569", fontWeight: 600 }}>Normal Readings</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "4px", borderRadius: "2px", backgroundColor: "#ef4444" }} />
          <span style={{ color: "#475569", fontWeight: 600 }}>Out of Bounds Alerts</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   3. NATIVE SVG COLUMN BAR CHART (React 19 Compatible)
   ========================================================= */
const ColumnBarChart = ({ data, dataKey = "count", nameKey = "name", height = 240 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = useMemo(() => {
    const highest = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 0);
    return Math.max(highest + 1, 4);
  }, [data, dataKey]);

  const width = 540;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const barSlotWidth = chartW / Math.max(data.length, 1);
  const barWidth = Math.min(barSlotWidth * 0.45, 52);

  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        {/* Horizontal Grid lines and Y labels */}
        {yTicks.map((tick, i) => {
          const yPos = paddingTop + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={paddingLeft + chartW}
                y2={yPos}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text x={paddingLeft - 8} y={yPos + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const val = Number(item[dataKey]) || 0;
          const barH = (val / maxVal) * chartH;
          const x = paddingLeft + i * barSlotWidth + (barSlotWidth - barWidth) / 2;
          const y = paddingTop + chartH - barH;
          const color = item.color || item.fill || "#3b82f6";
          const label = item[nameKey] ? String(item[nameKey]).replace(/_/g, " ") : "";

          return (
            <g key={i}>
              {/* Bar Rect */}
              <rect
                x={x}
                y={val > 0 ? y : paddingTop + chartH - 3}
                width={barWidth}
                height={val > 0 ? barH : 3}
                rx="6"
                ry="6"
                fill={color}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s, transform 0.2s",
                  opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.6,
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Value Label above bar */}
              <text
                x={x + barWidth / 2}
                y={val > 0 ? y - 6 : paddingTop + chartH - 6}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={val > 0 ? color : "#94a3b8"}
              >
                {val}
              </text>

              {/* X Category Label */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + chartH + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
                fontWeight="600"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* =========================================================
   MAIN ADMIN ANALYTICS COMPONENT
   ========================================================= */
const AdminAnalytics = ({ isEmbedded = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframeDays, setTimeframeDays] = useState(7);

  const fetchAnalytics = useCallback(async (days = timeframeDays) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/analytics", {
        params: { days },
      });
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch admin analytics:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load analytics data from server."
      );
    } finally {
      setLoading(false);
    }
  }, [timeframeDays]);

  useEffect(() => {
    fetchAnalytics(timeframeDays);
  }, [fetchAnalytics, timeframeDays]);

  const handleTimeframeChange = (days) => {
    setTimeframeDays(days);
    fetchAnalytics(days);
  };

  const userStats = useMemo(() => data?.userStats || {}, [data]);
  const readingStats = useMemo(() => data?.readingStats || {}, [data]);
  const grantStats = useMemo(() => data?.grantStats || {}, [data]);
  const goalStats = useMemo(() => data?.goalStats || {}, [data]);
  const recentAlerts = useMemo(() => data?.recentAlerts || [], [data]);

  // Role Demographics Data
  const roleChartData = useMemo(() => {
    if (userStats.roleDistribution && userStats.roleDistribution.length > 0) {
      return userStats.roleDistribution.map((d) => ({
        ...d,
        color: d.color || ROLE_COLORS[d.name] || "#3b82f6",
      }));
    }
    return [
      { name: "Patients", value: userStats.individualCount || 0, color: "#3b82f6" },
      { name: "Practitioners", value: userStats.practitionerCount || 0, color: "#10b981" },
      { name: "Administrators", value: userStats.adminCount || 0, color: "#8b5cf6" },
    ];
  }, [userStats]);

  // Timeline Data
  const timelineData = useMemo(() => {
    return readingStats.timeline || [];
  }, [readingStats]);

  // Category Distribution Data
  const categoryData = useMemo(() => {
    return (readingStats.categoryDistribution || []).map((cat, idx) => ({
      ...cat,
      name: cat.category,
      fill: CATEGORY_COLORS[cat.category] || PALETTE[idx % PALETTE.length],
    }));
  }, [readingStats]);

  // Metric Volume Data
  const metricData = useMemo(() => {
    return (readingStats.metricDistribution || []).map((m, idx) => ({
      ...m,
      name: m.name,
      fill: CATEGORY_COLORS[m.category] || PALETTE[idx % PALETTE.length],
    }));
  }, [readingStats]);

  // Practitioner Grants Data
  const grantChartData = useMemo(() => {
    if (grantStats.grantsDistribution && grantStats.grantsDistribution.length > 0) {
      return grantStats.grantsDistribution.map((g) => ({
        ...g,
        color: g.color || GRANT_COLORS[g.name] || "#10b981",
      }));
    }
    return [
      { name: "Active", value: grantStats.activeGrants || 0, color: "#10b981" },
      { name: "Requested", value: grantStats.requestedGrants || 0, color: "#f59e0b" },
      { name: "Revoked", value: grantStats.revokedGrants || 0, color: "#ef4444" },
    ];
  }, [grantStats]);

  // Health Goals Data
  const goalChartData = useMemo(() => {
    if (goalStats.goalsDistribution && goalStats.goalsDistribution.length > 0) {
      return goalStats.goalsDistribution.map((g) => ({
        ...g,
        color: g.color || GOAL_COLORS[g.name] || "#10b981",
      }));
    }
    return [
      { name: "Achieved", value: goalStats.achievedGoals || 0, color: "#10b981" },
      { name: "In Progress", value: goalStats.inProgressGoals || 0, color: "#3b82f6" },
      { name: "Failed", value: goalStats.failedGoals || 0, color: "#ef4444" },
    ];
  }, [goalStats]);

  const alertPercentage = useMemo(() => {
    if (!readingStats.totalReadings || readingStats.totalReadings === 0) return 0;
    return Math.round(
      ((readingStats.outOfBoundsReadings || 0) / readingStats.totalReadings) * 100
    );
  }, [readingStats]);

  if (loading && !data) {
    return (
      <main className="admin-analytics-page">
        <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
          <h2>Loading Platform Analytics...</h2>
          <p>Querying dynamic biometric measurements, active rosters, and telemetry from database.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-analytics-page">
      {/* ========================================
          HERO SECTION
      ======================================== */}
      {!isEmbedded && (
        <section className="analytics-hero">
          <div className="analytics-hero-text">
            <p className="hero-eyebrow" style={{ color: "#34d399" }}>
              SYSTEM INTELLIGENCE & TELEMETRY
            </p>
            <h1>Platform Analytics</h1>
            <p>
              Live biometric measurements telemetry, patient-practitioner
              connections, and health goal progress fetched dynamically from the database.
            </p>
          </div>

          <div className="analytics-hero-actions">
            <Link to="/admin/roster" className="analytics-action-btn">
              👥 User Roster & Biometrics
            </Link>
            <button
              type="button"
              className="analytics-action-btn"
              onClick={() => fetchAnalytics(timeframeDays)}
            >
              ↻ Refresh Data
            </button>
          </div>
        </section>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* ========================================
          KPI STATS GRID
      ======================================== */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Registered Users</span>
            <div className="kpi-icon blue">👥</div>
          </div>
          <div className="kpi-value">{userStats.totalUsers || 0}</div>
          <div className="kpi-subtitle">
            <span className="kpi-tag-green">
              {userStats.activeUsers || 0} Active
            </span>
            <span>
              • {userStats.individualCount || 0} Patients, {userStats.practitionerCount || 0} Practitioners
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Biometric Measurements</span>
            <div className="kpi-icon emerald">♥</div>
          </div>
          <div className="kpi-value">{readingStats.totalReadings || 0}</div>
          <div className="kpi-subtitle">
            <span className={alertPercentage > 25 ? "kpi-tag-red" : "kpi-tag-green"}>
              {alertPercentage}% Alert Rate
            </span>
            <span>
              • {readingStats.normalReadings || 0} Normal readings
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Practitioner Grants</span>
            <div className="kpi-icon purple">⚕</div>
          </div>
          <div className="kpi-value">{grantStats.totalGrants || 0}</div>
          <div className="kpi-subtitle">
            <span className="kpi-tag-green">
              {grantStats.activeGrants || 0} Active
            </span>
            <span>
              • {grantStats.requestedGrants || 0} Pending approvals
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Goal Success Rate</span>
            <div className="kpi-icon amber">✓</div>
          </div>
          <div className="kpi-value">{goalStats.achievementRate || 0}%</div>
          <div className="kpi-subtitle">
            <span className="kpi-tag-green">
              {goalStats.achievedGoals || 0} Achieved
            </span>
            <span>
              • {goalStats.totalGoals || 0} Total health goals
            </span>
          </div>
        </div>
      </section>

      {/* ========================================
          TIMEFRAME SELECTOR BAR
      ======================================== */}
      <section className="timeframe-bar">
        <div className="timeframe-label">
          <span>📅 Measurement Activity Timeframe:</span>
        </div>
        <div className="timeframe-pill-group">
          <button
            type="button"
            className={timeframeDays === 7 ? "timeframe-pill active" : "timeframe-pill"}
            onClick={() => handleTimeframeChange(7)}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={timeframeDays === 14 ? "timeframe-pill active" : "timeframe-pill"}
            onClick={() => handleTimeframeChange(14)}
          >
            Last 14 Days
          </button>
          <button
            type="button"
            className={timeframeDays === 30 ? "timeframe-pill active" : "timeframe-pill"}
            onClick={() => handleTimeframeChange(30)}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={timeframeDays === 90 ? "timeframe-pill active" : "timeframe-pill"}
            onClick={() => handleTimeframeChange(90)}
          >
            Last 90 Days
          </button>
        </div>
      </section>

      {/* ========================================
          CHARTS GRID - ROW 1
      ======================================== */}
      <section className="charts-grid-2col">
        {/* 1. Daily Ingested Readings Timeline */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>📈 Measurements Activity ({timeframeDays} Days)</h3>
              <p>Daily biometric readings volume and out-of-bounds alerts</p>
            </div>
            <span className="chart-header-badge">
              {readingStats.totalReadings || 0} Total Readings
            </span>
          </div>
          <div className="chart-wrapper">
            <AreaTimelineChart data={timelineData} height={240} />
          </div>
        </div>

        {/* 2. User Roles Breakdown (Donut Chart) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>👥 User Demographics & Roles</h3>
              <p>Distribution of registered accounts in database</p>
            </div>
            <span className="chart-header-badge">
              {userStats.totalUsers || 0} Users
            </span>
          </div>
          <div className="chart-wrapper">
            <DonutChart data={roleChartData} size={190} centerLabel="Users" centerValue={userStats.totalUsers || 0} />
          </div>
        </div>
      </section>

      {/* ========================================
          CHARTS GRID - ROW 2
      ======================================== */}
      <section className="charts-grid-2col">
        {/* 3. Metric Volume Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>📊 Readings Volume by Health Metric</h3>
              <p>Total recorded data points per metric standard</p>
            </div>
            <span className="chart-header-badge">
              {readingStats.totalMetrics || 0} Standards
            </span>
          </div>
          <div className="chart-wrapper">
            <ColumnBarChart data={metricData} dataKey="count" nameKey="name" height={240} />
          </div>
        </div>

        {/* 4. Practitioner Access Grant Status */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>⚕ Practitioner Access Connections</h3>
              <p>Active vs pending vs revoked health data sharing grants</p>
            </div>
            <span className="chart-header-badge">
              {grantStats.totalGrants || 0} Total Grants
            </span>
          </div>
          <div className="chart-wrapper">
            <ColumnBarChart data={grantChartData} dataKey="value" nameKey="name" height={240} />
          </div>
        </div>
      </section>

      {/* ========================================
          CHARTS GRID - ROW 3: Goals & Categories
      ======================================== */}
      <section className="charts-grid-2col">
        {/* 5. Health Goal Outcomes */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>🎯 Health Goals Achievement Status</h3>
              <p>Completion outcomes across all user goals</p>
            </div>
            <span className="chart-header-badge">
              {goalStats.totalGoals || 0} Goals
            </span>
          </div>
          <div className="chart-wrapper">
            <DonutChart data={goalChartData} size={190} centerLabel="Goals" centerValue={goalStats.totalGoals || 0} />
          </div>
        </div>

        {/* 6. Metric Category Share */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3>🧬 Metric Category Share</h3>
              <p>Measurements categorized by physiological domain</p>
            </div>
            <span className="chart-header-badge">
              {categoryData.length} Categories
            </span>
          </div>
          <div className="chart-wrapper">
            <ColumnBarChart data={categoryData} dataKey="count" nameKey="name" height={240} />
          </div>
        </div>
      </section>

      {/* ========================================
          LIVE TELEMETRY / RECENT ALERTS FEED
      ======================================== */}
      <section className="telemetry-card">
        <div className="telemetry-header">
          <div>
            <h3>🚨 Recent Out-of-Bounds Biometric Alerts</h3>
            <p>Live database stream of flagged biometric measurements requiring clinical attention</p>
          </div>
          <span className="chart-header-badge" style={{ background: "#fee2e2", color: "#dc2626" }}>
            {recentAlerts.length} Recent Alerts
          </span>
        </div>

        <div className="telemetry-table-wrapper">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Metric</th>
                <th>Measured Value</th>
                <th>Status</th>
                <th>Source</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                    No out-of-bounds alerts currently recorded in the database.
                  </td>
                </tr>
              ) : (
                recentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <div className="patient-badge">{alert.patientName || "Patient"}</div>
                      {alert.patientEmail && (
                        <div className="patient-email">{alert.patientEmail}</div>
                      )}
                    </td>
                    <td>
                      <span className="metric-pill">
                        {alert.metricName || "Metric"}
                      </span>
                    </td>
                    <td>
                      <span className="metric-val-alert">
                        {alert.numericValue} {alert.metricUnit || ""}
                      </span>
                    </td>
                    <td>
                      <span className="alert-badge">
                        ⚠ {alert.status}
                      </span>
                    </td>
                    <td>
                      <span className="source-tag">
                        {alert.source}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "12px" }}>
                      {alert.recordedAt ? alert.recordedAt.replace("T", " ").substring(0, 16) : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================
          QUICK SUMMARY FOOTER BANNER
      ======================================== */}
      {!isEmbedded && (
        <section className="analytics-summary-banner">
          <div className="summary-banner-content">
            <h4>Platform Health & Biometric Standards</h4>
            <p>
              Manage users, assign roles, and configure biometric standards across the HumaGraph ecosystem.
            </p>
          </div>

          <Link to="/admin/roster" className="summary-btn">
            👥 Open User Roster →
          </Link>
        </section>
      )}
    </main>
  );
};

export default AdminAnalytics;
