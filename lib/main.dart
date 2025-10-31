import 'package:flutter/material.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Center(child: Center(child: _TestWidget())),
        ),
      ),
    );
  }
}

class _TestWidget extends StatefulWidget {
  const _TestWidget();

  @override
  State<_TestWidget> createState() => _TestWidgetState();
}

class _TestWidgetState extends State<_TestWidget> {
  int counter = 0;
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          Text('Value $counter'),
          ElevatedButton(onPressed: () {
            setState(() {
              counter++;
            });
          }, child: Text("Add"))
        ],
      ),
    );
  }
}
