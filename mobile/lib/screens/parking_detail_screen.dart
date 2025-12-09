import 'package:flutter/material.dart';
import '../models/parking_lot.dart';

class ParkingDetailScreen extends StatelessWidget {
  final ParkingLot parkingLot;

  const ParkingDetailScreen({super.key, required this.parkingLot});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(parkingLot.name)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Address: ${parkingLot.address}', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 10),
            Text('Rate: \$${parkingLot.hourlyRate}/hr', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 10),
            Text('Capacity: ${parkingLot.capacity} spots', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Navigate to Reservation Screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reservation feature coming soon!')),
                );
              },
              child: const Text('Reserve a Spot'),
            ),
          ],
        ),
      ),
    );
  }
}
