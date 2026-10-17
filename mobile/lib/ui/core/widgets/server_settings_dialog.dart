import 'package:flutter/material.dart';
import '../../../core/config/api_config.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/services/setu_api_client.dart';

class ServerSettingsDialog extends StatefulWidget {
  final SetuApiClient apiClient;
  final VoidCallback onSaved;

  const ServerSettingsDialog({
    super.key,
    required this.apiClient,
    required this.onSaved,
  });

  @override
  State<ServerSettingsDialog> createState() => _ServerSettingsDialogState();
}

class _ServerSettingsDialogState extends State<ServerSettingsDialog> {
  late TextEditingController _urlController;
  bool _isTesting = false;
  bool? _connectionHealthy;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: ApiConfig.baseUrl);
    _testActive();
  }

  Future<void> _testActive() async {
    setState(() => _isTesting = true);
    final healthy = await widget.apiClient.checkHealth();
    if (mounted) {
      setState(() {
        _isTesting = false;
        _connectionHealthy = healthy;
      });
    }
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Row(
        children: [
          Icon(Icons.dns_rounded, color: AppColors.cobalt),
          SizedBox(width: 10),
          Text(
            'Server Connection',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Setu mobile app connects to the shared backend server. Configure the address for your test environment:',
              style: TextStyle(fontSize: 13, color: AppColors.slateSubtle),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _urlController,
              decoration: const InputDecoration(
                labelText: 'Backend Base URL',
                hintText: 'http://10.0.2.2:4000/api',
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                ActionChip(
                  label: const Text('Android (10.0.2.2:4000)', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    _urlController.text = 'http://10.0.2.2:4000/api';
                  },
                ),
                ActionChip(
                  label: const Text('Localhost (4000)', style: TextStyle(fontSize: 12)),
                  onPressed: () {
                    _urlController.text = 'http://localhost:4000/api';
                  },
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _isTesting
                      ? null
                      : () async {
                          await ApiConfig.setBaseUrl(_urlController.text);
                          await _testActive();
                        },
                  icon: _isTesting
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.network_check_rounded, size: 18),
                  label: const Text('Test Connection', style: TextStyle(fontSize: 13)),
                ),
                const SizedBox(width: 10),
                if (_connectionHealthy != null)
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          _connectionHealthy! ? Icons.check_circle_rounded : Icons.cancel_rounded,
                          color: _connectionHealthy! ? AppColors.jade : AppColors.red,
                          size: 18,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _connectionHealthy! ? 'Online' : 'Unreachable',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _connectionHealthy! ? AppColors.jadeDark : AppColors.red,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () async {
            final navigator = Navigator.of(context);
            await ApiConfig.setBaseUrl(_urlController.text);
            widget.onSaved();
            if (mounted) navigator.pop();
          },
          child: const Text('Save & Apply'),
        ),
      ],
    );
  }
}
