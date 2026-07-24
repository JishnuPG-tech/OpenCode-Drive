package com.opencode.mobile.data.repository

import com.opencode.mobile.data.api.OpenCodeApi
import com.opencode.mobile.data.model.FileItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FileRepository @Inject constructor(
    private val api: OpenCodeApi
) {
    fun listFiles(path: String = ""): Flow<Result<List<FileItem>>> = flow {
        try {
            val response = api.listFiles(path)
            if (response.isSuccessful) {
                emit(Result.success(response.body() ?: emptyList()))
            } else {
                emit(Result.failure(Exception("Failed to list files: ${response.code()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    suspend fun readFile(path: String): Result<String> {
        return try {
            val response = api.readFile(path)
            if (response.isSuccessful) {
                Result.success(response.body() ?: "")
            } else {
                Result.failure(Exception("Failed to read file: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
