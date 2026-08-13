package com.ankitinfotech.employeeapp.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.Response

data class LoginRequest(val email: String, val password_hash: String)
data class LoginResponse(val token: String, val user: User)
data class User(val id: Int, val email: String, val first_name: String, val last_name: String, val role: String)

data class AttendanceRecord(val date: String, val clock_in: String?, val clock_out: String?, val status: String?)
data class TimecardRequest(val type: String, val timestamp: String)

data class LeaveBalance(val type_name: String, val balance: Int)
data class LeaveApplication(val leave_type: String, val start_date: String, val end_date: String, val status: String, val reason: String?)

data class Payslip(val id: Int, val month_year: String, val net_pay: Double, val status: String)

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<User>

    @GET("attendance/my")
    suspend fun getMyAttendance(): Response<List<AttendanceRecord>>

    @POST("attendance/process-timecard")
    suspend fun processTimecard(@Body request: TimecardRequest): Response<Any>

    @GET("leave/balance/2026")
    suspend fun getLeaveBalance(): Response<List<LeaveBalance>>

    @GET("leave/applications")
    suspend fun getLeaveApplications(): Response<List<LeaveApplication>>

    @GET("payroll/payslips")
    suspend fun getPayslips(): Response<List<Payslip>>
}
