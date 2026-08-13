package com.ankitinfotech.employeeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.ankitinfotech.employeeapp.ui.auth.LoginScreen
import com.ankitinfotech.employeeapp.ui.auth.LoginUiState
import com.ankitinfotech.employeeapp.ui.auth.LoginViewModel
import com.ankitinfotech.employeeapp.ui.main.MainScreen

class MainActivity : ComponentActivity() {
    private val loginViewModel: LoginViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val uiState by loginViewModel.uiState.collectAsState()
                    if (uiState is LoginUiState.Success) {
                        MainScreen(loginViewModel)
                    } else {
                        LoginScreen(loginViewModel, onLoginSuccess = {})
                    }
                }
            }
        }
    }
}
