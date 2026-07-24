package com.opencode.mobile.ui.component

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

@Composable
fun StreamingText(
    text: String,
    modifier: Modifier = Modifier
) {
    var displayedText by remember { mutableStateOf("") }
    var currentIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(text) {
        displayedText = ""
        currentIndex = 0
        text.forEachIndexed { index, char ->
            delay(10)
            displayedText = text.substring(0, index + 1)
        }
    }

    Text(
        text = displayedText,
        modifier = modifier,
        style = MaterialTheme.typography.bodyMedium
    )
}
