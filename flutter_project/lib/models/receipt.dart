import 'package:hive/hive.dart';

part 'receipt.g.dart';

@HiveType(typeId: 0)
class Receipt extends HiveObject {
  @HiveField(0)
  final String receiptId;

  @HiveField(1)
  final String userId;

  @HiveField(2)
  final String storeName;

  @HiveField(3)
  final String? address;

  @HiveField(4)
  final String? phone;

  @HiveField(5)
  final String date; // YYYY-MM-DD

  @HiveField(6)
  final String? time; // HH:MM

  @HiveField(7)
  final List<ReceiptItem> items;

  @HiveField(8)
  final double subtotal;

  @HiveField(9)
  final double tax;

  @HiveField(10)
  final double discount;

  @HiveField(11)
  final double total;

  @HiveField(12)
  final String currency;

  @HiveField(13)
  final String paymentMethod;

  @HiveField(14)
  final String category;

  @HiveField(15)
  final String? receiptImage; // Local file path or secure Cloud URL

  @HiveField(16)
  final String? receiptNumber;

  @HiveField(17)
  final String? cashier;

  @HiveField(18)
  final double? confidenceScore;

  @HiveField(19)
  final DateTime createdAt;

  @HiveField(20)
  final DateTime updatedAt;

  Receipt({
    required this.receiptId,
    required this.userId,
    required this.storeName,
    this.address,
    this.phone,
    required this.date,
    this.time,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.discount,
    required this.total,
    required this.currency,
    required this.paymentMethod,
    required this.category,
    this.receiptImage,
    this.receiptNumber,
    this.cashier,
    this.confidenceScore,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      receiptId: json['receiptId'] ?? '',
      userId: json['userId'] ?? '',
      storeName: json['storeName'] ?? 'Unknown Store',
      address: json['address'],
      phone: json['phone'],
      date: json['date'] ?? DateTime.now().toIso8601String().substring(0, 10),
      time: json['time'],
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => ReceiptItem.fromJson(item as Map<String, dynamic>))
              .toList() ?? [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'INR',
      paymentMethod: json['paymentMethod'] ?? 'Cash',
      category: json['category'] ?? 'Others',
      receiptImage: json['receiptImage'],
      receiptNumber: json['receiptNumber']?.toString(),
      cashier: json['cashier'],
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble() ?? 1.0,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'receiptId': receiptId,
      'userId': userId,
      'storeName': storeName,
      'address': address,
      'phone': phone,
      'date': date,
      'time': time,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'discount': discount,
      'total': total,
      'currency': currency,
      'paymentMethod': paymentMethod,
      'category': category,
      'receiptImage': receiptImage,
      'receiptNumber': receiptNumber,
      'cashier': cashier,
      'confidenceScore': confidenceScore,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

@HiveType(typeId: 1)
class ReceiptItem {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final int quantity;

  @HiveField(2)
  final double unitPrice;

  @HiveField(3)
  final double totalPrice;

  ReceiptItem({
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory ReceiptItem.fromJson(Map<String, dynamic> json) {
    return ReceiptItem(
      name: json['name'] ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }
}
