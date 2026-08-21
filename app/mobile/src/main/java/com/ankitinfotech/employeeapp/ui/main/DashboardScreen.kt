package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ankitinfotech.employeeapp.api.Announcement
import com.ankitinfotech.employeeapp.api.AttendanceRecord
import com.ankitinfotech.employeeapp.api.DashboardSummary
import com.ankitinfotech.employeeapp.api.LeaveBalance
import com.ankitinfotech.employeeapp.ui.components.EmptyState
import com.ankitinfotech.employeeapp.ui.components.SkeletonBalanceRow
import com.ankitinfotech.employeeapp.ui.components.SkeletonCard
import com.ankitinfotech.employeeapp.ui.components.SkeletonListItem
import com.ankitinfotech.employeeapp.utils.formatIsoDate
import com.ankitinfotech.employeeapp.utils.formatIsoTime
import com.ankitinfotech.employeeapp.utils.toTitleCase
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = viewModel(),
    onViewAnnouncements: () -> Unit = {},
    onViewHolidays: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }

    // Re-fetch dashboard data when screen is shown to ensure fresh data (especially user name)
    LaunchedEffect(Unit) {
        viewModel.refresh()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val name = (uiState as? DashboardUiState.Success)?.userName?.let {
                        if (it.isNotBlank()) "Hi, ${toTitleCase(it)} 👋" else "Dashboard"
                    } ?: "Dashboard"
                    Text(name, style = MaterialTheme.typography.titleLarge)
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = {
                isRefreshing = true
                viewModel.refresh()
            },
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Stop refreshing indicator once data loads
            LaunchedEffect(uiState) {
                if (uiState !is DashboardUiState.Loading) isRefreshing = false
            }

            when (val state = uiState) {
                is DashboardUiState.Loading -> DashboardSkeleton()
                is DashboardUiState.Error -> {
                    Column(
                        Modifier.fillMaxSize().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Filled.CloudOff, null, modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                        Spacer(Modifier.height(16.dp))
                        Text("Couldn't load dashboard", style = MaterialTheme.typography.titleMedium)
                        Text(state.message, style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(16.dp))
                        FilledTonalButton(onClick = { viewModel.refresh() }) { Text("Retry") }
                    }
                }
                is DashboardUiState.Success -> DashboardContent(
                    summary = state.summary,
                    onViewAnnouncements = onViewAnnouncements,
                    onViewHolidays = onViewHolidays
                )
            }
        }
    }
}

@Composable
private fun DashboardSkeleton() {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { SkeletonBalanceRow() }
        item { SkeletonCard() }
        repeat(3) { item { SkeletonListItem() } }
    }
}

@Composable
fun DashboardContent(
    summary: DashboardSummary,
    onViewAnnouncements: () -> Unit,
    onViewHolidays: () -> Unit = {}
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // ── Leave Balances ────────────────────────────────────────
        item {
            SectionHeader("Leave Balances")
            val balances = summary.leaveBalances ?: emptyList()
            if (balances.isEmpty()) {
                EmptyState(
                    icon = Icons.Filled.BeachAccess,
                    title = "No leave balances",
                    subtitle = "Contact HR to assign a leave policy."
                )
            } else {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(balances) { bal -> LeaveBalanceChip(bal) }
                }
            }
        }

        // ── Today's Attendance ────────────────────────────────────
        item {
            SectionHeader("Today's Attendance")
            AttendanceSummaryCard(summary.todayAttendance)
        }

        // ── Announcements ─────────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SectionHeader("Announcements", bottomPad = 0.dp)
                val announcList = summary.announcements ?: emptyList()
                if (announcList.isNotEmpty()) {
                    TextButton(onClick = onViewAnnouncements) { Text("View All") }
                }
            }
        }
        val announcements = summary.announcements ?: emptyList()
        if (announcements.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Filled.Campaign,
                    title = "No announcements",
                    subtitle = "Check back later for company news."
                )
            }
        } else {
            item {
                AutoSlidingCarousel(
                    items = announcements,
                    itemContent = { AnnouncementCard(it) }
                )
            }
        }

        // ── Upcoming Holidays ─────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SectionHeader("Upcoming Holidays", bottomPad = 0.dp)
                val holidayList = summary.upcomingHolidays ?: emptyList()
                if (holidayList.isNotEmpty()) {
                    TextButton(onClick = onViewHolidays) { Text("View All") }
                }
            }
        }
        val holidays = summary.upcomingHolidays ?: emptyList()
        if (holidays.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Filled.EventBusy,
                    title = "No upcoming holidays",
                    subtitle = "Enjoy the uninterrupted work streak!"
                )
            }
        } else {
            item {
                HolidayDashboardCard(holidays.first())
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun HolidayDashboardCard(holiday: com.ankitinfotech.employeeapp.api.Holiday) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.4f)
        )
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Surface(
                color = MaterialTheme.colorScheme.tertiary,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.size(44.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text("📅", fontSize = 20.sp)
                }
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    holiday.name ?: "Holiday",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onTertiaryContainer
                )
                Text(
                    formatIsoDate(holiday.start_date),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.7f)
                )
            }
            if (holiday.is_optional == 1) {
                Surface(
                    color = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(4.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.tertiary)
                ) {
                    Text(
                        "Optional",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                }
            }
        }
    }
}

