package com.opencode.mobile.ui.screen.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opencode.mobile.data.model.Session
import com.opencode.mobile.data.repository.SessionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val sessionRepository: SessionRepository
) : ViewModel() {

    private val _sessions = MutableStateFlow<List<Session>>(emptyList())
    val sessions: StateFlow<List<Session>> = _sessions.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    init {
        // Don't auto-load - wait for user to connect
        _sessions.value = getMockSessions()
    }

    private fun getMockSessions(): List<Session> {
        return listOf(
            Session(id = "1", title = "Welcome Session", status = com.opencode.mobile.data.model.SessionStatus.IDLE, updatedAt = "Just now"),
            Session(id = "2", title = "Demo Project", status = com.opencode.mobile.data.model.SessionStatus.IDLE, updatedAt = "2 hours ago"),
            Session(id = "3", title = "Code Review", status = com.opencode.mobile.data.model.SessionStatus.IDLE, updatedAt = "Yesterday")
        )
    }

    fun loadSessions() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                sessionRepository.getSessions().collect { result ->
                    result.fold(
                        onSuccess = { sessions ->
                            _sessions.value = sessions
                            _isConnected.value = true
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

    fun createSession(title: String = "New Session") {
        viewModelScope.launch {
            sessionRepository.createSession(title).fold(
                onSuccess = {
                    loadSessions()
                },
                onFailure = { e ->
                    _error.value = e.message
                }
            )
        }
    }

    fun deleteSession(id: String) {
        viewModelScope.launch {
            sessionRepository.deleteSession(id).fold(
                onSuccess = {
                    loadSessions()
                },
                onFailure = { e ->
                    _error.value = e.message
                }
            )
        }
    }
}
