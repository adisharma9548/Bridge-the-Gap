import 'user_model.dart';

class SendOtpResponse {
  final bool success;
  final String message;
  final String? otpPreview;

  const SendOtpResponse({
    required this.success,
    required this.message,
    this.otpPreview,
  });

  factory SendOtpResponse.fromJson(Map<String, dynamic> json) {
    return SendOtpResponse(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      otpPreview: json['otpPreview'] as String?,
    );
  }
}

class VerifyOtpResponse {
  final bool success;
  final String? token;
  final UserModel? user;
  final String? message;

  const VerifyOtpResponse({
    required this.success,
    this.token,
    this.user,
    this.message,
  });

  factory VerifyOtpResponse.fromJson(Map<String, dynamic> json) {
    return VerifyOtpResponse(
      success: json['success'] as bool? ?? false,
      token: json['token'] as String?,
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      message: json['message'] as String?,
    );
  }
}
