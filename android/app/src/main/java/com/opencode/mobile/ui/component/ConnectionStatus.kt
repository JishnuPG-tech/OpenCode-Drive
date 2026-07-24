package com.opencode.mobile.ui.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.opencode.mobile.ui.theme.StatusBusy
import com.opencode.mobile.ui.theme.StatusError
import com.opencode.mobile.ui.theme.StatusIdle

@Composable
fun ConnectionStatus(
    isConnected: Boolean,
    isConnecting: Boolean = false,
    modifier: Modifier = Modifier
) {
    val statusColor = when {
        isConnected -> StatusIdle
        isConnecting -> StatusBusy
        else -> StatusError
    }
    
    val statusText = when {
        isConnected -> "Connected"
        isConnecting -> "Connecting..."
        else -> "Disconnected"
    }

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(statusColor.copy(alpha = 0.2f))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(statusColor, RoundedCornerShape(4.dp))
        )
        Text(
            text = statusText,
            style = MaterialTheme.typography.labelSmall,
            color = statusColor
        )
    }
}
