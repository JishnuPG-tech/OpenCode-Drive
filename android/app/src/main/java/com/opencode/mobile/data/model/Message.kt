package com.opencode.mobile.data.model

import com.google.gson.annotations.SerializedName

data class Message(
    @SerializedName("id") val id: String,
    @SerializedName("session_id") val sessionId: String,
    @SerializedName("role") val role: MessageRole,
    @SerializedName("content") val content: String = "",
    @SerializedName("parts") val parts: List<MessagePart> = emptyList(),
    @SerializedName("created_at") val createdAt: String = ""
)

enum class MessageRole {
    @SerializedName("user") USER,
    @SerializedName("assistant") ASSISTANT,
    @SerializedName("system") SYSTEM
}

data class MessagePart(
    @SerializedName("type") val type: String,
    @SerializedName("text") val text: String? = null,
    @SerializedName("tool_call") val toolCall: ToolCall? = null
)

data class ToolCall(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("arguments") val arguments: String
)
