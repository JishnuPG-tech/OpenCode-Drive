package com.opencode.mobile.data.api

import com.google.gson.annotations.SerializedName
import com.opencode.mobile.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface OpenCodeApi {
    @GET("health")
    suspend fun getHealth(): Response<HealthResponse>

    @GET("sessions")
    suspend fun getSessions(): Response<List<Session>>

    @GET("sessions/{id}")
    suspend fun getSession(@Path("id") id: String): Response<Session>

    @POST("sessions")
    suspend fun createSession(@Body request: CreateSessionRequest): Response<Session>

    @DELETE("sessions/{id}")
    suspend fun deleteSession(@Path("id") id: String): Response<Unit>

    @PATCH("sessions/{id}")
    suspend fun updateSession(
        @Path("id") id: String,
        @Body request: UpdateSessionRequest
    ): Response<Session>

    @GET("sessions/{id}/messages")
    suspend fun getMessages(@Path("id") id: String): Response<List<Message>>

    @POST("sessions/{id}/messages")
    suspend fun sendMessage(
        @Path("id") id: String,
        @Body request: SendMessageRequest
    ): Response<Message>

    @POST("sessions/{id}/abort")
    suspend fun abortSession(@Path("id") id: String): Response<Unit>

    @GET("models")
    suspend fun getModels(): Response<List<Model>>

    @GET("config")
    suspend fun getConfig(): Response<Config>

    @PATCH("config")
    suspend fun updateConfig(@Body request: UpdateConfigRequest): Response<Config>

    @GET("files")
    suspend fun listFiles(@Query("path") path: String = ""): Response<List<FileItem>>

    @GET("files/content")
    suspend fun readFile(@Query("path") path: String): Response<String>
}

data class CreateSessionRequest(
    @SerializedName("title") val title: String = "New Session"
)

data class UpdateSessionRequest(
    @SerializedName("title") val title: String? = null
)

data class SendMessageRequest(
    @SerializedName("content") val content: String
)

data class UpdateConfigRequest(
    @SerializedName("theme") val theme: String? = null,
    @SerializedName("model") val model: String? = null,
    @SerializedName("provider") val provider: String? = null,
    @SerializedName("api_key") val apiKey: String? = null
)
