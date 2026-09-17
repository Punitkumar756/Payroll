import React, { useState, useEffect } from 'react';
import { employeesApi, tasksApi } from '../../../api';
import toast from 'react-hot-toast';
import { ClipboardList, Save, User, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function AssignTaskPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [existingTasks, setExistingTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    employeesApi.list().then(res => {
      setEmployees(res?.data || res || []);
    }).catch(err => {
      console.error('Error fetching employees:', err);
      toast.error('Failed to load employees');
    });
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      employeesApi.get(selectedEmployeeId).then(res => {
        setSelectedEmployeeDetails(res?.data || res);
      }).catch(err => {
        console.error('Error fetching employee details:', err);
      });
      
      tasksApi.listByEmployee(selectedEmployeeId).then(res => {
        setExistingTasks(res || []);
      }).catch(err => {
        console.error('Error fetching employee tasks:', err);
      });
    } else {
      setSelectedEmployeeDetails(null);
      setExistingTasks([]);
    }
  }, [selectedEmployeeId]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !description.trim()) {
      toast.error('Please enter a task description');
      return;
    }
    
    setSaving(true);
    try {
      await tasksApi.assign({
        employee_id: selectedEmployeeId,
        description: description
      });
      toast.success('Task assigned successfully!');
      
      setAssignedTasks(prev => [{ id: Date.now(), description }, ...prev]);
      setDescription(''); 
      
      // Optionally refresh existing tasks to include the newly assigned one
      tasksApi.listByEmployee(selectedEmployeeId).then(res => {
        setExistingTasks(res || []);
      }).catch(() => {});
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to assign task');
    } finally {
      setSaving(false);
    }
  };

  const displayEmployee = selectedEmployeeDetails || employees.find(emp => String(emp.id) === String(selectedEmployeeId));
  
  // Filter for pending or in progress tasks, ignoring those just assigned in this session to avoid duplicates
  const pendingOrInProgressTasks = existingTasks.filter(task => 
    (task.status === 'Pending' || task.status === 'In Progress') && 
    !assignedTasks.some(at => at.description === task.description)
  );

  return (
    <div className="animate-fade" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={28} color="var(--clr-primary)" /> Assign Task
        </h1>
        <p style={{ color: 'var(--clr-text-muted)', margin: '0.25rem 0 0' }}>Select an employee to view their profile and assign tasks.</p>
      </div>

      {/* Employee Selection */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>1. Select Employee</label>
          <select 
            className="form-select" 
            value={selectedEmployeeId} 
            onChange={e => {
              setSelectedEmployeeId(e.target.value);
              setAssignedTasks([]);
              setDescription('');
            }}
          >
            <option value="">-- Choose Employee --</option>
            {Array.isArray(employees) && employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile & Task Assignment */}
      {displayEmployee && (
        <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          
          {/* Basic Profile Sidebar */}
          <div className="card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--clr-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}>
                <User size={40} />
              </div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>{displayEmployee.first_name} {displayEmployee.last_name}</h3>
              <span className="badge badge-indigo">{displayEmployee.employee_code}</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Location:</strong>
                <div>{displayEmployee.location_name || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Department:</strong>
                <div>{displayEmployee.department_name || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Designation:</strong>
                <div>{displayEmployee.designation_name || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Status:</strong>
                <div>{displayEmployee.status || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Joining Date:</strong>
                <div>{displayEmployee.joining_date ? new Date(displayEmployee.joining_date).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--clr-border)' }}>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Email:</strong>
                <div style={{ wordBreak: 'break-all' }}>{displayEmployee.official_email || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--clr-text-muted)' }}>Contact No:</strong>
                <div>{displayEmployee.contact_number || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Task Assignment Form & Existing Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--clr-primary)" /> 2. Add New Task
              </h3>
              
              <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <textarea 
                    required 
                    className="form-textarea" 
                    rows="4" 
                    placeholder="Describe the task details here..."
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={saving} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Save size={18} /> {saving ? 'Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </form>

              {/* Recently Assigned Tasks in current session */}
              {assignedTasks.length > 0 && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-border)', paddingTop: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} /> Just Assigned
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assignedTasks.map(task => (
                      <div key={task.id} style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {task.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pending / In Progress Tasks */}
            {pendingOrInProgressTasks.length > 0 && (
              <div className="card animate-fade" style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--clr-warning)' }}>
                  <Clock size={20} /> Current Active Tasks
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingOrInProgressTasks.map(task => (
                    <div key={task.id} style={{ padding: '1rem', background: 'var(--clr-surface-alt)', border: '1px solid var(--clr-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className={`badge ${task.status === 'In Progress' ? 'badge-indigo' : 'badge-gray'}`}>
                          {task.status}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {task.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
