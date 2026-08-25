package com.ankitinfotech.employeeapp.api

import android.content.Context
import android.os.Build
import com.ankitinfotech.employeeapp.data.TokenManager
import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Detect emulator vs physical device
    private val BASE_IP = if (Build.PRODUCT.contains("sdk") || Build.MODEL.contains("Emulator") || Build.FINGERPRINT.contains("generic")) 
        "10.0.2.2" 
    else 
        "192.168.0.187"

    private val BASE_URL = "http://$BASE_IP:5000/api/"
    
    private var retrofit: Retrofit? = null

    fun getService(context: Context): ApiService {
        if (retrofit == null) {
            val tokenManager = TokenManager(context)
            
            val authInterceptor = Interceptor { chain ->
                val request = chain.request()
                val requestBuilder = request.newBuilder()
                
                // Dynamically get the latest token from storage
                tokenManager.getToken()?.let {
                    requestBuilder.addHeader("Authorization", "Bearer $it")
                }
                
                requestBuilder.addHeader("Accept", "application/json")
                requestBuilder.addHeader("Content-Type", "application/json")
                
                chain.proceed(requestBuilder.build())
            }

            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authenticator = object : Authenticator {
                override fun authenticate(route: Route?, response: Response): Request? {
                    // Prevent infinite loops if refresh token itself is unauthorized
                    if (response.request.url.encodedPath.contains("auth/refresh")) {
                        tokenManager.clearToken()
                        return null
                    }
                    
                    val refreshToken = tokenManager.getRefreshToken()
                    if (refreshToken == null) {
                        tokenManager.clearToken()
                        return null
                    }
                    
                    try {
                        val jsonBody = JSONObject().put("refreshToken", refreshToken).toString()
                        val requestBody = jsonBody.toRequestBody("application/json".toMediaTypeOrNull())
                        
                        val refreshRequest = Request.Builder()
                            .url(BASE_URL + "auth/refresh")
                            .post(requestBody)
                            .header("Accept", "application/json")
                            .header("Content-Type", "application/json")
                            .build()
                            
                        val client = OkHttpClient()
                        val refreshResponse = client.newCall(refreshRequest).execute()
                        
                        if (refreshResponse.isSuccessful) {
                            val responseBody = refreshResponse.body?.string()
                            if (responseBody != null) {
                                val json = JSONObject(responseBody)
                                val newAccessToken = json.optString("accessToken")
                                if (newAccessToken.isNotEmpty()) {
                                    tokenManager.saveToken(newAccessToken)
                                    return response.request.newBuilder()
                                        .removeHeader("Authorization")
                                        .addHeader("Authorization", "Bearer $newAccessToken")
                                        .build()
                                }
                            }
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    
                    tokenManager.clearToken()
                    return null
                }
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .authenticator(authenticator)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            // Flexible Gson to handle various backend naming conventions
            val gson = GsonBuilder()
                .setLenient()
                .create()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
        }
        return retrofit!!.create(ApiService::class.java)
    }
}
