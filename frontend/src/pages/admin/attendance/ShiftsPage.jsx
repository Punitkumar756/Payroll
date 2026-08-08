import React from "react";
import MasterPage from "../../../components/MasterPage";
import { attendanceApi } from "../../../api";

export default function ShiftsPage() {
  const apiAdapter = {
    list: attendanceApi.listShifts,
    create: attendanceApi.createShift,
    update: attendanceApi.updateShift,
  };

  return (
    <MasterPage
      title="Shifts"
      description="Manage shift timings and grace periods"
      api={apiAdapter}
      columns={[
        { key: "code", label: "Shift Code" },
        { key: "name", label: "Shift Name" },
        { key: "start_time", label: "Start Time" },
        { key: "end_time", label: "End Time" },
        { key: "grace_late_mins", label: "Grace Late (mins)" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (r.is_active ? "Active" : "Inactive"),
        },
      ]}
      fields={[
        { key: "code", label: "Shift Code", required: true },
        { key: "name", label: "Shift Name", required: true },
        {
          key: "start_time",
          label: "Start Time (HH:MM)",
          type: "time",
          required: true,
        },
        {
          key: "end_time",
          label: "End Time (HH:MM)",
          type: "time",
          required: true,
        },
        {
          key: "grace_late_mins",
          label: "Grace Late (mins)",
          type: "number",
        },
        {
          key: "grace_early_mins",
          label: "Grace Early (mins)",
          type: "number",
        },
      ]}
    />
  );
}
