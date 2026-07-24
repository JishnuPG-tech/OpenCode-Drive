package com.opencode.mobile.data.repository

import com.opencode.mobile.data.api.CreateSessionRequest
import com.opencode.mobile.data.api.OpenCodeApi
import com.opencode.mobile.data.api.SendMessageRequest
import com.opencode.mobile.data.api.UpdateConfigRequest
import com.opencode.mobile.data.api.UpdateSessionRequest
import com.opencode.mobile.data.model.Message
import com.opencode.mobile.data.model.Session
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionRepository @Inject constructor(
    private val api: OpenCodeApi
) {
    fun getSessions(): Flow<Result<List<Session>>> = flow {
        try {
            val response = api.getSessions()
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to fetch sessions: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    suspend fun createSession(title: String = "New Session"): Result<Session> {
        return try {
            val response = api.createSession(CreateSessionRequest(title))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create session: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteSession(id: String): Result<Unit> {
        return try {
            val response = api.deleteSession(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete session: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateSession(id: String, title: String): Result<Session> {
        return try {
            val response = api.updateSession(id, UpdateSessionRequest(title))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update session: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getMessages(sessionId: String): Flow<Result<List<Message>>> = flow {
        try {
            val response = api.getMessages(sessionId)
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to fetch messages: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    suspend fun sendMessage(sessionId: String, content: String): Result<Message> {
        return try {
            val response = api.sendMessage(sessionId, SendMessageRequest(content))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to send message: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun abortSession(sessionId: String): Result<Unit> {
        return try {
            val response = api.abortSession(sessionId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to abort session: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
