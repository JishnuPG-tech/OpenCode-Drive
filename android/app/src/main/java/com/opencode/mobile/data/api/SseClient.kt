package com.opencode.mobile.data.api

import okhttp3.*
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SseClient @Inject constructor() {
    private var eventSource: EventSource? = null
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    fun streamEvents(
        baseUrl: String,
        sessionId: String,
        authToken: String? = null,
        onEvent: (SseEvent) -> Unit,
        onConnected: () -> Unit = {},
        onDisconnected: () -> Unit = {},
        onError: (Throwable) -> Unit = {}
    ) {
        val url = "${baseUrl.trimEnd('/')}/sessions/$sessionId/events"
        
        val request = Request.Builder()
            .url(url)
            .header("Accept", "text/event-stream")
            .header("Cache-Control", "no-cache")
            .apply {
                authToken?.let { addHeader("Authorization", "Bearer $it") }
            }
            .build()

        val factory = EventSources.createFactory(client)
        
        eventSource = factory.newEventSource(request, object : EventSourceListener() {
            override fun onOpen(eventSource: EventSource, response: Response) {
                onConnected()
            }

            override fun onEvent(
                eventSource: EventSource,
                id: String?,
                type: String?,
                data: String
            ) {
                val eventType = type ?: "message"
                val event = SseEvent(type = eventType, data = data, id = id)
                onEvent(event)
            }

            override fun onClosed(eventSource: EventSource) {
                onDisconnected()
            }

            override fun onFailure(
                eventSource: EventSource,
                t: Throwable?,
                response: Response?
            ) {
                t?.let { onError(it) }
            }
        })
    }

    fun disconnect() {
        eventSource?.cancel()
        eventSource = null
    }

    fun isConnected(): Boolean {
        return eventSource != null
    }
}

data class SseEvent(
    val type: String,
    val data: String,
    val id: String? = null
)
