class UserModel {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? createdAt;
  final String? lastLogin;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.role = 'citizen',
    this.createdAt,
    this.lastLogin,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      role: json['role'] as String? ?? 'citizen',
      createdAt: json['created_at'] as String?,
      lastLogin: json['last_login'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'created_at': createdAt,
      'last_login': lastLogin,
    };
  }
}
