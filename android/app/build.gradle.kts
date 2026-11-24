plugins {
    id("com.android.application")
}

android {
    namespace = "com.imsuri919.devagentskills"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.imsuri919.devagentskills"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

repositories {
    google()
    mavenCentral()
}
