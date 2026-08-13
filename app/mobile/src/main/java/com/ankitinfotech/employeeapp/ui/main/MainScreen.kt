package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ankitinfotech.employeeapp.ui.auth.LoginViewModel

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Dashboard")
    object Attendance : Screen("attendance", "Attendance")
    object Leave : Screen("leave", "Leave")
    object Payroll : Screen("payroll", "Payroll")
    object Profile : Screen("profile", "Profile")
}

@Composable
fun MainScreen(loginViewModel: LoginViewModel) {
    val navController = rememberNavController()

    val items = listOf(
        Screen.Dashboard,
        Screen.Attendance,
        Screen.Leave,
        Screen.Payroll,
        Screen.Profile
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Text(screen.title.take(1)) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Dashboard.route) { DashboardScreen() }
            composable(Screen.Attendance.route) { AttendanceScreen() }
            composable(Screen.Leave.route) { LeaveScreen() }
            composable(Screen.Payroll.route) { PayrollScreen() }
            composable(Screen.Profile.route) { ProfileScreen(loginViewModel) }
        }
    }
}
