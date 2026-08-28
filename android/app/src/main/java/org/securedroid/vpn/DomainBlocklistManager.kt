package org.securedroid.vpn

import android.content.Context
import android.content.SharedPreferences

class DomainBlocklistManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "securedroid_blocklist_prefs"
        private const val KEY_CUSTOM_BLOCKED = "custom_blocked_domains"
        private const val KEY_CUSTOM_ALLOWED = "custom_allowed_domains"

        // Default local heuristic tracking/ad domains
        val DEFAULT_BLOCKED_DOMAINS = setOf(
            "ads.example.com",
            "tracker.example.com",
            "telemetry.malicious-tracker.net"
        )
    }

    fun getBlockedDomains(): Set<String> {
        val custom = prefs.getStringSet(KEY_CUSTOM_BLOCKED, emptySet()) ?: emptySet()
        return DEFAULT_BLOCKED_DOMAINS + custom
    }

    fun getAllowedDomains(): Set<String> {
        return prefs.getStringSet(KEY_CUSTOM_ALLOWED, emptySet()) ?: emptySet()
    }

    fun addBlockedDomain(domain: String): Boolean {
        val current = prefs.getStringSet(KEY_CUSTOM_BLOCKED, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        val cleanDomain = domain.lowercase().trim()
        if (cleanDomain.isEmpty()) return false
        
        val added = current.add(cleanDomain)
        if (added) {
            prefs.edit().putStringSet(KEY_CUSTOM_BLOCKED, current).apply()
        }
        return added
    }

    fun removeBlockedDomain(domain: String): Boolean {
        val current = prefs.getStringSet(KEY_CUSTOM_BLOCKED, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        val cleanDomain = domain.lowercase().trim()
        
        val removed = current.remove(cleanDomain)
        if (removed) {
            prefs.edit().putStringSet(KEY_CUSTOM_BLOCKED, current).apply()
        }
        return removed
    }

    fun addAllowedDomain(domain: String): Boolean {
        val current = prefs.getStringSet(KEY_CUSTOM_ALLOWED, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        val cleanDomain = domain.lowercase().trim()
        if (cleanDomain.isEmpty()) return false

        val added = current.add(cleanDomain)
        if (added) {
            prefs.edit().putStringSet(KEY_CUSTOM_ALLOWED, current).apply()
        }
        return added
    }

    fun removeAllowedDomain(domain: String): Boolean {
        val current = prefs.getStringSet(KEY_CUSTOM_ALLOWED, mutableSetOf())?.toMutableSet() ?: mutableSetOf()
        val cleanDomain = domain.lowercase().trim()

        val removed = current.remove(cleanDomain)
        if (removed) {
            prefs.edit().putStringSet(KEY_CUSTOM_ALLOWED, current).apply()
        }
        return removed
    }

    fun isBlocked(domain: String): Boolean {
        val cleanDomain = domain.lowercase().trim()
        // Allowlist takes precedence over blocklists
        if (getAllowedDomains().contains(cleanDomain)) {
            return false
        }
        return getBlockedDomains().contains(cleanDomain)
    }
}
