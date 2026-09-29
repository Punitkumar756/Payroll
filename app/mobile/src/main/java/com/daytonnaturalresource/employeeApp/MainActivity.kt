package com.daytonnaturalresource.employeeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.daytonnaturalresource.employeeapp.ui.auth.LoginScreen
import com.daytonnaturalresource.employeeapp.ui.auth.LoginUiState
import com.daytonnaturalresource.employeeapp.ui.auth.LoginViewModel
import com.daytonnaturalresource.employeeapp.ui.main.MainScreen
import com.daytonnaturalresource.employeeapp.ui.theme.HrmsTheme

class MainActivity : ComponentActivity() {
    private val loginViewModel: LoginViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HrmsTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
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
