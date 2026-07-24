package com.opencode.mobile.ui.screen.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opencode.mobile.data.api.SseClient
import com.opencode.mobile.data.api.SseEvent
import com.opencode.mobile.data.model.Message
import com.opencode.mobile.data.model.MessageRole
import com.opencode.mobile.data.repository.SessionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val sessionRepository: SessionRepository,
    private val sseClient: SseClient
) : ViewModel() {

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()

    private val _isStreaming = MutableStateFlow(false)
    val isStreaming: StateFlow<Boolean> = _isStreaming.asStateFlow()

    private val _inputText = MutableStateFlow("")
    val inputText: StateFlow<String> = _inputText.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private var currentSessionId: String? = null

    fun setSessionId(sessionId: String) {
        currentSessionId = sessionId
        loadMessages()
        connectToStream()
    }

    private fun loadMessages() {
        viewModelScope.launch {
            currentSessionId?.let { sessionId ->
                sessionRepository.getMessages(sessionId).collect { result ->
                    result.fold(
                        onSuccess = { messages ->
                            _messages.value = messages
                        },
                        onFailure = { e ->
                            _error.value = e.message
                        }
                    )
                }
            }
        }
    }

    private fun connectToStream() {
        viewModelScope.launch {
            currentSessionId?.let { sessionId ->
                sseClient.streamEvents(
                    baseUrl = "http://localhost:3000",
                    sessionId = sessionId,
                    onEvent = { event ->
                        handleSseEvent(event)
                    },
                    onConnected = {
                        _isStreaming.value = true
                    },
                    onDisconnected = {
                        _isStreaming.value = false
                    },
                    onError = { e ->
                        _error.value = e.message
                    }
                )
            }
        }
    }

    private fun handleSseEvent(event: SseEvent) {
        when (event.type) {
            "message" -> {
                // Handle message content
            }
            "stream_start" -> {
                _isStreaming.value = true
            }
            "stream_end" -> {
                _isStreaming.value = false
                loadMessages()
            }
            "error" -> {
                _error.value = event.data
            }
        }
    }

    fun updateInput(text: String) {
        _inputText.value = text
    }

    fun sendMessage() {
        viewModelScope.launch {
            val content = _inputText.value.trim()
            if (content.isNotEmpty() && currentSessionId != null) {
                _inputText.value = ""
                
                sessionRepository.sendMessage(currentSessionId!!, content).fold(
                    onSuccess = { message ->
                        _messages.value = _messages.value + message
                    },
                    onFailure = { e ->
                        _error.value = e.message
                    }
                )
            }
        }
    }

    fun abortStream() {
        viewModelScope.launch {
            currentSessionId?.let { sessionId ->
                sessionRepository.abortSession(sessionId)
                _isStreaming.value = false
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        sseClient.disconnect()
    }
}
