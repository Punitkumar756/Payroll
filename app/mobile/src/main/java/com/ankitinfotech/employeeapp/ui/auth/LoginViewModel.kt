package com.ankitinfotech.employeeapp.ui.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ankitinfotech.employeeapp.api.ApiClient
import com.ankitinfotech.employeeapp.api.LoginRequest
import com.ankitinfotech.employeeapp.data.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val message: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)
    private val tokenManager = TokenManager(application)

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState

    init {
        checkToken()
    }

    private fun checkToken() {
        if (tokenManager.getToken() != null) {
            _uiState.value = LoginUiState.Success("Already logged in")
        }
    }

    fun login(email: String, password_hash: String) {
        _uiState.value = LoginUiState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.login(LoginRequest(email, password_hash))
                if (response.isSuccessful && response.body() != null) {
                    tokenManager.saveToken(response.body()!!.token)
                    _uiState.value = LoginUiState.Success("Login successful")
                } else {
                    _uiState.value = LoginUiState.Error("Invalid credentials")
                }
            } catch (e: Exception) {
                _uiState.value = LoginUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun logout() {
        tokenManager.clearToken()
        _uiState.value = LoginUiState.Idle
    }
}
