import React from "react";

const StatCards = ({ stats }) => {
    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <div className="stat-card" key={index}>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                </div>
            ))}
        </div>
    );
};

export default StatCards;