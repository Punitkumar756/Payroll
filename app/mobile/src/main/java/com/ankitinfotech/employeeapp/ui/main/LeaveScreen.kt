package com.ankitinfotech.employeeapp.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LeaveScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Leave Balances", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("12", style = MaterialTheme.typography.headlineLarge)
                    Text("Annual Leave")
                }
            }
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("5", style = MaterialTheme.typography.headlineLarge)
                    Text("Sick Leave")
                }
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = { /* TODO: Apply Leave */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Apply for Leave")
        }
    }
}
