package com.savertrack.app

import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

// Minimal Google Drive v3 REST client for the "appDataFolder" special space —
// a per-app hidden folder in the user's Drive that never shows up in their
// normal Drive UI (the closest Android equivalent to iOS's iCloud ubiquity
// container). Talks HTTP directly instead of pulling in the heavier, mostly
// Java-era google-api-services-drive library, since this only ever needs
// three calls: find-by-name, create-or-update, and read.
object DriveAppDataClient {
    private const val FILES_URL = "https://www.googleapis.com/drive/v3/files"
    private const val UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

    private fun request(urlStr: String, method: String, token: String, body: ByteArray? = null, contentType: String? = null): Pair<Int, String> {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.requestMethod = method
        conn.setRequestProperty("Authorization", "Bearer $token")
        if (contentType != null) conn.setRequestProperty("Content-Type", contentType)
        if (body != null) {
            conn.doOutput = true
            conn.outputStream.use { it.write(body) }
        }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
        conn.disconnect()
        return code to text
    }

    private fun findFileId(token: String, name: String): String? {
        val q = URLEncoder.encode("name = '$name' and trashed = false", "UTF-8")
        val url = "$FILES_URL?spaces=appDataFolder&q=$q&fields=files(id)"
        val (code, text) = request(url, "GET", token)
        if (code !in 200..299) throw RuntimeException("List failed ($code): $text")
        val files = JSONObject(text).optJSONArray("files") ?: return null
        return if (files.length() > 0) files.getJSONObject(0).getString("id") else null
    }

    fun writeFile(token: String, name: String, contents: String) {
        val existingId = findFileId(token, name)
        val bytes = contents.toByteArray(Charsets.UTF_8)
        if (existingId != null) {
            val (code, text) = request("$UPLOAD_URL/$existingId?uploadType=media", "PATCH", token, bytes, "application/json; charset=UTF-8")
            if (code !in 200..299) throw RuntimeException("Update failed ($code): $text")
            return
        }
        val boundary = "saver_backup_boundary"
        val metadata = JSONObject().put("name", name).put("parents", JSONArray().put("appDataFolder"))
        val multipartBody = buildString {
            append("--$boundary\r\n")
            append("Content-Type: application/json; charset=UTF-8\r\n\r\n")
            append(metadata.toString())
            append("\r\n--$boundary\r\n")
            append("Content-Type: application/json; charset=UTF-8\r\n\r\n")
            append(contents)
            append("\r\n--$boundary--")
        }.toByteArray(Charsets.UTF_8)
        val (code, text) = request("$UPLOAD_URL?uploadType=multipart", "POST", token, multipartBody, "multipart/related; boundary=$boundary")
        if (code !in 200..299) throw RuntimeException("Create failed ($code): $text")
    }

    fun readFile(token: String, name: String): String? {
        val id = findFileId(token, name) ?: return null
        val (code, text) = request("$FILES_URL/$id?alt=media", "GET", token)
        if (code !in 200..299) throw RuntimeException("Read failed ($code): $text")
        return text
    }
}
