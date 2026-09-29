package com.daytonnaturalresource.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.daytonnaturalresource.employeeapp.api.ApiClient
import com.daytonnaturalresource.employeeapp.api.LeaveApplication
import com.daytonnaturalresource.employeeapp.api.LeaveApplyRequest
import com.daytonnaturalresource.employeeapp.api.LeaveBalance
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class LeaveUiState {
    object Idle : LeaveUiState()
    object Loading : LeaveUiState()
    data class Success(
        val balances: List<LeaveBalance>,
        val applications: List<LeaveApplication>
    ) : LeaveUiState()
    data class Error(val message: String) : LeaveUiState()
}

class LeaveViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)

    private val _uiState = MutableStateFlow<LeaveUiState>(LeaveUiState.Idle)
    val uiState: StateFlow<LeaveUiState> = _uiState

    init { refresh() }

    fun refresh() {
        _uiState.value = LeaveUiState.Loading
        viewModelScope.launch {
            try {
                val balanceRes = apiService.getLeaveBalance()
                val appRes     = apiService.getLeaveApplications()
                if (balanceRes.isSuccessful && appRes.isSuccessful) {
                    _uiState.value = LeaveUiState.Success(
                        balanceRes.body() ?: emptyList(),
                        appRes.body()     ?: emptyList()
                    )
                } else {
                    _uiState.value = LeaveUiState.Error("Failed to fetch leave data")
                }
            } catch (e: Exception) {
                _uiState.value = LeaveUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun applyLeave(
        leaveTypeId: Int,
        startDate: String,
        endDate: String,
        reason: String,
        onResult: (Boolean, String) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val response = apiService.applyLeave(
                    LeaveApplyRequest(leaveTypeId, startDate, endDate, reason)
                )
                if (response.isSuccessful) {
                    onResult(true, "Leave applied successfully!")
                    refresh()
                } else {
                    val errBody = response.errorBody()?.string() ?: ""
                    val msg = try {
                        com.google.gson.JsonParser.parseString(errBody)
                            .asJsonObject.get("detail")?.asString ?: response.message()
                    } catch (_: Exception) { response.message() }
                    onResult(false, "Failed: $msg")
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Network error")
            }
        }
    }

    fun cancelLeave(applicationId: Int, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                val response = apiService.cancelLeave(applicationId)
                if (response.isSuccessful) {
                    onResult(true, "Leave cancelled successfully.")
                    refresh()
                } else {
                    onResult(false, "Failed to cancel leave.")
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Network error")
            }
        }
    }
}
