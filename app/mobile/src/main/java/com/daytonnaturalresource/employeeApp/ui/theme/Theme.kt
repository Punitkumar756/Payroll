package com.daytonnaturalresource.employeeapp.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColors = lightColorScheme(
    primary            = Primary40,
    onPrimary          = Primary100,
    primaryContainer   = Primary90,
    onPrimaryContainer = Primary10,
    secondary          = Secondary40,
    onSecondary        = Primary100,
    secondaryContainer = Secondary90,
    onSecondaryContainer = Primary10,
    tertiary           = Tertiary40,
    onTertiary         = Primary100,
    tertiaryContainer  = Tertiary80,
    error              = Error40,
    onError            = Primary100,
    errorContainer     = Error90,
    background         = Neutral99,
    onBackground       = Neutral10,
    surface            = Neutral99,
    onSurface          = Neutral10,
    surfaceVariant     = NeutralVariant90,
    onSurfaceVariant   = NeutralVariant30,
    outline            = NeutralVariant50,
)

private val DarkColors = darkColorScheme(
    primary            = Primary80,
    onPrimary          = Primary20,
    primaryContainer   = Primary20,
    onPrimaryContainer = Primary90,
    secondary          = Secondary80,
    onSecondary        = Primary10,
    secondaryContainer = Secondary40,
    onSecondaryContainer = Secondary90,
    tertiary           = Tertiary80,
    onTertiary         = Primary10,
    tertiaryContainer  = Tertiary40,
    error              = Error80,
    onError            = Error40,
    errorContainer     = Error40,
    background         = Neutral10,
    onBackground       = Neutral90,
    surface            = Neutral17,
    onSurface          = Neutral90,
    surfaceVariant     = NeutralVariant30,
    onSurfaceVariant   = NeutralVariant80,
    outline            = NeutralVariant50,
)

@Composable
fun HrmsTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            @Suppress("DEPRECATION")
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
