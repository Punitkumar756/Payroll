package com.ankitinfotech.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ankitinfotech.employeeapp.api.ApiClient
import com.ankitinfotech.employeeapp.api.Task
import com.ankitinfotech.employeeapp.data.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class TasksUiState {
    object Idle : TasksUiState()
    object Loading : TasksUiState()
    data class Success(val tasks: List<Task>) : TasksUiState()
    data class Error(val message: String) : TasksUiState()
}

class TasksViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)
    private val tokenManager = TokenManager(application)

    private val _uiState = MutableStateFlow<TasksUiState>(TasksUiState.Idle)
    val uiState: StateFlow<TasksUiState> = _uiState

    init {
        refresh()
    }

    fun refresh() {
        _uiState.value = TasksUiState.Loading
        viewModelScope.launch {
            try {
                var employeeId = tokenManager.getEmployeeId()

                if (employeeId == -1) {
                    val meResp = apiService.getMe()
                    if (meResp.isSuccessful && meResp.body() != null) {
                        val user = meResp.body()!!
                        employeeId = user.employeeId ?: user.userId
                        tokenManager.saveEmployeeId(employeeId)
                    }
                }

                if (employeeId == -1) {
                    _uiState.value = TasksUiState.Error("Employee ID not found")
                    return@launch
                }

                val response = apiService.getTasks(employeeId)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = TasksUiState.Success(response.body()!!)
                } else {
                    _uiState.value = TasksUiState.Error("Failed to fetch tasks")
                }
            } catch (e: Exception) {
                _uiState.value = TasksUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun updateTaskStatus(taskId: Int, newStatus: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                val request = com.ankitinfotech.employeeapp.api.UpdateTaskStatusRequest(newStatus)
                val response = apiService.updateTaskStatus(taskId, request)
                if (response.isSuccessful) {
                    onResult(true, "Task marked as $newStatus")
                    refresh() // Refresh list to get updated status
                } else {
                    onResult(false, "Failed to update task")
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Network error")
            }
        }
    }
}
