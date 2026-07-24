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

    init {
        // Start with welcome message
        _messages.value = listOf(
            Message(
                id = "welcome",
                sessionId = "",
                role = MessageRole.ASSISTANT,
                content = "Hello! I'm OpenCode AI assistant. How can I help you today?"
            )
        )
    }

    fun setSessionId(sessionId: String) {
        currentSessionId = sessionId
        loadMessages()
    }

    private fun loadMessages() {
        viewModelScope.launch {
            currentSessionId?.let { sessionId ->
                try {
                    sessionRepository.getMessages(sessionId).collect { result ->
                        result.fold(
                            onSuccess = { messages ->
                                if (messages.isNotEmpty()) {
                                    _messages.value = messages
                                }
                            },
                            onFailure = { e ->
                                // Silently handle - server might not be available
                            }
                        )
                    }
                } catch (e: Exception) {
                    // Server not available - keep mock messages
                }
            }
        }
    }

    fun updateInput(text: String) {
        _inputText.value = text
    }

    fun sendMessage() {
        val content = _inputText.value.trim()
        if (content.isNotEmpty()) {
            // Add user message to list
            val userMessage = Message(
                id = System.currentTimeMillis().toString(),
                sessionId = currentSessionId ?: "",
                role = MessageRole.USER,
                content = content
            )
            _messages.value = _messages.value + userMessage
            _inputText.value = ""

            // Try to send to server
            viewModelScope.launch {
                currentSessionId?.let { sessionId ->
                    try {
                        sessionRepository.sendMessage(sessionId, content).fold(
                            onSuccess = { message ->
                                _messages.value = _messages.value + message
                            },
                            onFailure = { e ->
                                // Server not available - show mock response
                                val mockResponse = Message(
                                    id = "mock-${System.currentTimeMillis()}",
                                    sessionId = sessionId,
                                    role = MessageRole.ASSISTANT,
                                    content = "I received your message: '$content'. The server is not connected, but I'm here to help!"
                                )
                                _messages.value = _messages.value + mockResponse
                            }
                        )
                    } catch (e: Exception) {
                        // Server not available - show mock response
                        val mockResponse = Message(
                            id = "mock-${System.currentTimeMillis()}",
                            sessionId = sessionId,
                            role = MessageRole.ASSISTANT,
                            content = "I received your message: '$content'. The server is not connected, but I'm here to help!"
                        )
                        _messages.value = _messages.value + mockResponse
                    }
                }
            }
        }
    }

    fun abortStream() {
        viewModelScope.launch {
            currentSessionId?.let { sessionId ->
                try {
                    sessionRepository.abortSession(sessionId)
                } catch (e: Exception) {
                    // Ignore
                }
            }
            _isStreaming.value = false
        }
    }

    override fun onCleared() {
        super.onCleared()
        sseClient.disconnect()
    }
}
