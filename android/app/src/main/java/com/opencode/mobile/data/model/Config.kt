package com.opencode.mobile.data.model

import com.google.gson.annotations.SerializedName

data class Config(
    @SerializedName("theme") val theme: String = "dark",
    @SerializedName("model") val model: String = "",
    @SerializedName("provider") val provider: String = "",
    @SerializedName("api_key") val apiKey: String = ""
)

data class Model(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("provider_id") val providerId: String
)

data class HealthResponse(
    @SerializedName("status") val status: String,
    @SerializedName("version") val version: String = ""
)
