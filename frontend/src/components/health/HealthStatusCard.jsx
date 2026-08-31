import React from 'react';
import { 
  HiOutlineCheckCircle as CheckIcon, 
  HiOutlineTrendingUp as UpIcon,
  HiOutlineExclamation as WarnIcon,
  HiOutlineShieldExclamation as ShieldWarnIcon,
  HiOutlineBell as BellIcon
} from 'react-icons/hi';

export const HealthStatusCard = ({ status = "Healthy", description, riskScore, trend }) => {
  // Color configuration according to requirement #3
  const statusConfig = {
    "Healthy": {
      bgColor: "bg-emerald-500/10 dark:bg-emerald-950/40",
      borderColor: "border-emerald-500/30 dark:border-emerald-800/50",
      textColor: "text-emerald-700 dark:text-emerald-300",
      badgeBg: "bg-emerald-600 text-white",
      icon: <CheckIcon className="w-8 h-8 text-emerald-500 animate-pulse" />,
      title: "🟢 HEALTHY",
      defaultDesc: "Your health indicators are currently within your target range."
    },
    "Improving": {
      bgColor: "bg-blue-500/10 dark:bg-blue-950/40",
      borderColor: "border-blue-500/30 dark:border-blue-800/50",
      textColor: "text-blue-700 dark:text-blue-300",
      badgeBg: "bg-blue-600 text-white",
      icon: <UpIcon className="w-8 h-8 text-blue-500 animate-bounce" />,
      title: "🔵 HEALTH INDICATORS IMPROVING",
      defaultDesc: "Your recent health indicators show a positive trend."
    },
    "Moderate Concern": {
      bgColor: "bg-amber-500/10 dark:bg-amber-950/40",
      borderColor: "border-amber-500/30 dark:border-amber-800/50",
      textColor: "text-amber-800 dark:text-amber-300",
      badgeBg: "bg-amber-500 text-white",
      icon: <WarnIcon className="w-8 h-8 text-amber-500" />,
      title: "🟡 MODERATE CONCERN",
      defaultDesc: "Some health indicators require attention. Continue tracking your diet and health measurements."
    },
    "Serious Concern": {
      bgColor: "bg-orange-500/10 dark:bg-orange-950/40",
      borderColor: "border-orange-500/30 dark:border-orange-800/50",
      textColor: "text-orange-800 dark:text-orange-300",
      badgeBg: "bg-orange-600 text-white",
      icon: <ShieldWarnIcon className="w-8 h-8 text-orange-500 animate-pulse" />,
      title: "🟠 SERIOUS CONCERN",
      defaultDesc: "Some health indicators are significantly outside your target range. Consider contacting a healthcare professional."
    },
    "High-Risk Health Condition": {
      bgColor: "bg-red-600/15 dark:bg-red-950/60",
      borderColor: "border-red-600/50 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-300",
      badgeBg: "bg-red-600 text-white animate-pulse",
      icon: <BellIcon className="w-8 h-8 text-red-600 animate-bounce" />,
      title: "🔴 HIGH-RISK HEALTH CONDITION",
      defaultDesc: "Your recorded health information indicates a potentially serious situation. Please seek appropriate medical attention promptly."
    }
  };

  const cfg = statusConfig[status] || statusConfig["Healthy"];

  return (
    <div className={`p-6 rounded-3xl border ${cfg.borderColor} ${cfg.bgColor} shadow-sm space-y-4 transition-all duration-300`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
            {cfg.icon}
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cfg.badgeBg}`}>
              {status}
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">{cfg.title}</h2>
          </div>
        </div>

        {riskScore != null && (
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Health Risk Score</span>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{riskScore} <span className="text-xs text-gray-400 font-bold">/ 100</span></p>
          </div>
        )}
      </div>

      <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${cfg.textColor}`}>
        {description || cfg.defaultDesc}
      </p>

      {/* Safety Disclaimer Requirement #1 */}
      <div className="pt-2 border-t border-gray-200/40 dark:border-gray-800 text-[11px] text-gray-500 font-medium flex items-center justify-between">
        <span>🛡️ NutriNexus is a wellness tracking assistant and does not replace professional medical diagnosis.</span>
        {trend && <span className="font-bold text-gray-700 dark:text-gray-300">Trend: {trend}</span>}
      </div>
    </div>
  );
};

export default HealthStatusCard;
