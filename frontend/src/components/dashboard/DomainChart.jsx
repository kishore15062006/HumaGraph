import React from "react";
import "../../styles/HealthComponent.css";

const DomainChart = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="chart-card domain-chart-card">
            <div className="chart-card-header">
                <div>
                    <p className="chart-eyebrow">HEALTH OVERVIEW</p>
                    <h2>Distribution by Status</h2>
                </div>
            </div>

            <div className="domain-chart-content">
                <div className="donut-chart">
                    <div className="donut-chart-center">
                        <strong>
                            {data.reduce(
                                (total, item) => total + Number(item.count || 0),
                                0
                            )}
                        </strong>
                        <span>Total</span>
                    </div>

                    <div className="donut-segments">
                        {data.map((item, index) => (
                            <div
                                key={`${item.label}-${index}`}
                                className="donut-segment"
                                style={{
                                    "--segment-percentage": `${item.percentage}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="domain-legend">
                    {data.map((item, index) => (
                        <div
                            className="domain-legend-item"
                            key={`${item.label}-${index}`}
                        >
                            <div className="domain-legend-left">
                                <span className="legend-dot" />
                                <span>{item.label}</span>
                            </div>

                            <div className="domain-legend-right">
                                <strong>{item.count}</strong>
                                <span>{item.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DomainChart;