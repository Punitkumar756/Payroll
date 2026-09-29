package com.daytonnaturalresource.employeeapp.utils

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

private val READABLE_DATE_FMT = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
private val READABLE_TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH)
private val ISO_DATE_FMT      = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH)

/** Converts "2026-08-13T00:00:00.000Z" or "2026-08-13" → "13 Aug 2026". Returns original on failure. */
fun formatIsoDate(iso: String?): String {
    if (iso.isNullOrBlank()) return "—"
    return try {
        // Handle "2026-08-13 00:00:00" by replacing space with T
        val normalized = if (iso.contains(" ") && !iso.contains("T")) iso.replace(" ", "T") else iso
        // Try as full ISO-8601 instant
        val instant = Instant.parse(if (normalized.contains("T")) {
            if (normalized.endsWith("Z")) normalized else "${normalized}Z"
        } else {
            "${normalized}T00:00:00Z"
        })
        val local = instant.atZone(ZoneId.of("Asia/Kolkata")).toLocalDate()
        local.format(READABLE_DATE_FMT)
    } catch (_: Exception) {
        try {
            LocalDate.parse(iso.take(10), ISO_DATE_FMT).format(READABLE_DATE_FMT)
        } catch (_: Exception) { iso }
    }
}

/** Converts ISO time string → "09:30 AM". Returns "--" on failure. */
fun formatIsoTime(iso: String?): String {
    if (iso.isNullOrBlank()) return "—"
    return try {
        val instant = Instant.parse(if (iso.contains("T")) iso else "${iso}T00:00:00Z")
        instant.atZone(ZoneId.of("Asia/Kolkata")).toLocalTime().format(READABLE_TIME_FMT)
    } catch (_: Exception) { iso }
}

/** "punit kumar" → "Punit Kumar", "iT" → "IT" */
fun toTitleCase(s: String?): String {
    if (s.isNullOrBlank()) return ""
    return s.trim().split("\\s+".toRegex()).joinToString(" ") { word ->
        if (word.all { it.isUpperCase() }) word        // already all-caps acronym → keep
        else word.lowercase().replaceFirstChar { it.titlecase(Locale.ENGLISH) }
    }
}

/** "emp 002" or "EMP002" → "EMP002" */
fun formatEmployeeCode(raw: String?): String {
    if (raw.isNullOrBlank()) return "—"
    return raw.trim().replace("\\s+".toRegex(), "").uppercase(Locale.ENGLISH)
}

/** Extracts initials from a full name — "Punit Kumar" → "PK" */
fun initials(firstName: String?, lastName: String?): String {
    val f = firstName?.firstOrNull()?.uppercaseChar() ?: ""
    val l = lastName?.firstOrNull()?.uppercaseChar() ?: ""
    return "$f$l"
}
