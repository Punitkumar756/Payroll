package com.ankitinfotech.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ankitinfotech.employeeapp.api.ApiClient
import com.ankitinfotech.employeeapp.api.FullEmployee
import com.ankitinfotech.employeeapp.data.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val employee: FullEmployee) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

class ProfileViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)
    private val tokenManager = TokenManager(application)

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    init {
        fetchProfile()
    }

    fun fetchProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            try {
                var employeeId = tokenManager.getEmployeeId()
                
                // If ID is missing, try to recover it from /auth/me
                if (employeeId == -1) {
                    val meResp = apiService.getMe()
                    if (meResp.isSuccessful && meResp.body() != null) {
                        val user = meResp.body()!!
                        employeeId = user.employeeId ?: user.userId
                        tokenManager.saveEmployeeId(employeeId)
                    }
                }

                if (employeeId == -1) {
                    _uiState.value = ProfileUiState.Error("Employee ID not found")
                    return@launch
                }

                val response = apiService.getEmployeeDetails(employeeId)
                if (response.isSuccessful && response.body() != null) {
                    val employee = response.body()!!
                    _uiState.value = ProfileUiState.Success(employee)
                    
                    // Update TokenManager with potentially updated basic info
                    tokenManager.saveUserName(employee.first_name ?: "", employee.last_name ?: "")
                } else {
                    val errorMsg = try {
                        val json = response.errorBody()?.string()
                        val obj = com.google.gson.JsonParser.parseString(json).asJsonObject
                        obj.get("detail").asString
                    } catch (e: Exception) {
                        response.message()
                    }
                    _uiState.value = ProfileUiState.Error("Failed to fetch profile: $errorMsg")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Network error")
            }
        }
    }
}
