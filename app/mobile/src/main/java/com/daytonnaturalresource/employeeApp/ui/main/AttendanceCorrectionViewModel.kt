package com.daytonnaturalresource.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.daytonnaturalresource.employeeapp.api.ApiClient
import com.daytonnaturalresource.employeeapp.api.CorrectionRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AttendanceCorrectionViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)
    private val _uiState = MutableStateFlow(CorrectionUiState())
    val uiState: StateFlow<CorrectionUiState> = _uiState.asStateFlow()

    fun updateDate(date: String) {
        _uiState.value = _uiState.value.copy(date = date)
    }

    fun updateCheckIn(time: String) {
        _uiState.value = _uiState.value.copy(checkIn = time)
    }

    fun updateCheckOut(time: String) {
        _uiState.value = _uiState.value.copy(checkOut = time)
    }

    fun updateReason(reason: String) {
        _uiState.value = _uiState.value.copy(reason = reason)
    }
    
    fun resetState() {
        _uiState.value = CorrectionUiState()
    }

    fun submitCorrection(onSuccess: () -> Unit, onError: (String) -> Unit) {
        val state = _uiState.value
        if (state.date.isBlank() || state.reason.isBlank()) {
            onError("Date and Reason are required")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                var formattedDate = state.date.replace(" ", "-").replace("/", "-")
                if (formattedDate.length == 8 && formattedDate.all { it.isDigit() }) {
                    formattedDate = "${formattedDate.substring(0, 4)}-${formattedDate.substring(4, 6)}-${formattedDate.substring(6, 8)}"
                }
                val formattedCheckIn = state.checkIn.replace(" ", ":").replace(".", ":").ifBlank { null }
                val formattedCheckOut = state.checkOut.replace(" ", ":").replace(".", ":").ifBlank { null }
                
                val req = CorrectionRequest(
                    attendance_date = formattedDate,
                    requested_check_in = formattedCheckIn,
                    requested_check_out = formattedCheckOut,
                    reason = state.reason
                )
                val response = apiService.requestCorrection(req)
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
                    onSuccess()
                } else {
                    val msg = "Failed to submit correction"
                    _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
                    onError(msg)
                }
            } catch (e: Exception) {
                val msg = e.message ?: "An error occurred"
                _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
                onError(msg)
            }
        }
    }
}

data class CorrectionUiState(
    val date: String = "",
    val checkIn: String = "",
    val checkOut: String = "",
    val reason: String = "",
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null
)
