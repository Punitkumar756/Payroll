package com.daytonnaturalresource.employeeapp.ui.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.daytonnaturalresource.employeeapp.api.ApiClient
import com.daytonnaturalresource.employeeapp.api.Payslip
import com.daytonnaturalresource.employeeapp.api.PayslipLine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class PayrollUiState {
    object Loading : PayrollUiState()
    data class Success(val payslips: List<Payslip>) : PayrollUiState()
    data class Error(val message: String) : PayrollUiState()
}

class PayrollViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = ApiClient.getService(application)

    private val _uiState = MutableStateFlow<PayrollUiState>(PayrollUiState.Loading)
    val uiState: StateFlow<PayrollUiState> = _uiState

    private val _selectedPayslip = MutableStateFlow<Payslip?>(null)
    val selectedPayslip: StateFlow<Payslip?> = _selectedPayslip

    private val _selectedLines = MutableStateFlow<List<PayslipLine>?>(null)
    val selectedLines: StateFlow<List<PayslipLine>?> = _selectedLines

    private val _detailLoading = MutableStateFlow(false)
    val detailLoading: StateFlow<Boolean> = _detailLoading

    init { refresh() }

    fun refresh() {
        _uiState.value = PayrollUiState.Loading
        viewModelScope.launch {
            try {
                val resp = apiService.getPayslips()
                if (resp.isSuccessful) {
                    _uiState.value = PayrollUiState.Success(resp.body() ?: emptyList())
                } else {
                    _uiState.value = PayrollUiState.Error("Failed to load payslips")
                }
            } catch (e: Exception) {
                _uiState.value = PayrollUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun loadDetail(payslip: Payslip) {
        _selectedPayslip.value = payslip
        _selectedLines.value = null
        _detailLoading.value = true
        viewModelScope.launch {
            try {
                val resp = apiService.getPayslipLines(payslip.id)
                if (resp.isSuccessful) _selectedLines.value = resp.body()
            } catch (_: Exception) {
            } finally {
                _detailLoading.value = false
            }
        }
    }

    fun clearDetail() {
        _selectedPayslip.value = null
        _selectedLines.value = null
    }
}
