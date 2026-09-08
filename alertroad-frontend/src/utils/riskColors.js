export const RISK_COLORS = { High: "#b3261e", Medium: "#b07c00", Low: "#1e7b4d" };
export function getRiskColor(riskLevel) {
  return RISK_COLORS[riskLevel] || RISK_COLORS.Low;
}