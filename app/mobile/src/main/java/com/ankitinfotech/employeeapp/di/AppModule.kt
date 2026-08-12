package com.ankitinfotech.employeeapp.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            // Placeholder base URL - needs to be configured with the actual backend host
            .baseUrl("http://10.0.2.2:3000/") 
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
