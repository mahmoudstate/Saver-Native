package com.savertrack.app

import android.util.Log
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.gms.auth.GoogleAuthUtil
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import org.json.JSONObject

// Writes/reads the encrypted auto-backup file to the user's Google Drive
// "app data" folder (hidden from the user's normal Drive view — mirrors the
// iCloud ubiquity container ICloudBackupPlugin.swift uses on iOS). Unlike
// iCloud, Android has no system-wide signed-in account the app can use
// silently — the user grants access once via Google Sign-In (signIn()); every
// write/read after that is silent, same as iCloud.
//
// IMPORTANT: this plugin must be registered by hand in MainActivity.java's
// onCreate() via registerPlugin(GoogleDriveBackupPlugin.class) BEFORE
// super.onCreate() — local (non-npm) Capacitor Android plugins are never
// auto-discovered, same underlying gotcha as iOS's packageClassList.
@CapacitorPlugin(name = "GoogleDriveBackup")
class GoogleDriveBackupPlugin : Plugin() {
    private val driveScope = Scope("https://www.googleapis.com/auth/drive.appdata")
    private val fileName = "Saver_AutoBackup.json"

    private fun signInClient(): GoogleSignInClient {
        val options = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestScopes(driveScope)
            .build()
        return GoogleSignIn.getClient(context, options)
    }

    private fun currentAccount(): GoogleSignInAccount? = GoogleSignIn.getLastSignedInAccount(context)

    @PluginMethod
    fun isSignedIn(call: PluginCall) {
        call.resolve(JSObject().put("signedIn", currentAccount() != null))
    }

    @PluginMethod
    fun signIn(call: PluginCall) {
        if (currentAccount() != null) {
            call.resolve(JSObject().put("signedIn", true))
            return
        }
        startActivityForResult(call, signInClient().signInIntent, "onSignInResult")
    }

    @ActivityCallback
    private fun onSignInResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        try {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            task.getResult(ApiException::class.java)
            call.resolve(JSObject().put("signedIn", true))
        } catch (e: ApiException) {
            call.resolve(JSObject().put("signedIn", false))
        }
    }

    @PluginMethod
    fun signOut(call: PluginCall) {
        signInClient().signOut().addOnCompleteListener { call.resolve() }
    }

    // Blocking network call to mint a fresh OAuth access token for Drive REST
    // calls — safe here since Capacitor already runs @PluginMethod bodies off
    // the main thread by default. Uses the account's email rather than the
    // legacy `account.account` (android.accounts.Account) field, which is
    // unreliably null on modern Play Services versions.
    private fun accessToken(account: GoogleSignInAccount): String {
        val email = account.email ?: throw IllegalStateException("Signed-in Google account has no email — re-authentication required")
        return GoogleAuthUtil.getToken(context, email, "oauth2:${driveScope.scopeUri}")
    }

    @PluginMethod
    fun writeBackup(call: PluginCall) {
        val text = call.getString("data")
        if (text == null) { call.reject("Missing 'data'"); return }
        val account = currentAccount()
        if (account == null) { call.reject("Not signed in"); return }
        try {
            DriveAppDataClient.writeFile(accessToken(account), fileName, text)
            call.resolve()
        } catch (e: Exception) {
            Log.e("GoogleDriveBackup", "writeBackup failed", e)
            call.reject("Write failed: ${e}")
        }
    }

    @PluginMethod
    fun readBackup(call: PluginCall) {
        val account = currentAccount()
        if (account == null) { call.resolve(JSObject().put("data", JSONObject.NULL)); return }
        try {
            val text = DriveAppDataClient.readFile(accessToken(account), fileName)
            call.resolve(JSObject().put("data", text ?: JSONObject.NULL))
        } catch (e: Exception) {
            call.reject("Read failed: ${e.message}")
        }
    }
}
