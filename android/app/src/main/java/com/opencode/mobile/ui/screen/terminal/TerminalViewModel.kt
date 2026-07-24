package com.opencode.mobile.ui.screen.terminal

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class TerminalViewModel @Inject constructor() : ViewModel() {

    private val _terminalOutput = MutableStateFlow<List<String>>(emptyList())
    val terminalOutput: StateFlow<List<String>> = _terminalOutput.asStateFlow()

    private val _currentInput = MutableStateFlow("")
    val currentInput: StateFlow<String> = _currentInput.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        connectToTerminal()
    }

    private fun connectToTerminal() {
        _isConnected.value = true
        _terminalOutput.value = listOf(
            "OpenCode Terminal v1.0.0",
            "Type 'help' for available commands.",
            ""
        )
    }

    fun updateInput(input: String) {
        _currentInput.value = input
    }

    fun executeCommand() {
        val command = _currentInput.value.trim()
        if (command.isNotEmpty()) {
            _terminalOutput.value = _terminalOutput.value + "$ $command"
            
            when {
                command == "help" -> {
                    _terminalOutput.value = _terminalOutput.value + """
                        |Available commands:
                        |  help     - Show this help message
                        |  clear    - Clear terminal
                        |  echo     - Echo text
                        |  date     - Show current date/time
                        |  ls       - List files (simulated)
                        |  pwd      - Print working directory
                        |  whoami   - Show current user
                        |  exit     - Disconnect terminal
                    """.trimMargin()
                }
                command == "clear" -> {
                    _terminalOutput.value = emptyList()
                }
                command.startsWith("echo ") -> {
                    _terminalOutput.value = _terminalOutput.value + command.removePrefix("echo ")
                }
                command == "date" -> {
                    _terminalOutput.value = _terminalOutput.value + java.util.Date().toString()
                }
                command == "ls" -> {
                    _terminalOutput.value = _terminalOutput.value + """
                        |Documents/
                        |Downloads/
                        |Pictures/
                        |readme.txt
                        |main.py
                    """.trimMargin()
                }
                command == "pwd" -> {
                    _terminalOutput.value = _terminalOutput.value + "/home/user"
                }
                command == "whoami" -> {
                    _terminalOutput.value = _terminalOutput.value + "user"
                }
                command == "exit" -> {
                    _terminalOutput.value = _terminalOutput.value + "Terminal disconnected."
                    _isConnected.value = false
                }
                else -> {
                    _terminalOutput.value = _terminalOutput.value + "Command not found: $command"
                }
            }
            
            _terminalOutput.value = _terminalOutput.value + ""
            _currentInput.value = ""
        }
    }

    fun clearTerminal() {
        _terminalOutput.value = emptyList()
    }
}
