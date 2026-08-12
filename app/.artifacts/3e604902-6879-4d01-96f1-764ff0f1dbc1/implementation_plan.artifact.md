# Project Upgrade and Fix Implementation Plan

The project is currently experiencing `Unresolved reference` errors and Gradle sync failures. The root cause is an incompatibility between the selected Gradle version (8.6), the JVM version (25), and several plugins that were using internal Gradle APIs removed in newer versions.

Since the environment is from 2026, we will upgrade the project to modern, stable standards to ensure all components are compatible.

## Proposed Changes

### Build Configuration

#### [MODIFY] [gradle-wrapper.properties](file:///C:/Users/New%20Hope/Desktop/pay/app/gradle/wrapper/gradle-wrapper.properties)
- Upgrade Gradle to `9.3.0` to support modern JVMs and plugins.

#### [MODIFY] [root build.gradle.kts](file:///C:/Users/New%20Hope/Desktop/pay/app/build.gradle.kts)
- Upgrade Android Gradle Plugin (AGP) to `9.3.1`.
- Upgrade Kotlin to `2.4.10`.
- Add the new Kotlin Compose plugin `2.4.10`.
- Upgrade Hilt to `2.60.1`.

#### [MODIFY] [mobile/build.gradle.kts](file:///C:/Users/New%20Hope/Desktop/pay/app/mobile/build.gradle.kts)
- Apply the `org.jetbrains.kotlin.plugin.compose` plugin.
- Remove deprecated `composeOptions` (Kotlin 2.0+ handles this via the plugin).
- Update Hilt and other core dependencies to compatible versions.

## Verification Plan

### Automated Tests
- Run `./gradlew :mobile:assembleDebug` to verify compilation.
- Perform a Gradle Sync to ensure the IDE recognizes all dependencies.

### Manual Verification
- Verify that `MainActivity.kt` no longer shows unresolved references for Hilt and Compose.
