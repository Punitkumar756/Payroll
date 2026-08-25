package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.background
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
import com.ankitinfotech.employeeapp.api.LeaveApplication
import com.ankitinfotech.employeeapp.api.LeaveBalance
import com.ankitinfotech.employeeapp.ui.components.EmptyState
import com.ankitinfotech.employeeapp.ui.components.SkeletonBalanceRow
import com.ankitinfotech.employeeapp.ui.components.SkeletonListItem
import com.ankitinfotech.employeeapp.utils.formatIsoDate
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeaveScreen(viewModel: LeaveViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var showApplyDialog by remember { mutableStateOf(false) }
    var isRefreshing   by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Leave") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showApplyDialog = true },
                icon = { Icon(Icons.Filled.Add, "Apply") },
                text = { Text("Apply for Leave") }
            )
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { isRefreshing = true; viewModel.refresh() },
            modifier = Modifier.fillMaxSize().padding(padding)
        ) {
            LaunchedEffect(uiState) {
                if (uiState !is LeaveUiState.Loading) isRefreshing = false
            }

            when (val state = uiState) {
                is LeaveUiState.Loading -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item { SkeletonBalanceRow() }
                        repeat(5) { item { SkeletonListItem() } }
                    }
                }
                is LeaveUiState.Success -> {
                    LazyColumn(
                        contentPadding = PaddingValues(bottom = 88.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Balance chips
                        item {
                            Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp)) {
                                Text("Leave Balances",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.primary)
                                Spacer(Modifier.height(10.dp))
                                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    items(state.balances) { bal -> LeaveBalanceCard(bal) }
                                }
                            }
                        }

                        // Applications header
                        item {
                            Text(
                                "Applications",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(start = 16.dp, top = 20.dp, bottom = 8.dp)
                            )
                        }

                        if (state.applications.isEmpty()) {
                            item {
                                EmptyState(
                                    icon = Icons.Filled.EventAvailable,
                                    title = "No leave applications",
                                    subtitle = "Tap the button below to apply for leave.",
                                    modifier = Modifier.padding(horizontal = 16.dp)
                                )
                            }
                        } else {
                            items(state.applications) { app ->
                                LeaveApplicationItem(
                                    app = app,
                                    onCancel = { id ->
                                        viewModel.cancelLeave(id) { ok, msg ->
                                            scope.launch { snackbarHostState.showSnackbar(msg) }
                                        }
                                    }
                                )
                                HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
                            }
                        }
                    }
                }
                is LeaveUiState.Error -> {
                    EmptyState(
                        icon = Icons.Filled.ErrorOutline,
                        title = "Something went wrong",
                        subtitle = state.message,
                        actionLabel = "Retry",
                        onAction = { viewModel.refresh() }
                    )
                }
                else -> {}
            }
        }
    }

    if (showApplyDialog) {
        val balances = (uiState as? LeaveUiState.Success)?.balances ?: emptyList()
        ApplyLeaveDialog(
            leaveBalances = balances,
            onDismiss = { showApplyDialog = false },
            onSubmit = { typeId, start, end, reason ->
                viewModel.applyLeave(typeId, start, end, reason) { success, msg ->
                    if (success) showApplyDialog = false
                    scope.launch { snackbarHostState.showSnackbar(msg) }
                }
            }
        )
    }
}

@Composable
private fun LeaveBalanceCard(bal: LeaveBalance) {
    ElevatedCard(shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
            Text(
                (bal.available_balance ?: 0.0).toInt().toString(),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(bal.name ?: "Leave", style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
                "${(bal.used ?: 0.0).toInt()} used",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
            )
        }
    }
}

