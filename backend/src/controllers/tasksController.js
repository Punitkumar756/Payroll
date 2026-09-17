import pool from "../db/pool.js";

// @desc    Assign a new task to an employee
// @route   POST /api/tasks
// @access  Private (Admin/HR)
export const assignTask = async (req, res) => {
  try {
    const { employee_id, description } = req.body;

    if (!employee_id || !description) {
      return res.status(400).json({ error: "employee_id and description are required" });
    }

    const query = `
      INSERT INTO tasks (employee_id, description, status)
      VALUES (?, ?, 'Pending')
    `;
    const [result] = await pool.query(query, [employee_id, description]);

    res.status(201).json({
      message: "Task assigned successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ error: "Server error while assigning task" });
  }
};

// @desc    Get all tasks for an employee
// @route   GET /api/tasks/employee/:id
// @access  Private
export const getTasksByEmployeeId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, employee_id, description, status, created_at, updated_at
      FROM tasks
      WHERE employee_id = ?
      ORDER BY created_at DESC
    `;
    const [tasks] = await pool.query(query, [id]);

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
};

// @desc    Get all tasks across all employees
// @route   GET /api/tasks
// @access  Private (Admin/HR)
export const getAllTasks = async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.description, t.status, t.created_at, t.updated_at,
             e.first_name, e.last_name, e.employee_code,
             d.name as department_name
      FROM tasks t
      JOIN employees e ON t.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private (Admin/HR)
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const query = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.query(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Server error while updating task status" });
  }
};

// @desc    Update own task status
// @route   PATCH /api/tasks/self/:id/status
// @access  Private (Employee)
export const updateSelfTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Fallback to req.user.userId if employeeId is not set in the JWT directly (though usually user.employeeId is set)
    const employeeId = req.user.employeeId || req.user.userId;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    // Verify task belongs to employee before updating
    const checkQuery = `SELECT * FROM tasks WHERE id = ? AND employee_id = ?`;
    const [checkResult] = await pool.query(checkQuery, [id, employeeId]);
    
    if (checkResult.length === 0) {
      return res.status(403).json({ error: "Not authorized to update this task or task not found" });
    }

    const query = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await pool.query(query, [status, id]);

    res.json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating self task status:", error);
    res.status(500).json({ error: "Server error while updating task status" });
  }
};
