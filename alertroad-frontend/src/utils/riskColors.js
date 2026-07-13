export const RISK_COLORS = { High: "#7a1c1c", Medium: "#d3ad04", Low: "#098d2e" };
export function getRiskColor(riskLevel) {
  return RISK_COLORS[riskLevel] || RISK_COLORS.Low;
}