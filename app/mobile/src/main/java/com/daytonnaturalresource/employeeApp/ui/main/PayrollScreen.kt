package com.daytonnaturalresource.employeeapp.ui.main

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.daytonnaturalresource.employeeapp.api.Payslip
import com.daytonnaturalresource.employeeapp.api.PayslipLine
import com.daytonnaturalresource.employeeapp.ui.components.EmptyState
import com.daytonnaturalresource.employeeapp.ui.components.SkeletonCard
import java.time.Month
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PayrollScreen(viewModel: PayrollViewModel) {
    val uiState        by viewModel.uiState.collectAsState()
    val selectedPayslip by viewModel.selectedPayslip.collectAsState()
    val selectedLines   by viewModel.selectedLines.collectAsState()
    val detailLoading   by viewModel.detailLoading.collectAsState()
    var isRefreshing   by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Payslips") },
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
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { isRefreshing = true; viewModel.refresh() },
            modifier = Modifier.fillMaxSize().padding(padding)
        ) {
            LaunchedEffect(uiState) {
                if (uiState !is PayrollUiState.Loading) isRefreshing = false
            }

            when (val state = uiState) {
                is PayrollUiState.Loading -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) { repeat(5) { item { SkeletonCard() } } }
                }

                is PayrollUiState.Error -> {
                    EmptyState(
                        icon = Icons.Filled.ReceiptLong,
                        title = "Couldn't load payslips",
                        subtitle = state.message,
                        actionLabel = "Retry",
                        onAction = { viewModel.refresh() },
                        modifier = Modifier.fillMaxSize()
                    )
                }

                is PayrollUiState.Success -> {
                    if (state.payslips.isEmpty()) {
                        EmptyState(
                            icon = Icons.Filled.ReceiptLong,
                            title = "No payslips yet",
                            subtitle = "Your payslips will appear here after the payroll is processed.",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(state.payslips) { payslip ->
                                PayslipCard(payslip) {
                                    viewModel.loadDetail(payslip)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Detail bottom sheet
    if (selectedPayslip != null || detailLoading) {
        ModalBottomSheet(
            onDismissRequest = { viewModel.clearDetail() },
            shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
        ) {
            if (detailLoading) {
                Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (selectedPayslip != null) {
                PayslipDetailSheet(
                    payslip = selectedPayslip!!,
                    lines = selectedLines ?: emptyList()
                )
            }
        }
    }
}

@Composable
private fun PayslipCard(payslip: Payslip, onClick: () -> Unit) {
    val monthName = payslip.month?.let {
        Month.of(it).getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH)
    } ?: payslip.month_year ?: "—"
    val period = if (payslip.year != null) "$monthName ${payslip.year}" else monthName

    val statusColor = when (payslip.status) {
        "Paid"      -> MaterialTheme.colorScheme.primary
        "Processed" -> MaterialTheme.colorScheme.tertiary
        else        -> MaterialTheme.colorScheme.outline
    }

    ElevatedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        Icons.Filled.ReceiptLong,
                        contentDescription = null,
                        modifier = Modifier.padding(10.dp).size(24.dp),
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
                Column {
                    Text(period, fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.bodyLarge)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Surface(color = statusColor.copy(alpha = 0.12f), shape = RoundedCornerShape(4.dp)) {
                            Text(payslip.status ?: "—",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall, color = statusColor)
                        }
                    }
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "₹${payslip.net_pay?.let { "%.2f".format(it) } ?: "—"}",
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Text("Net Pay", style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun PayslipDetailSheet(payslip: Payslip, lines: List<PayslipLine>) {
    val monthName = payslip.month?.let {
        Month.of(it).getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH)
    } ?: payslip.month_year ?: "—"
    val period = if (payslip.year != null) "$monthName ${payslip.year}" else monthName

    val earnings   = lines.filter { it.head_type == "Earning" }
    val deductions = lines.filter { it.head_type == "Deduction" }
    val totalEarnings   = earnings.sumOf   { it.amount ?: 0.0 }
    val totalDeductions = deductions.sumOf { it.amount ?: 0.0 }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(period, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(payslip.status ?: "—",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("₹${payslip.net_pay?.let { "%.2f".format(it) } ?: "—"}",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary)
                Text("Net Pay", style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        HorizontalDivider()

        // Earnings
        if (earnings.isNotEmpty()) {
            Text("Earnings", style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
            earnings.forEach { line ->
                PayslipRow(line.head_name ?: "—", "₹${"%.2f".format(line.amount ?: 0.0)}")
            }
            PayslipRow(
                "Gross Earnings", "₹${"%.2f".format(totalEarnings)}",
                bold = true, color = MaterialTheme.colorScheme.primary
            )
        }

        HorizontalDivider()

        // Deductions
        if (deductions.isNotEmpty()) {
            Text("Deductions", style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.error)
            deductions.forEach { line ->
                PayslipRow(line.head_name ?: "—", "₹${"%.2f".format(line.amount ?: 0.0)}")
            }
            PayslipRow(
                "Total Deductions", "₹${"%.2f".format(totalDeductions)}",
                bold = true, color = MaterialTheme.colorScheme.error
            )
        }

        HorizontalDivider()

        // Net
        PayslipRow(
            "Net Pay",
            "₹${payslip.net_pay?.let { "%.2f".format(it) } ?: "—"}",
            bold = true, color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun PayslipRow(
    label: String,
    value: String,
    bold: Boolean = false,
    color: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = if (bold) FontWeight.SemiBold else FontWeight.Normal,
            modifier = Modifier.weight(1f))
        Text(value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
            color = color)
    }
}
