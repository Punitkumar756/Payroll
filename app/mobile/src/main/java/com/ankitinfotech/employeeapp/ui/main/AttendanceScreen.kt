package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AttendanceScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Current Time", style = MaterialTheme.typography.titleMedium)
        Text("10:00 AM", style = MaterialTheme.typography.displayMedium)
        Spacer(modifier = Modifier.height(32.dp))
        Button(
            onClick = { /* TODO: Implement Clock In */ },
            modifier = Modifier.size(200.dp, 60.dp)
        ) {
            Text("Clock In", style = MaterialTheme.typography.titleMedium)
        }
    }
}
