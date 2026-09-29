package com.daytonnaturalresource.employeeapp.ui.main

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.daytonnaturalresource.employeeapp.ui.auth.LoginViewModel

// ── Navigation destinations ──────────────────────────────────────
sealed class Screen(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val showInBar: Boolean = true
) {
    object Dashboard    : Screen("dashboard",     "Home",       Icons.Filled.Home,         Icons.Outlined.Home)
    object Attendance   : Screen("attendance",    "Attendance", Icons.Filled.AccessTime,   Icons.Outlined.AccessTime)
    object Leave        : Screen("leave",         "Leave",      Icons.Filled.BeachAccess,  Icons.Outlined.BeachAccess)
    object Payroll      : Screen("payroll",       "Payroll",    Icons.Filled.Payments,     Icons.Outlined.Payments)
    object Profile      : Screen("profile",       "Profile",    Icons.Filled.Person,       Icons.Outlined.Person)
    object Announcements: Screen("announcements", "Announcements",
        Icons.Filled.Campaign, Icons.Outlined.Campaign, showInBar = false)
    object Holidays     : Screen("holidays",      "Holidays",
        Icons.Filled.Event,    Icons.Outlined.DateRange, showInBar = false)
    object Correction   : Screen("correction",    "Correction",
        Icons.Filled.Edit,     Icons.Outlined.Edit, showInBar = false)
    object Tasks        : Screen("tasks",         "Tasks",
        Icons.Filled.Assignment, Icons.Outlined.Assignment, showInBar = true)
}

private val bottomBarScreens = listOf(
    Screen.Dashboard,
    Screen.Attendance,
    Screen.Leave,
    Screen.Payroll,
    Screen.Tasks,
    Screen.Profile
)

// ── MainScreen ────────────────────────────────────────────────────
@Composable
fun MainScreen(loginViewModel: LoginViewModel) {
    val navController = rememberNavController()

    // Shared ViewModels — scoped to MainScreen so state survives tab switches
    val leaveViewModel:       LeaveViewModel       = viewModel()
    val attendanceViewModel:  AttendanceViewModel  = viewModel()
    val payrollViewModel:     PayrollViewModel     = viewModel()
    val announcementsViewModel: AnnouncementsViewModel = viewModel()
    val holidaysViewModel:    HolidaysViewModel    = viewModel()
    val attendanceCorrectionViewModel: AttendanceCorrectionViewModel = viewModel()
    val tasksViewModel:       TasksViewModel       = viewModel()

    Scaffold(
        bottomBar = {
            HrmsBottomBar(navController)
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(innerPadding),
            enterTransition = {
                slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start, tween(200))
            },
            exitTransition = {
                slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start, tween(200))
            },
            popEnterTransition = {
                slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End, tween(200))
            },
            popExitTransition = {
                slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End, tween(200))
            }
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    onViewAnnouncements = {
                        navController.navigate(Screen.Announcements.route)
                    },
                    onViewHolidays = {
                        navController.navigate(Screen.Holidays.route)
                    }
                )
            }
            composable(Screen.Attendance.route) {
                AttendanceScreen(
                    viewModel = attendanceViewModel,
                    onRequestCorrection = { navController.navigate(Screen.Correction.route) }
                )
            }
            composable(Screen.Leave.route) {
                LeaveScreen(leaveViewModel)
            }
            composable(Screen.Payroll.route) {
                PayrollScreen(payrollViewModel)
            }
            composable(Screen.Profile.route) {
                ProfileScreen(loginViewModel)
            }
            composable(Screen.Announcements.route) {
                AnnouncementsScreen(
                    onBack = { navController.popBackStack() },
                    viewModel = announcementsViewModel
                )
            }
            composable(Screen.Holidays.route) {
                HolidaysScreen(
                    onBack = { navController.popBackStack() },
                    viewModel = holidaysViewModel
                )
            }
            composable(Screen.Correction.route) {
                AttendanceCorrectionScreen(
                    onBack = { navController.popBackStack() },
                    viewModel = attendanceCorrectionViewModel
                )
            }
            composable(Screen.Tasks.route) {
                TasksScreen(tasksViewModel)
            }
        }
    }
}

@Composable
private fun HrmsBottomBar(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Don't show the bar on sub-screens
    if (currentRoute == Screen.Announcements.route) return
    if (currentRoute == Screen.Holidays.route) return
    if (currentRoute == Screen.Correction.route) return

    NavigationBar {
        bottomBarScreens.forEach { screen ->
            val selected = currentRoute == screen.route
            NavigationBarItem(
                selected = selected,
                onClick = {
                    navController.navigate(screen.route) {
                        popUpTo(navController.graph.startDestinationId) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = {
                    Icon(
                        imageVector = if (selected) screen.selectedIcon else screen.unselectedIcon,
                        contentDescription = screen.title
                    )
                },
                label = { Text(screen.title) }
            )
        }
    }
}
