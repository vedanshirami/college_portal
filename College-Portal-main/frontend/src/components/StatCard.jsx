import React from "react";

const StatCard = ({ title, value, change, icon, color, progressColor }) => {
  const isPositive = change && parseFloat(change) > 0;
  
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  const progressColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            <span>{isPositive ? "↗" : "↘"}</span>
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm mb-3">{title}</p>
      
      <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full ${progressColors[progressColor || color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: "75%" }}
        ></div>
      </div>
    </div>
  );
};

export default StatCard;
