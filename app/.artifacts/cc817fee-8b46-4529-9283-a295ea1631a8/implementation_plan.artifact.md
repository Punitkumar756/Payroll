# Fix Build Error: Daemon compilation failed: null

The error "Daemon compilation failed: null" is caused by a version mismatch between the Kotlin compiler, Gradle, and the JDK. Specifically:
- **Kotlin 1.9.24** does not officially support **JDK 24/25** and **Gradle 9.3.0**.
- **AGP 8.5.2** is incompatible with **Gradle 9.3.0**, leading to service creation failures (e.g., `AndroidLocationsBuildService`).

This plan upgrades the project to modern, compatible versions of Kotlin, AGP, and Gradle.

## User Review Required

> [!IMPORTANT]
> This upgrade will transition the project to **Kotlin 2.4.10** and **AGP 9.3.1**.
> Kotlin 2.0+ uses a new Compose compiler plugin. I will update the project to use this plugin and remove legacy `composeOptions`.

## Proposed Changes

### Build Configuration

#### [MODIFY] [build.gradle.kts](file:///C:/Users/New%20Hope/Desktop/pay/app/build.gradle.kts)
- Upgrade AGP to `9.3.1`.
- Upgrade Kotlin to `2.4.10`.
- Add the Kotlin Compose compiler plugin.

#### [MODIFY] [mobile/build.gradle.kts](file:///C:/Users/New%20Hope/Desktop/pay/app/mobile/build.gradle.kts)
- Apply `org.jetbrains.kotlin.plugin.compose`.
- Remove `composeOptions` block (as it is now handled by the plugin).

#### [MODIFY] [gradle.properties](file:///C:/Users/New%20Hope/Desktop/pay/app/gradle.properties)
- Optimize JVM arguments for the Gradle and Kotlin daemons to prevent memory-related crashes.

## Verification Plan

### Automated Tests
- Run `./gradlew :mobile:assembleDebug` to verify the build completes successfully.
- Run `./gradlew :mobile:compileDebugKotlin` to specifically verify the Kotlin compilation.

### Manual Verification
- Verify that the app still renders Compose previews correctly (if applicable).
