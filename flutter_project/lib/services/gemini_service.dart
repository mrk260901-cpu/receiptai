import 'dart:convert';
import 'dart:typed_data';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/receipt.dart';

class GeminiReceiptService {
  final String apiKey;
  late final GenerativeModel _model;

  GeminiReceiptService({required this.apiKey}) {
    // Initialize the official Google Gemini Generative Model with system instructions
    _model = GenerativeModel(
      model: 'gemini-3.5-flash',
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
        responseSchema: Schema.object(
          description: 'Receipt data schema',
          properties: {
            'storeName': Schema.string(description: 'Simplified name of the store'),
            'address': Schema.string(description: 'Store address'),
            'phone': Schema.string(description: 'Store phone'),
            'date': Schema.string(description: 'YYYY-MM-DD date format'),
            'time': Schema.string(description: 'HH:MM time format'),
            'receiptNumber': Schema.string(description: 'Transaction number'),
            'cashier': Schema.string(description: 'Cashier name or checkout register'),
            'items': Schema.array(
              description: 'Line items on the receipt',
              items: Schema.object(
                properties: {
                  'name': Schema.string(description: 'Item name'),
                  'quantity': Schema.integer(description: 'Quantity purchased'),
                  'unitPrice': Schema.number(description: 'Individual price'),
                  'totalPrice': Schema.number(description: 'Aggregated price'),
                },
                required: ['name', 'quantity', 'unitPrice', 'totalPrice'],
              ),
            ),
            'subtotal': Schema.number(description: 'Subtotal'),
            'tax': Schema.number(description: 'Tax amount'),
            'discount': Schema.number(description: 'Discount amount'),
            'total': Schema.number(description: 'Grand total'),
            'currency': Schema.string(description: 'Three-letter currency code (INR, USD, EUR, GBP)'),
            'paymentMethod': Schema.string(description: 'Card, Cash, UPI, Mobile Wallet'),
            'category': Schema.string(description: 'Groceries, Restaurant, Shopping, Medical, Fuel, Education, Entertainment, Travel, Utilities, Electronics, Fashion, Sports, Others'),
            'confidenceScore': Schema.number(description: 'Confidence rating from 0.0 to 1.0'),
          },
          required: [
            'storeName',
            'date',
            'items',
            'subtotal',
            'tax',
            'total',
            'currency',
            'paymentMethod',
            'category'
          ],
        ),
      ),
      systemInstruction: Content.system(
        'You are an expert financial scanner. Analyze receipt images with precision. Extract all fields, correct typical OCR typos, normalize transaction dates to YYYY-MM-DD, times to HH:MM, and classify the purchases into appropriate spending categories.',
      ),
    );
  }

  /// Sends a raw image (bytes) to Gemini for structured JSON receipt extraction
  Future<Receipt> scanReceiptImage(Uint8List imageBytes, String mimeType, String userId) async {
    try {
      final imagePart = DataPart(mimeType, imageBytes);
      final textPart = TextPart(
        'Intelligently scan this receipt. Fill in all available fields in the schema.',
      );

      final response = await _model.generateContent([
        Content.multi([imagePart, textPart])
      ]);

      final jsonText = response.text;
      if (jsonText == null || jsonText.isEmpty) {
        throw Exception('Received empty text response from Gemini API.');
      }

      final Map<String, dynamic> decodedData = json.decode(jsonText);
      
      // Inject runtime user-specific fields
      decodedData['userId'] = userId;
      decodedData['receiptId'] = 'rec_${DateTime.now().millisecondsSinceEpoch}';
      decodedData['createdAt'] = DateTime.now().toIso8601String();
      decodedData['updatedAt'] = DateTime.now().toIso8601String();

      return Receipt.fromJson(decodedData);
    } catch (e) {
      print('Gemini Receipt Processing Error: $e');
      rethrow;
    }
  }

  /// Generates real-time conversational budget advices and alerts
  Future<String> generateSpendingInsights({
    required List<Receipt> receipts,
    required Map<String, double> budgets,
    required String currency,
  }) async {
    try {
      final prompt = 'Analyze the following user transaction list and active monthly budgets:\n\n'
          'Receipts:\n${json.encode(receipts.map((r) => r.toJson()).toList())}\n\n'
          'Budgets Limit Configs:\n${json.encode(budgets)}\n\n'
          'Generate exactly 3-4 professional financial bullet insights. Point out category budgets that are close to limits, highlight biggest spend items, summarize recent trends, and recommend custom savings advice. Format the currencies correctly with $currency symbols.';

      final response = await _model.generateContent([
        Content.text(prompt)
      ]);

      return response.text ?? 'No trends identified. Add more receipt data for custom insights.';
    } catch (e) {
      return 'Failed to analyze spending trends: $e';
    }
  }
}
