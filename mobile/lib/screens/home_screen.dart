import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/parking_lot.dart';
import 'parking_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  List<ParkingLot> _parkingLots = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchParkingLots();
  }

  void _fetchParkingLots() async {
    try {
      final data = await _api.get('/parking-lots/');
      setState(() {
        _parkingLots = (data as List).map((e) => ParkingLot.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      print(e);
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ParkVision')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _parkingLots.length,
              itemBuilder: (context, index) {
                final lot = _parkingLots[index];
                return ListTile(
                  title: Text(lot.name),
                  subtitle: Text(lot.address),
                  trailing: Text('\$${lot.hourlyRate}/hr'),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ParkingDetailScreen(parkingLot: lot),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
