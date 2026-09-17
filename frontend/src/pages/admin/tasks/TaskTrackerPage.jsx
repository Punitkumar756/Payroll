import React, { useState, useEffect } from 'react';
import { tasksApi } from '../../../api';
import toast from 'react-hot-toast';
import { LayoutList, Search, RefreshCw, CheckCircle2, Clock, PlayCircle, Download, Calendar, FilterX } from 'lucide-react';

export default function TaskTrackerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.listAll();
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tasksApi.updateStatus(id, newStatus);
      toast.success('Task status updated');
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update task status');
    }
  };

  const departments = ['All', ...new Set(tasks.map(t => t.department_name || 'Unassigned').filter(Boolean))];

  const filteredTasks = tasks.filter(t => {
    const term = searchTerm.toLowerCase();
    const name = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase();
    const dept = (t.department_name || 'Unassigned').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    
    const matchesSearch = name.includes(term) || dept.includes(term) || desc.includes(term);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || (t.department_name || 'Unassigned') === departmentFilter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const taskDate = new Date(t.created_at);
      taskDate.setHours(0, 0, 0, 0); 
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (taskDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (taskDate > end) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  const downloadCSV = () => {
    if (filteredTasks.length === 0) {
      toast.error('No tasks to download');
      return;
    }

    const headers = ['Task ID', 'Assignee', 'Employee Code', 'Department', 'Task Description', 'Date Assigned', 'Status'];
    const rows = filteredTasks.map(t => [
      t.id,
      `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown Employee',
      t.employee_code || '',
      t.department_name || 'Unassigned',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      new Date(t.created_at).toLocaleDateString(),
      t.status || 'Pending'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Task_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'Completed': return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2 };
      case 'In Progress': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: PlayCircle };
      default: return { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', icon: Clock };
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Section (Consistent with Assign Task Page) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutList size={28} color="var(--clr-primary)" /> Task Tracker
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', margin: '0.25rem 0 0' }}>
            Monitor and manage tasks across all employees.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline"
            onClick={downloadCSV} 
            disabled={loading || filteredTasks.length === 0} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={fetchTasks} 
            disabled={loading} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Filters Section */}
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
          background: 'var(--clr-surface-alt)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--clr-border)'
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            <Search size={18} style={{ color: 'var(--clr-text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search employee or task..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--clr-text)' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status */}
          <select 
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Department */}
          <select 
            className="form-select"
            style={{ width: 'auto' }}
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>
          
          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', padding: '0 0.5rem', borderRadius: '4px' }}>
            <Calendar size={18} style={{ color: 'var(--clr-text-muted)' }} />
            <input 
              type="date"
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--clr-text)', padding: '0.5rem' }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span style={{ color: 'var(--clr-border)' }}>|</span>
            <input 
              type="date"
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--clr-text)', padding: '0.5rem' }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          {(startDate || endDate || statusFilter !== 'All' || departmentFilter !== 'All' || searchTerm) && (
            <button 
              onClick={() => {
                setStartDate(''); setEndDate(''); setStatusFilter('All'); setDepartmentFilter('All'); setSearchTerm('');
              }}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--clr-danger)', color: 'var(--clr-danger)' }}
            >
              <FilterX size={16} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--clr-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--clr-text-muted)' }}>Assignee</th>
                <th style={{ padding: '1rem', color: 'var(--clr-text-muted)' }}>Department</th>
                <th style={{ padding: '1rem', color: 'var(--clr-text-muted)' }}>Task Description</th>
                <th style={{ padding: '1rem', color: 'var(--clr-text-muted)' }}>Date Assigned</th>
                <th style={{ padding: '1rem', color: 'var(--clr-text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                const conf = getStatusConfig(task.status);
                const Icon = conf.icon;
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--clr-border)', verticalAlign: 'top' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{task.first_name} {task.last_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{task.employee_code}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {task.department_name || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95rem' }}>
                        {task.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', background: conf.bg, borderRadius: '4px', padding: '0.25rem', border: `1px solid ${conf.color}40` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', color: conf.color }}>
                          <Icon size={16} />
                        </div>
                        <select 
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            fontSize: '0.9rem', 
                            border: 'none',
                            background: 'transparent',
                            color: conf.color,
                            fontWeight: 600,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="Pending" style={{ color: 'initial' }}>Pending</option>
                          <option value="In Progress" style={{ color: 'initial' }}>In Progress</option>
                          <option value="Completed" style={{ color: 'initial' }}>Completed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                    {loading ? 'Loading tasks...' : 'No tasks found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
