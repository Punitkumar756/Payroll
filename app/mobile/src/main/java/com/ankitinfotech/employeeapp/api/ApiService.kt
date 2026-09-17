package com.ankitinfotech.employeeapp.api

import com.google.gson.annotations.SerializedName
import retrofit2.http.*
import retrofit2.Response
import okhttp3.MultipartBody
import okhttp3.RequestBody

// ── Auth ─────────────────────────────────────────────────────
data class LoginRequest(val username: String, val password: String)
data class LoginResponse(
    @SerializedName(value = "access_token", alternate = ["accessToken"]) val accessToken: String?,
    @SerializedName(value = "refresh_token", alternate = ["refreshToken"]) val refreshToken: String?,
    val user: User?
)
data class User(
    @SerializedName(value = "id", alternate = ["userId"]) val userId: Int,
    @SerializedName(value = "employee_id", alternate = ["employeeId"]) val employeeId: Int?,
    val email: String?,
    @SerializedName(value = "first_name", alternate = ["firstName"]) val firstName: String?,
    @SerializedName(value = "last_name", alternate = ["lastName"]) val lastName: String?,
    val role: String?
)

// ── Employee ──────────────────────────────────────────────────
data class FullEmployee(
    val id: Int,
    @SerializedName("employee_code") val employee_code: String?,
    @SerializedName("first_name") val first_name: String?,
    @SerializedName("middle_name") val middle_name: String?,
    @SerializedName("last_name") val last_name: String?,
    @SerializedName("official_email") val official_email: String?,
    @SerializedName("contact_number") val contact_number: String?,
    @SerializedName("designation_name") val designation_name: String?,
    @SerializedName("department_name") val department_name: String?,
    @SerializedName("location_name") val location_name: String?,
    @SerializedName("joining_date") val joining_date: String?,
    val status: String?,
    @SerializedName("bank_name") val bank_name: String?,
    @SerializedName("bank_ifsc") val bank_ifsc: String?,
    @SerializedName("pf_number") val pf_number: String?,
    @SerializedName("esi_number") val esi_number: String?,
    @SerializedName("uan_number") val uan_number: String?,
    @SerializedName("reporting_manager_name") val reporting_manager_name: String?,
    @SerializedName("calendar_id") val calendar_id: Int?
)

data class EmployeeDocument(
    val id: Int,
    @SerializedName(value = "document_name", alternate = ["documentName"]) val document_name: String?,
    @SerializedName(value = "file_path", alternate = ["filePath"]) val file_path: String?,
    @SerializedName(value = "uploaded_at", alternate = ["createdAt", "uploadedAt"]) val uploaded_at: String?
)

// ── Attendance ────────────────────────────────────────────────
data class AttendanceRecord(
    @SerializedName(value = "date", alternate = ["attendance_date", "attendanceDate"]) val date: String?,
    @SerializedName(value = "clock_in", alternate = ["clockIn", "check_in", "checkIn"]) val clock_in: String?,
    @SerializedName(value = "clock_out", alternate = ["clockOut", "check_out", "checkOut"]) val clock_out: String?,
    @SerializedName(value = "status", alternate = ["attendance_status", "attendanceStatus", "status_name", "type", "remarks"]) val status: String?,
    @SerializedName(value = "work_hours", alternate = ["workHours", "hours", "total_hours"]) val work_hours: Double?,
    @SerializedName(value = "shift_name", alternate = ["shiftName", "shift"]) val shift_name: String?,
    @SerializedName(value = "start_time", alternate = ["startTime"]) val start_time: String?,
    @SerializedName(value = "end_time", alternate = ["endTime"]) val end_time: String?
)
data class TimecardRequest(val type: String, val timestamp: String)

data class CorrectionRequest(
    val attendance_date: String,
    val requested_check_in: String?,
    val requested_check_out: String?,
    val reason: String
)

// ── Leave ─────────────────────────────────────────────────────
data class LeaveBalance(
    @SerializedName(value = "leave_type_id", alternate = ["leaveTypeId"]) val leave_type_id: Int,
    val code: String?,
    val name: String?,
    @SerializedName(value = "is_paid", alternate = ["isPaid"]) val is_paid: Int?,
    @SerializedName(value = "opening_balance", alternate = ["openingBalance"]) val opening_balance: Double?,
    val accrued: Double?,
    val used: Double?,
    @SerializedName(value = "available_balance", alternate = ["availableBalance"]) val available_balance: Double?
)

data class LeaveApplication(
    val id: Int,
    @SerializedName(value = "leave_type", alternate = ["leaveType"]) val leave_type: String?,
    @SerializedName(value = "start_date", alternate = ["startDate"]) val start_date: String?,
    @SerializedName(value = "end_date", alternate = ["endDate"]) val end_date: String?,
    @SerializedName(value = "total_days", alternate = ["totalDays"]) val total_days: Double?,
    val status: String?,
    val reason: String?,
    @SerializedName(value = "approver_remarks", alternate = ["approverRemarks"]) val approver_remarks: String?,
    @SerializedName(value = "created_at", alternate = ["createdAt"]) val created_at: String?
)

data class LeaveApplyRequest(
    val leave_type_id: Int,
    val start_date: String,
    val end_date: String,
    val reason: String
)

