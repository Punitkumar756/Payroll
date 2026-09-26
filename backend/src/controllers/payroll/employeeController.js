import EmployeeModel from "../../models/payroll/employeeModel.js";

const EmployeeController = {

  async getEmployees(req, res) {

    try {

      const {
        search = "",
        department = "All",
        status = "All"
      } = req.query;

      const employees = await EmployeeModel.getAllEmployees({
        search,
        department,
        status
      });

      res.status(200).json({
        success: true,
        count: employees.length,
        data: employees
      });

    } catch (error) {

      console.error("Get employees error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message
      });
    }
  },


  async getEmployee(req, res) {

    try {

      const { id } = req.params;

      const employee =
        await EmployeeModel.getEmployeeById(id);

      if (!employee) {

        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });

      }

      res.status(200).json({
        success: true,
        data: employee
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: "Failed to fetch employee",
        error: error.message
      });
    }
  },


  async createEmployee(req, res) {

    try {

      const employeeId =
        await EmployeeModel.generateEmployeeId();

      const employee = {
        ...req.body,
        employeeId
      };

      if (!employee.name ||
        !employee.email ||
        !employee.phone) {

        return res.status(400).json({
          success: false,
          message: "Name, email and phone are required"
        });

      }

      const result =
        await EmployeeModel.createEmployee(employee);

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employeeId,
        insertId: result.insertId
      });

    } catch (error) {

      console.error("Create employee error:", error);

      if (error.code === "ER_DUP_ENTRY") {

        return res.status(409).json({
          success: false,
          message: "Employee email already exists"
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create employee",
        error: error.message
      });
    }
  },


  async updateEmployee(req, res) {

    try {

      const { id } = req.params;

      const existing =
        await EmployeeModel.getEmployeeById(id);

      if (!existing) {

        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });
      }

      const result =
        await EmployeeModel.updateEmployee(
          id,
          req.body
        );

      res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        affectedRows: result.affectedRows
      });

    } catch (error) {

      console.error("Update employee error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update employee",
        error: error.message
      });
    }
  },


  async deleteEmployee(req, res) {

    try {

      const { id } = req.params;

      const existing =
        await EmployeeModel.getEmployeeById(id);

      if (!existing) {

        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });
      }

      await EmployeeModel.deleteEmployee(id);

      res.status(200).json({
        success: true,
        message: `Employee ${id} deleted successfully`
      });

    } catch (error) {

      console.error("Delete employee error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete employee",
        error: error.message
      });
    }
  }

};

export default EmployeeController;