import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:ping_discover_network/ping_discover_network.dart';
import 'httprequest.dart';

import 'package:connectivity/connectivity.dart';

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Calcoolater',
    home: App(),
    theme: ThemeData(
      primaryColor: Colors.blue,
      accentColor: Colors.blue,
      brightness: Brightness.dark,
    ),
  ));
}

class App extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    // TODO: implement createState
    return _AppState();
  }
}

class _AppState extends State<App> {
  final Connectivity _connectivity = Connectivity();
  static const platform = const MethodChannel("mChannel");
  Map<dynamic, dynamic> sharedData = Map();

  String mResponse = "Response";
  String mIntent = "Intent here";
  String srchingIp = "-";
  final _mMargin = 5.0;
  var currentSelected = "";
  List<String> ipList = ['No Network found'];

  TextEditingController controller1 = TextEditingController();
  @override
  void initState() {
    // okay in order in instantiate value you will have to use this method //
    super.initState();
    _getIPAdresses();
    _init();
    currentSelected = ipList[0];
  }

  void _getIPAdresses() async {
    print("++++++++++++++++++++getIPAdresses+++++++++++++++++++");
    var wifiIP;
    try {
      wifiIP = await _connectivity.getWifiIP();
    } on PlatformException catch (e) {
      print(e.toString());
      wifiIP = "Failed to get Wifi IP";
      setState(() {
        srchingIp = "Failed to get Wifi IP";
      });
    }
    print('+++++++++++++++++++++++++++++++++++++++ $wifiIP');

    //final String ip = await Wifi.ip;
    final String subnet = wifiIP.substring(0, wifiIP.lastIndexOf('.'));
    final int port = 2266;
    setState(() {
      srchingIp = 'Searching on => $port';
    });
    final stream = NetworkAnalyzer.discover2(subnet, port);
    stream.listen((NetworkAddress addr) {
      if (addr.exists) {
        //  print('Found device: ${addr.ip}');
        setState(() {
          srchingIp = 'Found';
        });
        // ipList.add(addr.ip.toString()+':3000');
        if (ipList.contains('No Network found')) {
          ipList.removeAt(0);
        }
        ipList.insert(0, addr.ip.toString() + ':2266');
        currentSelected = addr.ip.toString() + ':2266';
      }
    });
  }

  void _refreshIPAdresses() async {
    print("+++++++++++++++++++refresh list+++++++++++++++++++");
  }

  _init() async {
    // Case 1: App is already running in background:
    // Listen to lifecycle changes to subsequently call Java MethodHandler to check for shared data
    SystemChannels.lifecycle.setMessageHandler((msg) {
      print('RESUMMMMMMMED messageb $msg');
      if (msg.contains('resumed')) {
        print('part 2');
        _getSharedData().then((d) {
          if (d.isEmpty) return;

          // Your logic here
          // E.g. at this place you might want to use Navigator to launch a new page and pass the shared data
        });
      }
    });

    // Case 2: App is started by the intent:
    // Call Java MethodHandler on application start up to check for shared data
    var data = await _getSharedData();
    setState(() => sharedData = data);

    setState(() {
      if (sharedData['text'] != null) {
        controller1.text = sharedData['text']; // "https://www.google.com.pk/";
        mIntent = sharedData['subject'];
      }
      // doing nothing
    });

    print(" + + + + + + + + + + + + + + + + + + + + + + + + +");
    print(sharedData);
    // You can use sharedData in your build() method now
  }

  Future<Map> _getSharedData() async =>
      await platform.invokeMethod('mNativeFunction'); // calling native function

  Future _loadHttpData(String ip, String reqURL) async {
    final results = await mwebService().sendRequest(ip, reqURL);
    setState(() {
      print(results);
      mResponse = results;

      // _dataSet = results;
    });
    return results;
  }

