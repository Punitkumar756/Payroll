package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ankitinfotech.employeeapp.api.Holiday
import com.ankitinfotech.employeeapp.ui.components.EmptyState
import com.ankitinfotech.employeeapp.ui.components.SkeletonCard
import java.text.SimpleDateFormat
import java.util.*

// ── HolidaysScreen ────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HolidaysScreen(
    onBack: () -> Unit,
    viewModel: HolidaysViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Holidays") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.Filled.ArrowBack, "Back",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { isRefreshing = true; viewModel.refresh() },
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            LaunchedEffect(uiState) {
                if (uiState !is HolidaysUiState.Loading) isRefreshing = false
            }

            when (val state = uiState) {
                is HolidaysUiState.Loading -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) { repeat(6) { item { SkeletonCard() } } }
                }

                is HolidaysUiState.Error -> {
                    EmptyState(
                        icon = Icons.Filled.EventBusy,
                        title = "Couldn't load holidays",
                        subtitle = state.message,
                        actionLabel = "Retry",
                        onAction = { viewModel.refresh() },
                        modifier = Modifier.fillMaxSize()
                    )
                }

                is HolidaysUiState.Success -> {
                    if (state.holidays.isEmpty()) {
                        EmptyState(
                            icon = Icons.Filled.EventBusy,
                            title = "No holidays",
                            subtitle = "No holidays have been configured yet.",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        // Group holidays by month name
                        val grouped = groupHolidaysByMonth(state.holidays)
                        val today = Calendar.getInstance().apply {
                            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                            set(Calendar.SECOND, 0);      set(Calendar.MILLISECOND, 0)
                        }.time

                        // Summary counts
                        val total = state.holidays.size
                        val upcoming = state.holidays.count { h ->
                            parseHolidayDate(h.start_date)?.let { it >= today } ?: false
                        }

                        LazyColumn(
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            // Summary row
                            item {
                                HolidaySummaryRow(total = total, upcoming = upcoming)
                            }

                            // Month groups
                            grouped.forEach { (month, holidays) ->
                                item {
                                    Text(
                                        text = month,
                                        style = MaterialTheme.typography.labelLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                                    )
                                }
                                items(holidays, key = { it.id }) { holiday ->
                                    HolidayCard(holiday = holiday, today = today)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Summary Row ───────────────────────────────────────────────
@Composable
private fun HolidaySummaryRow(total: Int, upcoming: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        SummaryChip(
            label = "Total",
            value = "$total",
            modifier = Modifier.weight(1f),
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
        )
        SummaryChip(
            label = "Upcoming",
            value = "$upcoming",
            modifier = Modifier.weight(1f),
            containerColor = MaterialTheme.colorScheme.secondaryContainer,
            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
        )
        SummaryChip(
            label = "Passed",
            value = "${total - upcoming}",
            modifier = Modifier.weight(1f),
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SummaryChip(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    containerColor: Color,
    contentColor: Color
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        color = containerColor
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = contentColor
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = contentColor
            )
        }
    }
}

// ── Holiday Card ──────────────────────────────────────────────
@Composable
private fun HolidayCard(holiday: Holiday, today: Date) {
    val date = parseHolidayDate(holiday.start_date)
    val isPast = date != null && date < today
    val isToday = date != null && isSameDay(date, today)
    val isOptional = holiday.is_optional == 1

    val cardAlpha = if (isPast) 0.55f else 1f

    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = if (isToday) 6.dp else 2.dp
        ),
        colors = CardDefaults.elevatedCardColors(
            containerColor = when {
                isToday -> MaterialTheme.colorScheme.primaryContainer
                isPast  -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = cardAlpha)
                else    -> MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Date badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isToday)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.size(52.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (date != null) {
                        val cal = Calendar.getInstance().also { it.time = date }
                        Text(
                            text = "${cal.get(Calendar.DAY_OF_MONTH)}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (isToday)
                                MaterialTheme.colorScheme.onPrimary
                            else
                                MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        Text(
                            text = SimpleDateFormat("EEE", Locale.getDefault()).format(date),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isToday)
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                            else
                                MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f)
                        )
                    } else {
                        Text("—", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }

            // Name + meta
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = holiday.name ?: "Unnamed Holiday",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isPast && !isToday)
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    else
                        MaterialTheme.colorScheme.onSurface
                )
                if (date != null) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = SimpleDateFormat("EEEE, dd MMM yyyy", Locale.getDefault()).format(date),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                // End date if multi-day
                holiday.end_date?.let { end ->
                    if (end != holiday.start_date) {
                        Text(
                            text = "Until ${formatShortDate(end)}",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Right badges
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (isToday) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.primary
                    ) {
                        Text(
                            "TODAY",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                if (isOptional) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.tertiaryContainer
                    ) {
                        Text(
                            "Optional",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onTertiaryContainer,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                if (isPast && !isToday) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Text(
                            "Past",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────
private val dateFormats = listOf(
    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US),
    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US),
    SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US),
    SimpleDateFormat("yyyy-MM-dd", Locale.US),
    SimpleDateFormat("dd-MM-yyyy", Locale.US),
    SimpleDateFormat("dd/MM/yyyy", Locale.US)
).onEach { it.timeZone = TimeZone.getTimeZone("UTC") }

private fun parseHolidayDate(dateStr: String?): Date? {
    if (dateStr.isNullOrBlank()) return null
    for (fmt in dateFormats) {
        try { return fmt.parse(dateStr) } catch (_: Exception) {}
    }
    return null
}

private fun isSameDay(a: Date, b: Date): Boolean {
    val ca = Calendar.getInstance().also { it.time = a }
    val cb = Calendar.getInstance().also { it.time = b }
    return ca.get(Calendar.YEAR) == cb.get(Calendar.YEAR) &&
           ca.get(Calendar.DAY_OF_YEAR) == cb.get(Calendar.DAY_OF_YEAR)
}

private fun formatShortDate(dateStr: String): String {
    return parseHolidayDate(dateStr)?.let {
        SimpleDateFormat("dd MMM", Locale.getDefault()).format(it)
    } ?: dateStr
}

private fun groupHolidaysByMonth(holidays: List<Holiday>): Map<String, List<Holiday>> {
    val monthFmt = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
    return holidays
        .sortedWith(compareBy { parseHolidayDate(it.start_date) ?: Date(Long.MAX_VALUE) })
        .groupBy { h ->
            parseHolidayDate(h.start_date)?.let { monthFmt.format(it) } ?: "Unknown"
        }
}
