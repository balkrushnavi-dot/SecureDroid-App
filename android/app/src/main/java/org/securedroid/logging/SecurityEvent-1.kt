package org.securedroid.logging

data class SecurityEvent(
    val id: String,
    val timestamp: Long,
    val category: String,
    val severity: String,
    val description: String,
    val source: String,
    val metadata: Map<String, String>? = null
)
