package com.ankitinfotech.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ankitinfotech.employeeapp.api.ApiClient
import com.ankitinfotech.employeeapp.api.DashboardSummary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val summary: DashboardSummary, val userName: String = "") : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)
    private val tokenManager = com.ankitinfotech.employeeapp.data.TokenManager(application)

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState

    init { refresh() }

    fun refresh() {
        _uiState.value = DashboardUiState.Loading
        viewModelScope.launch {
            try {
                // First, ensure TokenManager has up-to-date user info (like name)
                try {
                    val meResp = apiService.getMe()
                    if (meResp.isSuccessful && meResp.body() != null) {
                        val user = meResp.body()!!
                        tokenManager.saveUserName(user.firstName ?: "", user.lastName ?: "")
                        // Also update employeeId if it was fallback to userId before
                        val idToSave = user.employeeId ?: user.userId
                        tokenManager.saveEmployeeId(idToSave)
                    }
                } catch (_: Exception) {}

                val response = apiService.getDashboardSummary()
                if (response.isSuccessful && response.body() != null) {
                    var summary = response.body()!!
                    val userName = "${tokenManager.getFirstName() ?: ""} ${tokenManager.getLastName() ?: ""}".trim()
                    
                    // Fallback: If holidays are missing in summary, fetch them from the masters endpoint
                    if (summary.upcomingHolidays.isNullOrEmpty()) {
                        try {
                            val hResp = apiService.getHolidays()
                            if (hResp.isSuccessful && hResp.body() != null) {
                                val gson = com.google.gson.Gson()
                                val json = gson.toJson(hResp.body())
                                val type = object : com.google.gson.reflect.TypeToken<List<com.ankitinfotech.employeeapp.api.Holiday>>() {}.type
                                val allHolidays = gson.fromJson<List<com.ankitinfotech.employeeapp.api.Holiday>>(json, type)
                                
                                val today = java.time.LocalDate.now().toString()
                                val upcoming = allHolidays.filter { (it.start_date ?: "") >= today }.take(5)
                                summary = summary.copy(upcomingHolidays = upcoming)
                            }
                        } catch (_: Exception) {}
                    }
                    
                    _uiState.value = DashboardUiState.Success(summary, userName)
                } else {
                    _uiState.value = DashboardUiState.Error("Failed to load dashboard")
                }
            } catch (e: Exception) {
                _uiState.value = DashboardUiState.Error(e.message ?: "Network error")
            }
        }
    }
    
    fun punch(bitmap: android.graphics.Bitmap, lat: Double, lng: Double, type: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                val file = java.io.File(getApplication<Application>().cacheDir, "punch.jpg")
                val fos = java.io.FileOutputStream(file)
                bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, fos)
                fos.close()

                val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                val body = okhttp3.MultipartBody.Part.createFormData("photo", file.name, requestFile)
                val latBody = lat.toString().toRequestBody("text/plain".toMediaTypeOrNull())
                val lngBody = lng.toString().toRequestBody("text/plain".toMediaTypeOrNull())
                val typeBody = type.toRequestBody("text/plain".toMediaTypeOrNull())

                val response = apiService.submitPunch(body, latBody, lngBody, typeBody)
                if (response.isSuccessful) {
                    onResult(true, "Successfully punched $type")
                    refresh()
                } else {
                    val errorObj = response.errorBody()?.string()?.let { org.json.JSONObject(it) }
                    val msg = errorObj?.optString("detail") ?: "Failed to punch"
                    onResult(false, msg)
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Network error")
            }
        }
    }
}
