package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PayrollScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("My Payslips", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("July 2026", style = MaterialTheme.typography.titleMedium)
                    Text("$4,500.00", color = MaterialTheme.colorScheme.primary)
                }
                Button(onClick = { /* TODO: Download PDF */ }) {
                    Text("Download")
                }
            }
        }
    }
}