@Composable
private fun LeaveBalanceChip(bal: LeaveBalance) {
    ElevatedCard(shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Text(
                (bal.available_balance ?: 0.0).toInt().toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(bal.name ?: "Leave", style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("of ${((bal.opening_balance ?: 0.0) + (bal.accrued ?: 0.0)).toInt()} days",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
        }
    }
}

@Composable
private fun AttendanceSummaryCard(att: AttendanceRecord?) {
    ElevatedCard(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                val displayStatus = when {
                    att?.status != null -> att.status
                    att?.clock_out != null -> "Present"
                    att?.clock_in != null -> "Working"
                    else -> "Not marked"
                }
                val statusColor = when (displayStatus) {
                    "Present", "Working" -> MaterialTheme.colorScheme.primary
                    "Absent"  -> MaterialTheme.colorScheme.error
                    else      -> MaterialTheme.colorScheme.onSurfaceVariant
                }
                Text(displayStatus, fontWeight = FontWeight.Bold,
                    color = statusColor, style = MaterialTheme.typography.titleMedium)
                if (att?.clock_in != null)
                    Text("In: ${formatIsoTime(att.clock_in)}", style = MaterialTheme.typography.bodySmall)
                if (att?.clock_out != null)
                    Text("Out: ${formatIsoTime(att.clock_out)}", style = MaterialTheme.typography.bodySmall)
            }
            Icon(Icons.Filled.AccessTime, contentDescription = null,
                modifier = Modifier.size(36.dp),
                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.4f))
        }
    }
}

@Composable
private fun AnnouncementCard(a: Announcement) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(a.heading ?: "Announcement", fontWeight = FontWeight.SemiBold,
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f))
                Surface(
                    color = MaterialTheme.colorScheme.secondary,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        a.type ?: "Info",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSecondary
                    )
                }
            }
            if (!a.content.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(a.content, style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f),
                    maxLines = 2)
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String, bottomPad: androidx.compose.ui.unit.Dp = 8.dp) {
    Text(
        title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(bottom = bottomPad)
    )
}

@Composable
fun <T> AutoSlidingCarousel(
    items: List<T>,
    itemContent: @Composable (T) -> Unit
) {
    if (items.isEmpty()) return
    if (items.size == 1) {
        itemContent(items.first())
        return
    }

    var currentIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(items) {
        while (true) {
            delay(3500)
            currentIndex = (currentIndex + 1) % items.size
        }
    }

    AnimatedContent(
        targetState = currentIndex,
        transitionSpec = {
            (slideInHorizontally(animationSpec = tween(500)) { width -> width } + fadeIn(animationSpec = tween(500))) togetherWith
            (slideOutHorizontally(animationSpec = tween(500)) { width -> -width } + fadeOut(animationSpec = tween(500)))
        },
        label = "carousel"
    ) { index ->
        itemContent(items[index])
    }
}
