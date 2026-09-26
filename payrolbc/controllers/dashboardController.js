const DashboardModel =
  require("../model/dashboardModel");

const DashboardController = {

  async getDashboard(req, res) {

    try {

      const stats =
        await DashboardModel.getDashboardStats();

      const departments =
        await DashboardModel.getDepartmentData();

      res.status(200).json({

        success: true,

        stats,

        departments

      });

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to load dashboard data",

        error: error.message

      });
    }

  }

};

module.exports = DashboardController;