package com.ankitinfotech.employeeapp.api

import android.content.Context
import android.os.Build
import com.ankitinfotech.employeeapp.data.TokenManager
import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
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

            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
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
