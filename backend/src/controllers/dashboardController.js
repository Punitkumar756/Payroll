import { callSPOne } from "../db/callProcedure.js";

export const getHRMetrics = async (req, res, next) => {
  try {
    const metrics = await callSPOne("sp_dashboard_hr_metrics", [req.user.role]);
    res.json(metrics);
  } catch (e) {
    next(e);
  }
};

export const getHRCharts = async (req, res, next) => {
  try {
    const { callSP } = await import("../db/callProcedure.js");
    const charts = await callSP("sp_dashboard_hr_charts", [req.user.role]);
    res.json(charts);
  } catch (e) {
    next(e);
  }
};
