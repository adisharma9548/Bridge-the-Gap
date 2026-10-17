class SavedItem {
  final String id;
  final String sessionId;
  final String kind;
  final String title;
  final dynamic payload;
  final String createdAt;

  const SavedItem({
    required this.id,
    required this.sessionId,
    required this.kind,
    required this.title,
    required this.payload,
    required this.createdAt,
  });

  factory SavedItem.fromJson(Map<String, dynamic> json) {
    return SavedItem(
      id: json['id'] as String? ?? '',
      sessionId: json['session_id'] as String? ?? '',
      kind: json['kind'] as String? ?? 'understand',
      title: json['title'] as String? ?? '',
      payload: json['payload'],
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'session_id': sessionId,
      'kind': kind,
      'title': title,
      'payload': payload,
      'created_at': createdAt,
    };
  }
}
