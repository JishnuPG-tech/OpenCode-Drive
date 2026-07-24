package com.opencode.mobile.data.model

import com.google.gson.annotations.SerializedName

data class FileItem(
    @SerializedName("name") val name: String,
    @SerializedName("path") val path: String,
    @SerializedName("type") val type: FileType,
    @SerializedName("size") val size: Long = 0,
    @SerializedName("modified_at") val modifiedAt: String = ""
)

enum class FileType {
    @SerializedName("file") FILE,
    @SerializedName("directory") DIRECTORY,
    @SerializedName("symlink") SYMLINK
}
