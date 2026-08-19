package com.ankitinfotech.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ankitinfotech.employeeapp.api.ApiClient
import com.ankitinfotech.employeeapp.api.Holiday
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class HolidaysUiState {
    object Loading : HolidaysUiState()
    data class Success(val holidays: List<Holiday>) : HolidaysUiState()
    data class Error(val message: String) : HolidaysUiState()
}

class HolidaysViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)

    private val _uiState = MutableStateFlow<HolidaysUiState>(HolidaysUiState.Loading)
    val uiState: StateFlow<HolidaysUiState> = _uiState

    init { refresh() }

    fun refresh() {
        _uiState.value = HolidaysUiState.Loading
        viewModelScope.launch {
            try {
                val resp = apiService.getHolidays()
                if (resp.isSuccessful && resp.body() != null) {
                    val body = resp.body()!!
                    val gson = com.google.gson.Gson()
                    val json = gson.toJson(body)
                    
                    // Try parsing as a direct list
                    val holidayList = try {
                        val type = object : com.google.gson.reflect.TypeToken<List<Holiday>>() {}.type
                        gson.fromJson<List<Holiday>>(json, type)
                    } catch (e: Exception) {
                        // Fallback: try parsing as a wrapped response
                        try {
                            gson.fromJson(json, com.ankitinfotech.employeeapp.api.HolidaysResponse::class.java).holidays
                        } catch (e2: Exception) { null }
                    }

                    if (holidayList != null) {
                        _uiState.value = HolidaysUiState.Success(holidayList)
                    } else {
                        _uiState.value = HolidaysUiState.Error("Unexpected holiday data format")
                    }
                } else {
                    _uiState.value = HolidaysUiState.Error("Failed to load holidays: ${resp.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = HolidaysUiState.Error(e.message ?: "Network error")
            }
        }
    }
}
