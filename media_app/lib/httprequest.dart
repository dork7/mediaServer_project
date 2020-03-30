import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;

class mwebService {
  Future<String> sendRequest(String mIp, String mURL) async {
    String url = "http://"+mIp+"?url="+mURL+"";
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      // print(json);
    } else {
      throw Exception("Error laoding ");
    }
    var retrunVal = jsonDecode(response.body);
    return retrunVal['url'];
  }
}
