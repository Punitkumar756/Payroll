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
            // Fetch and save employeeId if missing
            if (tokenManager.getEmployeeId() == -1) {
                viewModelScope.launch {
                    try {
                        val response = apiService.getMe()
                        if (response.isSuccessful && response.body() != null) {
                            val user = response.body()!!
                            val idToSave = user.employeeId ?: user.userId
                            tokenManager.saveEmployeeId(idToSave)
                        }
                    } catch (e: Exception) {
                        // Ignore error here
                    }
                }
            }
        }
    }

    fun login(username: String, password: String) {
        _uiState.value = LoginUiState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.login(LoginRequest(username, password))
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    body.accessToken?.let { tokenManager.saveToken(it) }
                    body.user?.let { user ->
                        // If employeeId is missing, fallback to userId
                        val idToSave = user.employeeId ?: user.userId
                        tokenManager.saveEmployeeId(idToSave)
                        
                        tokenManager.saveUserName(user.firstName ?: "", user.lastName ?: "")
                        tokenManager.saveRole(user.role ?: "")
                    }
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
