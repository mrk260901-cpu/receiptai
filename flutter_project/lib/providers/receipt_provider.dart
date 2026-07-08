import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:hive/hive.dart';
import '../models/receipt.dart';
import '../services/gemini_service.dart';

class ReceiptProvider extends ChangeNotifier {
  final GeminiReceiptService _geminiService;
  final _firestore = FirebaseFirestore.instance;
  
  List<Receipt> _receipts = [];
  Map<String, double> _categoryBudgets = {};
  bool _isLoading = false;
  String? _errorMessage;

  ReceiptProvider({required GeminiReceiptService geminiService}) : _geminiService = geminiService {
    _loadLocalCachedData();
  }

  // Getters
  List<Receipt> get receipts => _receipts;
  Map<String, double> get categoryBudgets => _categoryBudgets;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  double get totalSpentThisMonth {
    final now = DateTime.now();
    return _receipts
        .where((r) {
          final rDate = DateTime.tryParse(r.date) ?? DateTime.now();
          return rDate.month == now.month && rDate.year == now.year;
        })
        .map((r) => r.total)
        .fold(0.0, (sum, item) => sum + item);
  }

  // Load from offline Hive store first for fast startup, then sync from Firestore
  Future<void> _loadLocalCachedData() async {
    _isLoading = true;
    notifyListeners();
    try {
      final receiptBox = await Hive.openBox<Receipt>('receipts_box');
      _receipts = receiptBox.values.toList();
      _receipts.sort((a, b) => b.date.compareTo(a.date));

      final budgetBox = await Hive.openBox<double>('budgets_box');
      _categoryBudgets = Map<String, double>.from(budgetBox.toMap());

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Failed to load offline receipts: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  // Scan and Process receipt
  Future<void> scanAndExtractReceipt({
    required List<int> imageBytes,
    required String mimeType,
    required String userId,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Send to Gemini for intelligent extraction
      final receipt = await _geminiService.scanReceiptImage(
        Uint8List.fromList(imageBytes),
        mimeType,
        userId,
      );

      // 2. Add locally
      _receipts.insert(0, receipt);
      
      // 3. Save to Offline Hive Cache
      final receiptBox = await Hive.openBox<Receipt>('receipts_box');
      await receiptBox.put(receipt.receiptId, receipt);

      // 4. Async sync to Firestore Cloud Backup
      await _firestore.collection('users').doc(userId).collection('receipts').doc(receipt.receiptId).set(receipt.toJson());

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'AI extraction failed: $e';
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Update receipt fields
  Future<void> updateReceipt(Receipt updatedReceipt) async {
    final index = _receipts.indexWhere((r) => r.receiptId == updatedReceipt.receiptId);
    if (index != -1) {
      _receipts[index] = updatedReceipt;
      
      // Update Hive
      final receiptBox = await Hive.openBox<Receipt>('receipts_box');
      await receiptBox.put(updatedReceipt.receiptId, updatedReceipt);

      // Sync Firestore
      await _firestore
          .collection('users')
          .doc(updatedReceipt.userId)
          .collection('receipts')
          .doc(updatedReceipt.receiptId)
          .update(updatedReceipt.toJson());
      
      notifyListeners();
    }
  }

  // Delete Receipt
  Future<void> deleteReceipt(String receiptId, String userId) async {
    _receipts.removeWhere((r) => r.receiptId == receiptId);
    
    // Delete Hive
    final receiptBox = await Hive.openBox<Receipt>('receipts_box');
    await receiptBox.delete(receiptId);

    // Delete Firestore
    await _firestore
        .collection('users')
        .doc(userId)
        .collection('receipts')
        .doc(receiptId)
        .delete();

    notifyListeners();
  }

  // Configure Budget limit
  Future<void> setBudgetLimit(String category, double limit) async {
    _categoryBudgets[category] = limit;
    final budgetBox = await Hive.openBox<double>('budgets_box');
    await budgetBox.put(category, limit);
    notifyListeners();
  }
}
