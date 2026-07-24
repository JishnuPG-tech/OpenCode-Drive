package com.opencode.mobile.ui.screen.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opencode.mobile.data.api.OpenCodeApi
import com.opencode.mobile.data.model.Config
import com.opencode.mobile.data.api.UpdateConfigRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val api: OpenCodeApi
) : ViewModel() {

    private val _config = MutableStateFlow(Config())
    val config: StateFlow<Config> = _config.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _serverUrl = MutableStateFlow("http://localhost:3000")
    val serverUrl: StateFlow<String> = _serverUrl.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    init {
        // Don't auto-test connection
        _isConnected.value = false
    }

    fun loadConfig() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val response = api.getConfig()
                if (response.isSuccessful) {
                    _config.value = response.body() ?: Config()
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun updateTheme(theme: String) {
        viewModelScope.launch {
            try {
                val response = api.updateConfig(UpdateConfigRequest(theme = theme))
                if (response.isSuccessful) {
                    _config.value = _config.value.copy(theme = theme)
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    fun updateServerUrl(url: String) {
        _serverUrl.value = url
    }

    fun testConnection() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val response = api.getHealth()
                _isConnected.value = response.isSuccessful
                if (!response.isSuccessful) {
                    _error.value = "Connection failed: ${response.code()}"
                }
            } catch (e: Exception) {
                _isConnected.value = false
                _error.value = "Cannot connect to server"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
