import { useEffect, useState } from "react";
import { dashboardApi, employeesApi, announcementsApi } from "../../api";
import { Users, Building, ClipboardList, AlertCircle, IndianRupee, PieChart as PieChartIcon, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsData, chartsData, employeesData, announcementsData] = await Promise.all([
          dashboardApi.getMetrics(),
          dashboardApi.getCharts(),
          employeesApi.list({}),
          announcementsApi.list()
        ]);
        setMetrics(metricsData);
        setCharts(chartsData.filter(d => d.value > 0)); // Only show departments with employees
        setRecentEmployees(employeesData.slice(0, 5));
        setAnnouncements(announcementsData.filter(a => a.status === 'Published').slice(0, 3));
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header" style={{
        background: 'var(--grad-primary)',
        padding: '2rem',
        borderRadius: 'var(--r-lg)',
        color: '#fff',
        boxShadow: 'var(--shadow-glow, var(--shadow-sm))'
      }}>
        <div className="page-header-left">
          <h1 style={{ color: '#fff' }}>HR Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Welcome back! Here is a summary of your organization.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-5" style={{ marginBottom: "2rem", marginTop: "-1.5rem", padding: "0 1rem", position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: "1.5rem", background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Employees</p>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{metrics?.total_employees || 0}</h2>
            </div>
            <div style={{ background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', padding: '0.75rem', borderRadius: '12px' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--clr-success)', fontWeight: 500 }}>{metrics?.active_employees || 0} Active</span>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Departments</p>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{metrics?.total_departments || 0}</h2>
            </div>
            <div style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--clr-success)', padding: '0.75rem', borderRadius: '12px' }}>
              <Building size={20} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Payroll Expense</p>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>₹{(Number(metrics?.total_payroll_expense) || 0).toLocaleString()}</h2>
            </div>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', padding: '0.75rem', borderRadius: '12px' }}>
              <IndianRupee size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <span className="text-muted">Total Paid</span>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Leaves</p>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{metrics?.pending_leaves || 0}</h2>
            </div>
            <div style={{ background: 'rgba(234, 88, 12, 0.1)', color: 'var(--clr-accent)', padding: '0.75rem', borderRadius: '12px' }}>
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Attendance Alerts</p>
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{metrics?.pending_corrections || 0}</h2>
            </div>
            <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--clr-danger)', padding: '0.75rem', borderRadius: '12px' }}>
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem', gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Quick Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} className="text-accent" /> Quick Actions
            </h3>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--clr-bg-input)', border: '1px solid var(--clr-border)', padding: '1rem' }} onClick={() => navigate('/admin/employees/create')}>
              + Add New Employee
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--clr-bg-input)', border: '1px solid var(--clr-border)', padding: '1rem' }} onClick={() => navigate('/admin/payroll/process')}>
              💸 Process Payroll
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--clr-bg-input)', border: '1px solid var(--clr-border)', padding: '1rem' }} onClick={() => navigate('/admin/leave/approvals')}>
              📝 Review Leaves
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', background: 'var(--clr-bg-input)', border: '1px solid var(--clr-border)', padding: '1rem' }} onClick={() => navigate('/admin/attendance/corrections')}>
              ⏰ Attendance Approvals
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChartIcon size={20} className="text-primary" /> Employee Distribution
          </h3>
          <div style={{ flex: 1, minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {charts.length === 0 ? (
              <p className="text-muted">No department data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={charts}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {charts.length > 0 && (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
               {charts.map((entry, idx) => (
                 <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                    <span className="text-muted">{entry.name}</span>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Employees */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Recently Added Employees</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/employees')}>View All</button>
          </div>
          <div style={{ padding: '0 var(--sp-md)' }}>
            {recentEmployees.length === 0 ? (
              <p style={{ padding: '1rem 0', color: 'var(--clr-text-muted)' }}>No employees found.</p>
            ) : (
              recentEmployees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--clr-border)' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--clr-primary-glow)', color: 'var(--clr-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {emp.full_name[0]}
                  </div>
                  <div style={{ marginLeft: '1rem', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{emp.designation || 'No Designation'} • {emp.department || 'No Dept'}</div>
                  </div>
                  <div>
                    <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{emp.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Latest Announcements</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/masters/announcements')}>Manage</button>
          </div>
          <div style={{ padding: '1rem var(--sp-md)' }}>
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)' }}>No recent announcements.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ padding: '1rem', background: 'var(--clr-bg-input)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--clr-text-primary)' }}>{ann.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                        {new Date(ann.published_at || ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
