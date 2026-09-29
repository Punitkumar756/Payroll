package com.daytonnaturalresource.employeeapp.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class TokenManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) =
        sharedPreferences.edit().putString("jwt_token", token).apply()

    fun getToken(): String? =
        sharedPreferences.getString("jwt_token", null)

    fun saveRefreshToken(token: String) =
        sharedPreferences.edit().putString("refresh_token", token).apply()

    fun getRefreshToken(): String? =
        sharedPreferences.getString("refresh_token", null)

    fun saveEmployeeId(id: Int) =
        sharedPreferences.edit().putInt("employee_id", id).apply()

    fun getEmployeeId(): Int =
        sharedPreferences.getInt("employee_id", -1)

    fun saveUserName(firstName: String, lastName: String) {
        sharedPreferences.edit()
            .putString("first_name", firstName)
            .putString("last_name", lastName)
            .apply()
    }

    fun getFirstName(): String? = sharedPreferences.getString("first_name", null)
    fun getLastName(): String? = sharedPreferences.getString("last_name", null)

    fun saveRole(role: String) =
        sharedPreferences.edit().putString("role", role).apply()

    fun getRole(): String? = sharedPreferences.getString("role", null)

    fun clearToken() {
        sharedPreferences.edit()
            .remove("jwt_token")
            .remove("refresh_token")
            .remove("employee_id")
            .remove("first_name")
            .remove("last_name")
            .remove("role")
            .apply()
    }
}
