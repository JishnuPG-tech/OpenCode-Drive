package com.opencode.mobile.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    data object Home : Screen("home", "Home", Icons.Default.Home)
    data object Chat : Screen("chat/{sessionId}", "Chat", Icons.Default.Chat) {
        fun createRoute(sessionId: String) = "chat/$sessionId"
    }
    data object Files : Screen("files", "Files", Icons.Default.Folder)
    data object Terminal : Screen("terminal", "Terminal", Icons.Default.Terminal)
    data object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Files,
    Screen.Terminal,
    Screen.Settings
)
