import React, { useState, useEffect } from "react";
import MasterPage from "../../components/MasterPage";
import {
  locationsApi,
  departmentsApi,
  designationsApi,
  categoriesApi,
  groupsApi,
  subGroupsApi,
  announcementsApi,
} from "../../api";

// ── Locations ─────────────────────────────────────────────────
export function LocationsPage() {
  return (
    <MasterPage
      title="Locations"
      description="Manage office locations for Dayton Natural Resource Pvt Ltd"
      api={locationsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "website", label: "Website" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "address", label: "Address", type: "textarea" },
        { key: "phone", label: "Phone" },
        { key: "fax", label: "Fax" },
        { key: "website", label: "Website", type: "url" },
      ]}
    />
  );
}

// ── Departments ───────────────────────────────────────────────
export function DepartmentsPage() {
  return (
    <MasterPage
      title="Departments"
      description="Manage company departments"
      api={departmentsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Designations ──────────────────────────────────────────────
export function DesignationsPage() {
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    locationsApi
      .list({ status: "Active" })
      .then(setLocations)
      .catch(console.error);
    departmentsApi
      .list({ status: "Active" })
      .then(setDepartments)
      .catch(console.error);
  }, []);

  return (
    <MasterPage
      title="Designations"
      description="Manage job designations"
      api={designationsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "location_name", label: "Location" },
        { key: "department_name", label: "Department" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        {
          key: "location_id",
          label: "Location",
          type: "select",
          options: locations.map((l) => ({ value: l.id, label: l.name })),
        },
        {
          key: "department_id",
          label: "Department",
          type: "select",
          options: departments.map((d) => ({ value: d.id, label: d.name })),
        },
      ]}
    />
  );
}

// ── Categories ────────────────────────────────────────────────
export function CategoriesPage() {
  return (
    <MasterPage
      title="Categories"
      description="Manage employee categories"
      api={categoriesApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Groups ────────────────────────────────────────────────────
export function GroupsPage() {
  return (
    <MasterPage
      title="Groups"
      description="Manage employee groups"
      api={groupsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}

// ── Sub Groups ────────────────────────────────────────────────
export function SubGroupsPage() {
  return (
    <MasterPage
      title="Sub Groups"
      description="Manage employee sub-groups"
      api={subGroupsApi}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "group_name", label: "Group" },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`badge ${r.is_active ? "badge-green" : "badge-gray"}`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        { key: "group_id", label: "Group ID", type: "number", required: true },
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
      ]}
    />
  );
}



// ── Announcements ─────────────────────────────────────────────
export function AnnouncementsPage() {
  return (
    <MasterPage
      title="Announcements"
      description="Manage organization announcements and news"
      api={announcementsApi}
      columns={[
        { key: "heading", label: "Heading" },
        { key: "type", label: "Type" },
        { key: "display_start", label: "Start Date" },
        { key: "display_end", label: "End Date" },
      ]}
      fields={[
        { key: "heading", label: "Heading", required: true },
        {
          key: "type",
          label: "Type",
          options: [
            { value: "News", label: "News" },
            { value: "Alert", label: "Alert" },
            { value: "Event", label: "Event" },
          ],
          required: true,
        },
        {
          key: "display_start",
          label: "Display Start Date",
          type: "date",
          required: true,
        },
        {
          key: "display_end",
          label: "Display End Date",
          type: "date",
          required: true,
        },
        { key: "content", label: "Content", type: "textarea", required: true },
      ]}
    />
  );
}
