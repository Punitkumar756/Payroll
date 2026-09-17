package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ankitinfotech.employeeapp.api.AttendanceRecord
import com.ankitinfotech.employeeapp.ui.components.EmptyState
import com.ankitinfotech.employeeapp.ui.components.SkeletonCard
import com.ankitinfotech.employeeapp.utils.formatIsoDate
import com.ankitinfotech.employeeapp.utils.formatIsoTime
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(viewModel: AttendanceViewModel, onRequestCorrection: () -> Unit = {}) {
    val uiState by viewModel.uiState.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Live clock (using Instant for accurate duration calculation)
    var currentInstant by remember { mutableStateOf(java.time.Instant.now()) }
    LaunchedEffect(Unit) {
        while (true) {
            currentInstant = java.time.Instant.now()
            delay(1000)
        }
    }
    val currentTime = java.time.LocalDateTime.ofInstant(currentInstant, java.time.ZoneId.systemDefault()).toLocalTime()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Attendance") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Filled.Refresh, "Refresh")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onRequestCorrection,
                icon = { Icon(Icons.Filled.Edit, "Correction") },
                text = { Text("Request Correction") }
            )
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { isRefreshing = true; viewModel.refresh() },
            modifier = Modifier.fillMaxSize().padding(padding)
        ) {
            LaunchedEffect(uiState) {
                if (uiState !is AttendanceUiState.Loading) isRefreshing = false
            }

            when (val state = uiState) {
                is AttendanceUiState.Loading -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        repeat(4) { item { SkeletonCard() } }
                    }
                }

                is AttendanceUiState.Error -> {
                    EmptyState(
                        icon = Icons.Filled.CloudOff,
                        title = "Couldn't load attendance",
                        subtitle = state.message,
                        actionLabel = "Retry",
                        onAction = { viewModel.refresh() },
                        modifier = Modifier.fillMaxSize()
                    )
                }

                is AttendanceUiState.Success -> {
                    LazyColumn(
                        contentPadding = PaddingValues(bottom = 24.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // ── Clock + Check-in card ─────────────────────
                        item {
                            ClockInCard(
                                currentTime = currentTime,
                                currentInstant = currentInstant,
                                todayRecord = state.todayRecord,
                                onClockIn = {
                                    viewModel.clockIn { ok, msg ->
                                        scope.launch { snackbarHostState.showSnackbar(msg) }
                                    }
                                },
                                onClockOut = {
                                    viewModel.clockOut { ok, msg ->
                                        scope.launch { snackbarHostState.showSnackbar(msg) }
                                    }
                                }
                            )
                        }

                        // ── Monthly calendar ──────────────────────────
                        item {
                            MonthlyCalendar(records = state.records)
                        }

                        // ── Recent records ────────────────────────────
                        item {
                            Text(
                                "Recent Activity",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(start = 16.dp, top = 8.dp, bottom = 4.dp)
                            )
                        }

                        val recent = state.records
                            .filter { it.date != null }
                            .sortedByDescending { it.date }
                            .take(20)
                        if (recent.isEmpty()) {
                            item {
                                EmptyState(
                                    icon = Icons.Filled.EventBusy,
                                    title = "No records yet",
                                    subtitle = "Clock in today to start tracking."
                                )
                            }
                        } else {
                            items(recent) { rec -> AttendanceRecordRow(rec) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ClockInCard(
    currentTime: LocalTime,
    currentInstant: java.time.Instant,
    todayRecord: AttendanceRecord?,
    onClockIn: () -> Unit,
    onClockOut: () -> Unit
) {
    val timeFmt = DateTimeFormatter.ofPattern("hh:mm:ss a")
    val isClockedIn  = todayRecord?.clock_in  != null
    val isClockedOut = todayRecord?.clock_out != null
    val canClockIn   = !isClockedIn
    val canClockOut  = isClockedIn && !isClockedOut

    val buttonColor by animateColorAsState(
        targetValue = when {
            canClockOut -> MaterialTheme.colorScheme.error
            canClockIn  -> MaterialTheme.colorScheme.primary
            else        -> MaterialTheme.colorScheme.outline
        },
        label = "buttonColor"
    )

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                currentTime.format(timeFmt),
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, d MMM yyyy")),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            var totalDurationStr = "—"
            if (isClockedIn) {
                try {
                    val inInstant = java.time.Instant.parse(todayRecord!!.clock_in)
                    val outInstant = if (isClockedOut) java.time.Instant.parse(todayRecord.clock_out) else currentInstant
                    val duration = java.time.Duration.between(inInstant, outInstant)
                    val hours = duration.toHours()
                    val minutes = duration.toMinutes() % 60
                    val seconds = duration.seconds % 60
                    totalDurationStr = String.format("%02d:%02d:%02d", hours, minutes, seconds)
                } catch (e: Exception) {}
            }

            var expectedOutStr: String? = null
            if (isClockedIn && todayRecord!!.start_time != null && todayRecord!!.end_time != null) {
                try {
                    val inInstant = java.time.Instant.parse(todayRecord!!.clock_in)
                    val st = java.time.LocalTime.parse(todayRecord!!.start_time)
                    val et = java.time.LocalTime.parse(todayRecord!!.end_time)
                    var shiftDuration = java.time.Duration.between(st, et)
                    if (shiftDuration.isNegative) shiftDuration = shiftDuration.plusDays(1)
                    val expectedOut = inInstant.plus(shiftDuration)
                    val expectedOutTime = java.time.LocalDateTime.ofInstant(expectedOut, java.time.ZoneId.systemDefault()).toLocalTime()
                    val fmt = java.time.format.DateTimeFormatter.ofPattern("hh:mm a")
                    expectedOutStr = expectedOutTime.format(fmt)
                } catch (e: Exception) {}
            }

            // Status chips row
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                AttendanceChip(
                    modifier = Modifier.weight(1f),
                    label = "IN",
                    value = if (isClockedIn) formatIsoTime(todayRecord?.clock_in) else "—",
                    active = isClockedIn,
                    activeColor = MaterialTheme.colorScheme.primary
                )
                AttendanceChip(
                    modifier = Modifier.weight(1f),
                    label = "TOTAL",
                    value = totalDurationStr,
                    active = isClockedIn && !isClockedOut,
                    activeColor = MaterialTheme.colorScheme.tertiary
                )
                AttendanceChip(
                    modifier = Modifier.weight(1f),
                    label = "OUT",
                    value = if (isClockedOut) formatIsoTime(todayRecord?.clock_out) else "—",
                    active = isClockedOut,
                    activeColor = MaterialTheme.colorScheme.error
                )
            }

            Button(
                onClick = { if (canClockIn) onClockIn() else if (canClockOut) onClockOut() },
                enabled = canClockIn || canClockOut,
                colors = ButtonDefaults.buttonColors(containerColor = buttonColor),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    if (canClockOut) Icons.Filled.Logout else Icons.Filled.Login,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    when {
                        isClockedOut -> "Already completed"
                        canClockOut  -> "Clock Out"
                        else         -> "Clock In"
                    },
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            if (expectedOutStr != null && !isClockedOut) {
                Text(
                    "Expected Out: $expectedOutStr",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.tertiary,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
private fun AttendanceChip(modifier: Modifier = Modifier, label: String, value: String, active: Boolean, activeColor: Color) {
    Surface(
        modifier = modifier,
        color = if (active) activeColor.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant,
        shape = RoundedCornerShape(8.dp),
        border = if (active) ButtonDefaults.outlinedButtonBorder else null
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label, style = MaterialTheme.typography.labelSmall,
                color = if (active) activeColor else MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold,
                color = if (active) activeColor else MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1)
        }
    }
}

@Composable
private fun MonthlyCalendar(records: List<AttendanceRecord>) {
    val today      = LocalDate.now()
    val yearMonth  = YearMonth.of(today.year, today.month)
    val firstDay   = yearMonth.atDay(1)
    val daysInMonth = yearMonth.lengthOfMonth()
    // Offset so week starts Monday (1=Mon … 7=Sun)
    val startOffset = (firstDay.dayOfWeek.value - 1)

    // Build a quick lookup: date-string → status
    val statusMap = records.filter { (it.date?.length ?: 0) >= 10 }.associate {
        it.date!!.substring(0, 10) to (it.status ?: "Unknown")
    }

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "${today.month.getDisplayName(TextStyle.FULL, Locale.ENGLISH)} ${today.year}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(Modifier.height(12.dp))

            // Day-of-week header
            val dows = listOf("M", "T", "W", "T", "F", "S", "S")
            Row(Modifier.fillMaxWidth()) {
                dows.forEach { d ->
                    Text(d, modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Spacer(Modifier.height(6.dp))

            // Calendar grid
            val totalCells = startOffset + daysInMonth
            val rows = (totalCells + 6) / 7
            for (row in 0 until rows) {
                Row(Modifier.fillMaxWidth()) {
                    for (col in 0 until 7) {
                        val cell = row * 7 + col
                        val day  = cell - startOffset + 1
                        if (day < 1 || day > daysInMonth) {
                            Box(Modifier.weight(1f).aspectRatio(1f))
                        } else {
                            val date = today.withDayOfMonth(day)
                            val dateStr = date.toString()
                            val status = statusMap[dateStr]
                            val isToday = date == today
                            val isWeekend = date.dayOfWeek.value >= 6

                            val bgColor = when {
                                isToday   -> MaterialTheme.colorScheme.primary
                                status == "Present" -> MaterialTheme.colorScheme.primaryContainer
                                status == "Absent"  -> MaterialTheme.colorScheme.errorContainer
                                status == "Half Day" -> MaterialTheme.colorScheme.tertiaryContainer
                                isWeekend -> MaterialTheme.colorScheme.surfaceVariant
                                else      -> Color.Transparent
                            }
                            val textColor = when {
                                isToday -> MaterialTheme.colorScheme.onPrimary
                                status == "Present" -> MaterialTheme.colorScheme.onPrimaryContainer
                                status == "Absent"  -> MaterialTheme.colorScheme.onErrorContainer
                                else    -> MaterialTheme.colorScheme.onSurface
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .aspectRatio(1f)
                                    .padding(2.dp)
                                    .clip(CircleShape)
                                    .background(bgColor),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        day.toString(),
                                        style = MaterialTheme.typography.labelMedium,
                                        color = textColor,
                                        fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal
                                    )
                                    // Late-mark dot
                                    if (status == "Late") {
                                        Box(
                                            modifier = Modifier
                                                .size(4.dp)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.tertiary)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Legend
            Spacer(Modifier.height(10.dp))
            HorizontalDivider()
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                LegendDot(MaterialTheme.colorScheme.primaryContainer, "Present")
                LegendDot(MaterialTheme.colorScheme.errorContainer, "Absent")
                LegendDot(MaterialTheme.colorScheme.tertiaryContainer, "Half Day")
                LegendDot(MaterialTheme.colorScheme.surfaceVariant, "Weekend")
            }
        }
    }
}

@Composable
private fun LegendDot(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(color))
        Text(label, style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun AttendanceRecordRow(rec: AttendanceRecord) {
    val statusColor = when (rec.status) {
        "Present"  -> MaterialTheme.colorScheme.primary
        "Absent"   -> MaterialTheme.colorScheme.error
        "Half Day" -> MaterialTheme.colorScheme.tertiary
        "Late"     -> MaterialTheme.colorScheme.tertiary
        else       -> MaterialTheme.colorScheme.outline
    }
    ListItem(
        headlineContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(formatIsoDate(rec.date), fontWeight = FontWeight.Medium)
                Surface(color = statusColor.copy(alpha = 0.12f), shape = RoundedCornerShape(4.dp)) {
                    Text(rec.status ?: "—",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall, color = statusColor)
                }
            }
        },
        supportingContent = {
            val inT  = if (rec.clock_in  != null) formatIsoTime(rec.clock_in)  else "—"
            val outT = if (rec.clock_out != null) formatIsoTime(rec.clock_out) else "—"
            
            var durationStr = ""
            if (rec.clock_in != null) {
                try {
                    val inInstant = java.time.Instant.parse(rec.clock_in)
                    var outInstant: java.time.Instant? = null
                    
                    if (rec.clock_out != null) {
                        outInstant = java.time.Instant.parse(rec.clock_out)
                    } else {
                        val todayStr = java.time.LocalDate.now().toString()
                        if (rec.date?.startsWith(todayStr) == true) {
                            outInstant = java.time.Instant.now()
                        }
                    }
                    
                    if (outInstant != null) {
                        val duration = java.time.Duration.between(inInstant, outInstant)
                        val hours = duration.toHours()
                        val minutes = duration.toMinutes() % 60
                        if (hours > 0 || minutes > 0) {
                            durationStr = "   ·   Total: ${hours}h ${minutes}m"
                        }
                    }
                } catch(e: Exception) {}
            }
            Text("In: $inT   ·   Out: $outT$durationStr", style = MaterialTheme.typography.bodySmall)
        },
        leadingContent = {
            Icon(Icons.Filled.AccessTime, null,
                tint = statusColor.copy(alpha = 0.7f))
        }
    )
    HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
}