// ── Announcements ─────────────────────────────────────────────
data class Announcement(
    val id: Int,
    val heading: String?,
    val type: String?,
    @SerializedName(value = "display_start", alternate = ["displayStart"]) val display_start: String?,
    @SerializedName(value = "display_end", alternate = ["displayEnd"]) val display_end: String?,
    val content: String?,
    @SerializedName(value = "created_at", alternate = ["createdAt"]) val created_at: String?
)

// ── Tasks ─────────────────────────────────────────────────────
data class Task(
    val id: Int,
    val employee_id: Int?,
    val description: String?,
    val status: String?,
    @SerializedName(value = "created_at", alternate = ["createdAt"]) val created_at: String?,
    @SerializedName(value = "updated_at", alternate = ["updatedAt"]) val updated_at: String?
)

// ── Holidays ──────────────────────────────────────────────────
data class Holiday(
    @SerializedName(value = "id", alternate = ["holiday_id"]) val id: Int,
    @SerializedName(value = "name", alternate = ["holiday_name", "title", "holiday"]) val name: String?,
    @SerializedName(value = "start_date", alternate = ["startDate", "holiday_date", "date"]) val start_date: String?,
    @SerializedName(value = "end_date", alternate = ["endDate"]) val end_date: String?,
    @SerializedName(value = "is_optional", alternate = ["isOptional", "optional"]) val is_optional: Int?
)

data class HolidaysResponse(
    @SerializedName(value = "holidays", alternate = ["holiday_list", "data"]) val holidays: List<Holiday>?
)

// ── Dashboard ─────────────────────────────────────────────────
data class DashboardSummary(
    @SerializedName(value = "announcements", alternate = ["announcement", "announcements_list"]) val announcements: List<Announcement>?,
    @SerializedName(value = "today_attendance", alternate = ["todayAttendance", "attendance", "today_att"]) val todayAttendance: AttendanceRecord?,
    @SerializedName(value = "leave_balances", alternate = ["leaveBalances", "balances", "leave_balance"]) val leaveBalances: List<LeaveBalance>?,
    @SerializedName(value = "upcoming_holidays", alternate = ["upcomingHolidays", "holidays", "holiday_list", "upcoming"]) val upcomingHolidays: List<Holiday>?
)

// ── Payroll ───────────────────────────────────────────────────
data class Payslip(
    val id: Int,
    val month: Int?,
    val year: Int?,
    val month_year: String?,
    val net_pay: Double?,
    val gross_pay: Double?,
    val total_deductions: Double?,
    val status: String?,
    val paid_on: String?
)

// PayslipDetail wraps the list of lines returned by /self/payslips/{id}/lines
// The parent payslip info comes from the Payslip object already fetched
data class PayslipLine(
    val id: Int?,
    val head_name: String?,
    val head_type: String?,   // EARNING or DEDUCTION
    val amount: Double?,
    val is_adhoc: Int?
)

// ── API Service ───────────────────────────────────────────────
interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<User>

    @GET("employees/{id}")
    suspend fun getEmployeeDetails(@Path("id") id: Int): Response<FullEmployee>

    @GET("attendance/self")
    suspend fun getMyAttendance(): Response<List<AttendanceRecord>>

    @POST("attendance/process-timecard")
    suspend fun processTimecard(@Body request: TimecardRequest): Response<Any>

    @POST("attendance/self/correction")
    suspend fun requestCorrection(@Body request: CorrectionRequest): Response<Any>

    @Multipart
    @POST("attendance/self/punch")
    suspend fun submitPunch(
        @Part photo: MultipartBody.Part,
        @Part("lat") lat: RequestBody,
        @Part("lng") lng: RequestBody,
        @Part("type") type: RequestBody
    ): Response<Any>

    @GET("leave/types")
    suspend fun getLeaveTypes(): Response<List<LeaveBalance>>

    @GET("leave/self/balance")
    suspend fun getLeaveBalance(): Response<List<LeaveBalance>>

    @GET("leave/self/applications")
    suspend fun getLeaveApplications(): Response<List<LeaveApplication>>

    @POST("leave/self/apply")
    suspend fun applyLeave(@Body request: LeaveApplyRequest): Response<Any>

    @DELETE("leave/self/{id}/cancel")
    suspend fun cancelLeave(@Path("id") id: Int): Response<Any>

    @GET("dashboard/employee")
    suspend fun getDashboardSummary(): Response<DashboardSummary>
    
    @GET("masters/announcements")
    suspend fun getAnnouncements(): Response<List<Announcement>>

    @GET("payroll/self/payslips")
    suspend fun getPayslips(): Response<List<Payslip>>

    @GET("payroll/self/payslips/{id}/lines")
    suspend fun getPayslipLines(@Path("id") id: Int): Response<List<PayslipLine>>

    @GET("masters/holidays")
    suspend fun getHolidays(): Response<Any>

    @GET("documents/{employeeId}")
    suspend fun getDocuments(@Path("employeeId") employeeId: Int): Response<List<EmployeeDocument>>

    @GET("tasks/employee/{id}")
    suspend fun getTasks(@Path("id") employeeId: Int): Response<List<Task>>

    @PATCH("tasks/self/{id}/status")
    suspend fun updateTaskStatus(@Path("id") taskId: Int, @Body request: UpdateTaskStatusRequest): Response<Any>
}

data class UpdateTaskStatusRequest(val status: String)
