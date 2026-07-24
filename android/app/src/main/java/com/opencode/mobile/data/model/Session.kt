package com.opencode.mobile.data.model

import com.google.gson.annotations.SerializedName

data class Session(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("status") val status: SessionStatus = SessionStatus.IDLE,
    @SerializedName("directory") val directory: String = "",
    @SerializedName("created_at") val createdAt: String = "",
    @SerializedName("updated_at") val updatedAt: String = ""
)

enum class SessionStatus {
    @SerializedName("idle") IDLE,
    @SerializedName("busy") BUSY,
    @SerializedName("error") ERROR
}
