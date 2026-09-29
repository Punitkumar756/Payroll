package com.daytonnaturalresource.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.daytonnaturalresource.employeeapp.api.ApiClient
import com.daytonnaturalresource.employeeapp.api.AttendanceRecord
import com.daytonnaturalresource.employeeapp.api.TimecardRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

sealed class AttendanceUiState {
    object Loading : AttendanceUiState()
    data class Success(
        val records: List<AttendanceRecord>,
        val todayRecord: AttendanceRecord?
    ) : AttendanceUiState()
    data class Error(val message: String) : AttendanceUiState()
}

class AttendanceViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)

    private val _uiState = MutableStateFlow<AttendanceUiState>(AttendanceUiState.Loading)
    val uiState: StateFlow<AttendanceUiState> = _uiState

    private val _clockActionState = MutableStateFlow<String?>(null)
    val clockActionState: StateFlow<String?> = _clockActionState

    init { refresh() }

    fun refresh() {
        _uiState.value = AttendanceUiState.Loading
        viewModelScope.launch {
            try {
                val resp = apiService.getMyAttendance()
                if (resp.isSuccessful) {
                    val records = resp.body() ?: emptyList()
                    val todayStr = java.time.LocalDate.now().toString()
                    val today = records.firstOrNull { it.date?.startsWith(todayStr) == true }
                    _uiState.value = AttendanceUiState.Success(records, today)
                } else {
                    _uiState.value = AttendanceUiState.Error("Failed to load attendance")
                }
            } catch (e: Exception) {
                _uiState.value = AttendanceUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun clockIn(onResult: (Boolean, String) -> Unit) = sendTimecard("CLOCK_IN", onResult)
    fun clockOut(onResult: (Boolean, String) -> Unit) = sendTimecard("CLOCK_OUT", onResult)

    private fun sendTimecard(type: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                val now = Instant.now()
                    .atZone(ZoneId.of("Asia/Kolkata"))
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"))
                val resp = apiService.processTimecard(TimecardRequest(type, now))
                if (resp.isSuccessful) {
                    onResult(true, if (type == "CLOCK_IN") "Clocked in successfully!" else "Clocked out. Have a great day!")
                    refresh()
                } else {
                    onResult(false, "Action failed. Please try again.")
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Network error")
            }
        }
    }
}
