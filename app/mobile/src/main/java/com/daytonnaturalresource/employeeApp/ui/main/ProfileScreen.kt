package com.daytonnaturalresource.employeeapp.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.daytonnaturalresource.employeeapp.ui.auth.LoginViewModel
import com.daytonnaturalresource.employeeapp.ui.components.SkeletonCard
import com.daytonnaturalresource.employeeapp.utils.formatEmployeeCode
import com.daytonnaturalresource.employeeapp.utils.formatIsoDate
import com.daytonnaturalresource.employeeapp.utils.initials
import com.daytonnaturalresource.employeeapp.utils.toTitleCase

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    loginViewModel: LoginViewModel,
    profileViewModel: ProfileViewModel = viewModel()
) {
    val uiState by profileViewModel.uiState.collectAsState()

    // Re-fetch profile when screen is shown to ensure fresh data
    LaunchedEffect(Unit) {
        profileViewModel.fetchProfile()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Profile") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = { profileViewModel.fetchProfile() }) {
                        Icon(Icons.Filled.Refresh, "Refresh",
                            tint = MaterialTheme.colorScheme.onPrimary)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            when (val state = uiState) {
                is ProfileUiState.Loading -> {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Avatar skeleton
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                        repeat(3) { SkeletonCard() }
                    }
                }

                is ProfileUiState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Filled.ErrorOutline, null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.height(12.dp))
                        Text("Failed to load profile", style = MaterialTheme.typography.titleMedium)
                        Text(state.message, style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(16.dp))
                        FilledTonalButton(onClick = { profileViewModel.fetchProfile() }) {
                            Text("Retry")
                        }
                    }
                }

                is ProfileUiState.Success -> {
                    val emp = state.employee
                    val fullName = toTitleCase("${emp.first_name ?: ""} ${emp.middle_name ?: ""} ${emp.last_name ?: ""}".trim())

                    // ── Avatar hero ───────────────────────────────────
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.primary)
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    initials(emp.first_name ?: "", emp.last_name ?: ""),
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            }
                            Spacer(Modifier.height(10.dp))
                            Text(fullName,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimary)
                            Text(
                                formatEmployeeCode(emp.employee_code),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                            )
                            Spacer(Modifier.height(4.dp))
                            Surface(
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(20.dp)
                            ) {
                                Text(
                                    emp.status ?: "Active",
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            }
                        }
                    }

                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {

                        // ── Basic Info ────────────────────────────────
                        ProfileCard(title = "Basic Information") {
                            ProfileRow(Icons.Filled.Email, "Official Email", emp.official_email ?: "N/A")
                            ProfileRow(Icons.Filled.Phone, "Contact", emp.contact_number ?: "N/A")
                        }

                        // ── Job Details ───────────────────────────────
                        ProfileCard(title = "Job Details") {
                            ProfileRow(Icons.Filled.Business, "Department",
                                toTitleCase(emp.department_name) ?: "N/A")
                            ProfileRow(Icons.Filled.Work, "Designation",
                                toTitleCase(emp.designation_name) ?: "N/A")
                            ProfileRow(Icons.Filled.LocationOn, "Location",
                                emp.location_name ?: "N/A")
                            ProfileRow(Icons.Filled.CalendarToday, "Joining Date",
                                formatIsoDate(emp.joining_date))
                            ProfileRow(Icons.Filled.Person, "Manager",
                                toTitleCase(emp.reporting_manager_name) ?: "N/A")
                        }

                        // ── Financial Details ─────────────────────────
                        ProfileCard(title = "Financial Details") {
                            ProfileRow(Icons.Filled.AccountBalance, "Bank", emp.bank_name ?: "N/A")
                            ProfileRow(Icons.Filled.CreditCard, "IFSC", emp.bank_ifsc ?: "N/A")
                            ProfileRow(Icons.Filled.Receipt, "PF Number", emp.pf_number ?: "N/A")
                            ProfileRow(Icons.Filled.HealthAndSafety, "ESI Number", emp.esi_number ?: "N/A")
                            ProfileRow(Icons.Filled.Tag, "UAN", emp.uan_number ?: "N/A")
                        }

                        // ── Documents ─────────────────────────────────
                        ProfileCard(title = "My Documents") {
                            if (state.documents.isEmpty()) {
                                Text("No documents uploaded yet.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            } else {
                                val context = androidx.compose.ui.platform.LocalContext.current
                                state.documents.forEach { doc ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 8.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                            .clickable {
                                                if (doc.file_path != null) {
                                                    // File path might be relative, ensure we have a full URL
                                                    var url = doc.file_path
                                                    if (!url.startsWith("http")) {
                                                        val baseUrl = "http://192.168.0.187:5000/" // Using local IP
                                                        url = baseUrl + url
                                                    }
                                                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW)
                                                    intent.data = android.net.Uri.parse(url)
                                                    try {
                                                        context.startActivity(intent)
                                                    } catch (e: Exception) {
                                                        android.widget.Toast.makeText(context, "Cannot open link", android.widget.Toast.LENGTH_SHORT).show()
                                                    }
                                                }
                                            }
                                            .padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Filled.Description,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Spacer(Modifier.width(12.dp))
                                        Column {
                                            Text(
                                                text = doc.document_name ?: "Unknown Document",
                                                style = MaterialTheme.typography.bodyMedium,
                                                fontWeight = FontWeight.Medium
                                            )
                                            if (doc.uploaded_at != null) {
                                                Text(
                                                    text = "Uploaded on " + formatIsoDate(doc.uploaded_at),
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                        Spacer(Modifier.weight(1f))
                                        Icon(
                                            Icons.Filled.OpenInNew,
                                            contentDescription = "Open Document",
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // ── Logout ────────────────────────────────────
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = { loginViewModel.logout() },
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer,
                                contentColor   = MaterialTheme.colorScheme.onErrorContainer
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Filled.Logout, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Logout", fontWeight = FontWeight.SemiBold)
                        }
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    ElevatedCard(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(10.dp))
            HorizontalDivider()
            Spacer(Modifier.height(10.dp))
            content()
        }
    }
}

@Composable
private fun ProfileRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null,
            modifier = Modifier.size(18.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.width(10.dp))
        Text(label, style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.weight(1.2f))
    }
}
