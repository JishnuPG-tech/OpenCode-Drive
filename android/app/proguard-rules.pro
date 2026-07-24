# MyActivity, MyBroadcastReceiver, etc.
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

-keep class com.opencode.mobile.** { *; }

-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
