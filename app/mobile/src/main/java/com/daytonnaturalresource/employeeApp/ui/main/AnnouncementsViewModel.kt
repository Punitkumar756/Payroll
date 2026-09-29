package com.daytonnaturalresource.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.daytonnaturalresource.employeeapp.api.Announcement
import com.daytonnaturalresource.employeeapp.api.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AnnouncementsUiState {
    object Loading : AnnouncementsUiState()
    data class Success(val announcements: List<Announcement>) : AnnouncementsUiState()
    data class Error(val message: String) : AnnouncementsUiState()
}

class AnnouncementsViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)

    private val _uiState = MutableStateFlow<AnnouncementsUiState>(AnnouncementsUiState.Loading)
    val uiState: StateFlow<AnnouncementsUiState> = _uiState

    init { refresh() }

    fun refresh() {
        _uiState.value = AnnouncementsUiState.Loading
        viewModelScope.launch {
            try {
                val resp = apiService.getAnnouncements()
                if (resp.isSuccessful && resp.body() != null) {
                    _uiState.value = AnnouncementsUiState.Success(resp.body()!!)
                } else {
                    _uiState.value = AnnouncementsUiState.Error("Failed to load announcements")
                }
            } catch (e: Exception) {
                _uiState.value = AnnouncementsUiState.Error(e.message ?: "Network error")
            }
        }
    }
}