  Future _killCommand(String ip) async {
    final results = await mwebService().sendRequest(ip, 'KILL_app');
    setState(() {
      print(results);
      mResponse = results;
      setState(() {
        mIntent = 'Kill Command';
      });

      // _dataSet = results;
    });
    return results;
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    TextStyle textStyle = Theme.of(context).textTheme.title;

    return Scaffold(
        // resizeToAvoidBottomPadding: false, // to remove the overflow error //
        //IMP // Also use listView to avoid yellow thingy
        appBar: AppBar(
          title: Text('Title'),
        ),
        body: Container(
          margin: EdgeInsets.all(_mMargin),
          child: ListView(
            children: <Widget>[
              // firest text field
              Padding(
                padding: EdgeInsets.only(top: _mMargin, bottom: _mMargin),
                child: TextField(
                  // keyboardType: TextInputType.number,
                  style: textStyle,
                  controller: controller1,
                  decoration: InputDecoration(
                    labelText: 'Enter Value',
                    hintText: 'Enter please',
                    labelStyle: textStyle,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5.0)),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Row(
                  children: <Widget>[
                    // dorp down menu

                    Expanded(
                        child: DropdownButton<String>(
                      items: ipList.map((String dropDownStringItem) {
                        return DropdownMenuItem<String>(
                          value: dropDownStringItem,
                          child: Text(
                            dropDownStringItem,
                            style: textStyle,
                          ),
                        );
                      }).toList(),
                      onChanged: (String newVal) {
                        // when menu item from drop down is selected
                        _onDropDownItemSelected(newVal);
                      },
                      value: currentSelected,
                    )),
                    Container(
                      width: _mMargin * 5,
                    ),
                  ],
                ),
              ),
              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Text(
                  this.srchingIp,
                  style: textStyle,
                ),
              ),
              // refreshing IP address
              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Row(
                  children: <Widget>[
                    // buttons
                    Expanded(
                      child: RaisedButton(
                        color: Theme.of(context).primaryColor,
                        child: Text(
                          'Refresh',
                          // style: textStyle,
                          textScaleFactor: 1.5,
                        ),
                        onPressed: () {
                          setState(() {
                            // mResponse = "";
                            // _getIP();
                            _getIPAdresses();
                            //   _refreshIPAdresses();
                            //   _loadHttpData(currentSelected, controller1.text);
                            // displayResult = _calculatetotalReturns();
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Row(
                  children: <Widget>[
                    // buttons
                    Expanded(
                      child: RaisedButton(
                        color: Theme.of(context).primaryColor,
                        child: Text(
                          'Connect',
                          // style: textStyle,
                          textScaleFactor: 1.5,
                        ),
                        onPressed: () {
                          setState(() {
                            mResponse = "";
                            // _getIP();
                            //   _getIPAdresses();
                            _loadHttpData(currentSelected, controller1.text);
                            // displayResult = _calculatetotalReturns();
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                // kill button
                padding: EdgeInsets.all(_mMargin),
                child: Row(
                  children: <Widget>[
                    // buttons
                    Expanded(
                      child: RaisedButton(
                        color: Colors.red[700],
                        child: Text(
                          'KILL',
                          // style: textStyle,
                          textScaleFactor: 1.5,
                        ),
                        onPressed: () {
                          setState(() {
                            mResponse = "";
                            _killCommand(currentSelected);
                            // _getIP();
                            //   _getIPAdresses();
                            //  _loadHttpData(currentSelected, controller1.text);
                            // displayResult = _calculatetotalReturns();
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
              // adding the text field for displaying the results
              Divider(color: Colors.white),
              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Text(
                  this.mResponse,
                  style: textStyle,
                ),
              ),
              Divider(color: Colors.white),
              Padding(
                padding: EdgeInsets.all(_mMargin),
                child: Text(
                  this.mIntent,
                  style: textStyle,
                ),
              ),
              Divider(color: Colors.white),
            ],
          ),
        ));
  }

  void _resetFunction() {
    // controller1.text = "";
  }
  void _onDropDownItemSelected(String newValueSelected) {
    setState(() {
      this.currentSelected = newValueSelected;
    });
  }

  // end of class bracket

  // intent handling

  // Future<void> callNative() async {
  //   print("++++++++++++++++++++callNative called++++++++++++++++++++");
  //   try {
  //     // String messageFromNative
  //     sharedData = await platform.invokeMethod("mNativeFunction");
  //     mIntent = sharedData['subject'].toString();
  //     controller1.text = sharedData['text'].toString();
  //     print("-------");
  //     print(mIntent);
  //     print(sharedData);
  //     print("-------");
  //     setState(() {
  //       // doing nothing
  //     });
  //   } on PlatformException catch (e) {
  //     print("error");
  //   }
  // }
}
