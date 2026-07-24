package com.opencode.mobile.ui.screen.files

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.InsertDriveFile
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opencode.mobile.data.model.FileItem
import com.opencode.mobile.data.model.FileType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilesScreen(
    viewModel: FilesViewModel = hiltViewModel()
) {
    val files by viewModel.files.collectAsState()
    val currentPath by viewModel.currentPath.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val fileContent by viewModel.fileContent.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Files") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (currentPath.isNotEmpty()) {
                Breadcrumb(
                    path = currentPath,
                    onNavigate = { viewModel.loadFiles(it) },
                    onBack = { viewModel.navigateUp() }
                )
            }

            if (error != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = error ?: "",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }

            if (fileContent != null) {
                FileContentViewer(
                    content = fileContent!!,
                    onClose = { viewModel.loadFiles(currentPath) }
                )
            } else if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )
            } else {
                LazyColumn {
                    items(files) { file ->
                        FileListItem(
                            file = file,
                            onClick = { viewModel.openFile(file) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun Breadcrumb(
    path: String,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) {
                Text("...")
            }
            
            val parts = path.split("/").filter { it.isNotEmpty() }
            parts.forEachIndexed { index, part ->
                TextButton(
                    onClick = { 
                        val newPath = parts.take(index + 1).joinToString("/")
                        onNavigate(newPath)
                    }
                ) {
                    Text(part)
                }
                if (index < parts.size - 1) {
                    Text("/", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
fun FileListItem(
    file: FileItem,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { 
            Text(
                text = file.name,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            ) 
        },
        supportingContent = { 
            if (file.size > 0) {
                Text(
                    text = formatFileSize(file.size),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        },
        leadingContent = {
            Icon(
                imageVector = if (file.type == FileType.DIRECTORY) Icons.Default.Folder 
                             else Icons.Default.InsertDriveFile,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
        },
        trailingContent = {
            if (file.type == FileType.DIRECTORY) {
                Icon(Icons.Default.ChevronRight, "Open")
            }
        },
        modifier = Modifier.clickable(onClick = onClick)
    )
}

@Composable
fun FileContentViewer(
    content: String,
    onClose: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "File Content",
                    style = MaterialTheme.typography.titleMedium
                )
                TextButton(onClick = onClose) {
                    Text("Close")
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = MaterialTheme.shapes.medium
            ) {
                Text(
                    text = content,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

fun formatFileSize(bytes: Long): String {
    return when {
        bytes < 1024 -> "$bytes B"
        bytes < 1024 * 1024 -> "${bytes / 1024} KB"
        bytes < 1024 * 1024 * 1024 -> "${bytes / (1024 * 1024)} MB"
        else -> "${bytes / (1024 * 1024 * 1024)} GB"
    }
}
