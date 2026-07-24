package com.opencode.mobile.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.opencode.mobile.ui.screen.chat.ChatScreen
import com.opencode.mobile.ui.screen.files.FilesScreen
import com.opencode.mobile.ui.screen.home.HomeScreen
import com.opencode.mobile.ui.screen.settings.SettingsScreen
import com.opencode.mobile.ui.screen.terminal.TerminalScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        modifier = modifier
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onSessionClick = { sessionId ->
                    navController.navigate(Screen.Chat.createRoute(sessionId))
                }
            )
        }

        composable(
            route = Screen.Chat.route,
            arguments = listOf(
                navArgument("sessionId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val sessionId = backStackEntry.arguments?.getString("sessionId") ?: return@composable
            ChatScreen(
                sessionId = sessionId,
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.Files.route) {
            FilesScreen()
        }

        composable(Screen.Terminal.route) {
            TerminalScreen()
        }

        composable(Screen.Settings.route) {
            SettingsScreen()
        }
    }
}
