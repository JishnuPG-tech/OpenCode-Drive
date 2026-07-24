package com.opencode.mobile.ui.screen.files

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opencode.mobile.data.model.FileItem
import com.opencode.mobile.data.model.FileType
import com.opencode.mobile.data.repository.FileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FilesViewModel @Inject constructor(
    private val fileRepository: FileRepository
) : ViewModel() {

    private val _files = MutableStateFlow<List<FileItem>>(emptyList())
    val files: StateFlow<List<FileItem>> = _files.asStateFlow()

    private val _currentPath = MutableStateFlow("")
    val currentPath: StateFlow<String> = _currentPath.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _fileContent = MutableStateFlow<String?>(null)
    val fileContent: StateFlow<String?> = _fileContent.asStateFlow()

    init {
        // Start with mock files
        _files.value = getMockFiles()
    }

    private fun getMockFiles(): List<FileItem> {
        return listOf(
            FileItem(name = "src", path = "src", type = FileType.DIRECTORY),
            FileItem(name = "app", path = "app", type = FileType.DIRECTORY),
            FileItem(name = "README.md", path = "README.md", type = FileType.FILE, size = 1024),
            FileItem(name = "package.json", path = "package.json", type = FileType.FILE, size = 512),
            FileItem(name = "index.ts", path = "index.ts", type = FileType.FILE, size = 2048)
        )
    }

    fun loadFiles(path: String = "") {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _currentPath.value = path
            _fileContent.value = null
            
            try {
                fileRepository.listFiles(path).collect { result ->
                    result.fold(
                        onSuccess = { files ->
                            _files.value = files
                            _isLoading.value = false
                        },
                        onFailure = { e ->
                            _error.value = e.message
                            _isLoading.value = false
                        }
                    )
                }
            } catch (e: Exception) {
                _error.value = "Server not available"
                _isLoading.value = false
            }
        }
    }

    fun openFile(file: FileItem) {
        if (file.type == FileType.DIRECTORY) {
            loadFiles(file.path)
        } else {
            viewModelScope.launch {
                try {
                    fileRepository.readFile(file.path).fold(
                        onSuccess = { content ->
                            _fileContent.value = content
                        },
                        onFailure = { e ->
                            _error.value = e.message
                        }
                    )
                } catch (e: Exception) {
                    _error.value = "Server not available"
                }
            }
        }
    }

    fun navigateUp() {
        val path = _currentPath.value
        val parentPath = path.substringBeforeLast("/", "")
        loadFiles(parentPath)
    }
}
