package com.example.media_app;


import android.content.Intent;
import android.os.Bundle;

import java.util.HashMap;

import java.nio.ByteBuffer;


import androidx.annotation.NonNull;
import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.plugin.common.MethodChannel;

public class MainActivity extends FlutterActivity {
  private static final String CHANNEL = "mChannel";
  private HashMap<String, String> sharedData = new HashMap();

  private String mRes;

  @Override
  public void configureFlutterEngine(@NonNull FlutterEngine flutterEngine) {
    Intent intent = getIntent();
    String action = intent.getAction();
    String type = intent.getType();

    // Handle intent when app is initially opened
    handleSendIntent(getIntent());


    new MethodChannel(flutterEngine.getDartExecutor().getBinaryMessenger(), CHANNEL)
            .setMethodCallHandler(
                    (call, result) -> {
                      if (call.method.equals("mNativeFunction11")) {
                        result.success(1);
                      }
                      else if (call.method.equals("mNativeFunction")) {
                        result.success(sharedData);
                        sharedData.clear();
                      }
                    }
            );
  }

  private String mNativeFunction() {

    return "3";
  }

  private void handleSendIntent(Intent intent) {
    String action = intent.getAction();
    String type = intent.getType();

    // We only care about sharing intent that contain plain text
    if (Intent.ACTION_SEND.equals(action) && type != null) {
      if ("text/plain".equals(type)) {
        sharedData.put("subject", intent.getStringExtra(Intent.EXTRA_SUBJECT));
        sharedData.put("text", intent.getStringExtra(Intent.EXTRA_TEXT));
        mRes =  intent.getStringExtra(Intent.EXTRA_TEXT);
      }
    }
  }

}