@Composable
private fun LeaveApplicationItem(
    app: LeaveApplication,
    onCancel: (Int) -> Unit
) {
    val statusColor = when (app.status) {
        "Approved"  -> MaterialTheme.colorScheme.primary
        "Rejected"  -> MaterialTheme.colorScheme.error
        "Cancelled" -> MaterialTheme.colorScheme.outline
        else        -> MaterialTheme.colorScheme.tertiary // Pending
    }
    var showCancelConfirm by remember { mutableStateOf(false) }

    ListItem(
        headlineContent = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(app.leave_type ?: "Leave", fontWeight = FontWeight.Medium)
                Surface(color = statusColor.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                    Text(app.status ?: "Pending",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = statusColor)
                }
            }
        },
        supportingContent = {
            Column {
                Text(
                    "${formatIsoDate(app.start_date)}  →  ${formatIsoDate(app.end_date)}",
                    style = MaterialTheme.typography.bodySmall
                )
                app.total_days?.let {
                    Text("${it.toInt()} day(s)", style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if (!app.approver_remarks.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "HR Remarks: ${app.approver_remarks}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                    )
                }
            }
        },
        trailingContent = {
            if (app.status == "Pending") {
                IconButton(onClick = { showCancelConfirm = true }) {
                    Icon(Icons.Filled.Cancel, "Cancel", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    )

    if (showCancelConfirm) {
        AlertDialog(
            onDismissRequest = { showCancelConfirm = false },
            title = { Text("Cancel Leave?") },
            text = { Text("Are you sure you want to withdraw this ${app.leave_type} request?") },
            confirmButton = {
                TextButton(onClick = {
                    showCancelConfirm = false
                    onCancel(app.id)
                }) { Text("Yes, Cancel", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { showCancelConfirm = false }) { Text("No") }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApplyLeaveDialog(
    leaveBalances: List<LeaveBalance>,
    onDismiss: () -> Unit,
    onSubmit: (Int, String, String, String) -> Unit
) {
    val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    var selectedBalance  by remember { mutableStateOf(leaveBalances.firstOrNull()) }
    var startDate        by remember { mutableStateOf(LocalDate.now()) }
    var endDate          by remember { mutableStateOf(LocalDate.now()) }
    var reason           by remember { mutableStateOf("") }
    var typeDropdownOpen by remember { mutableStateOf(false) }

    // DatePicker state
    var showStartPicker by remember { mutableStateOf(false) }
    var showEndPicker   by remember { mutableStateOf(false) }
    val startPickerState = rememberDatePickerState(
        initialSelectedDateMillis = startDate.toEpochDay() * 86400000L
    )
    val endPickerState = rememberDatePickerState(
        initialSelectedDateMillis = endDate.toEpochDay() * 86400000L
    )

    if (showStartPicker) {
        DatePickerDialog(
            onDismissRequest = { showStartPicker = false },
            confirmButton = {
                TextButton(onClick = {
                    startPickerState.selectedDateMillis?.let {
                        startDate = LocalDate.ofEpochDay(it / 86400000L)
                        if (endDate.isBefore(startDate)) endDate = startDate
                    }
                    showStartPicker = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showStartPicker = false }) { Text("Cancel") } }
        ) { DatePicker(state = startPickerState) }
    }

    if (showEndPicker) {
        DatePickerDialog(
            onDismissRequest = { showEndPicker = false },
            confirmButton = {
                TextButton(onClick = {
                    endPickerState.selectedDateMillis?.let {
                        endDate = LocalDate.ofEpochDay(it / 86400000L)
                    }
                    showEndPicker = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showEndPicker = false }) { Text("Cancel") } }
        ) { DatePicker(state = endPickerState) }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Apply for Leave") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Leave type dropdown
                ExposedDropdownMenuBox(
                    expanded = typeDropdownOpen,
                    onExpandedChange = { typeDropdownOpen = it }
                ) {
                    OutlinedTextField(
                        value = selectedBalance?.name ?: "Select type",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Leave Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(typeDropdownOpen) },
                        modifier = Modifier.menuAnchor().fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = typeDropdownOpen,
                        onDismissRequest = { typeDropdownOpen = false }
                    ) {
                        leaveBalances.forEach { bal ->
                        DropdownMenuItem(
                            text = {
                                Column {
                                    Text(bal.name ?: "Leave")
                                    Text("${(bal.available_balance ?: 0.0).toInt()} days available",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            },
                            onClick = { selectedBalance = bal; typeDropdownOpen = false }
                        )
                    }
                    }
                }

                // Start date button
                OutlinedButton(
                    onClick = { showStartPicker = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Filled.CalendarMonth, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Start: ${startDate.format(dateFormatter)}")
                }

                // End date button
                OutlinedButton(
                    onClick = { showEndPicker = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Filled.CalendarMonth, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("End: ${endDate.format(dateFormatter)}")
                }

                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Reason") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    selectedBalance?.let {
                        onSubmit(
                            it.leave_type_id,
                            startDate.format(dateFormatter),
                            endDate.format(dateFormatter),
                            reason
                        )
                    }
                },
                enabled = selectedBalance != null && reason.isNotBlank()
            ) { Text("Submit") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
