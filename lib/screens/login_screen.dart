import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  bool _isSignUp = false;
  String? _error;
  String? _info;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final form = _formKey.currentState;
    if (form == null || !form.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      final auth = Supabase.instance.client.auth;
      if (_isSignUp) {
        final res = await auth.signUp(
          email: _email.text.trim(),
          password: _password.text,
        );
        if (res.session == null) {
          setState(() {
            _info =
                'Аккаунт создан. Проверь почту и подтверди email, затем войди.';
            _isSignUp = false;
          });
        }
      } else {
        await auth.signInWithPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Ошибка: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              children: [
                Text('SERBOLIN', style: AppTheme.hero.copyWith(fontSize: 44)),
                const SizedBox(height: 4),
                Text(
                  'PERSONAL RPG · SYSTEM LOGIN',
                  style: AppTheme.subtitle.copyWith(letterSpacing: 3),
                ),
                const SizedBox(height: 36),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            autofillHints: const [AutofillHints.email],
                            decoration:
                                const InputDecoration(labelText: 'Email'),
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Введи email';
                              }
                              if (!v.contains('@')) return 'Некорректный email';
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _password,
                            obscureText: true,
                            autofillHints: const [AutofillHints.password],
                            decoration:
                                const InputDecoration(labelText: 'Пароль'),
                            validator: (v) {
                              if (v == null || v.length < 6) {
                                return 'Минимум 6 символов';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          if (_error != null) ...[
                            Text(_error!,
                                style:
                                    const TextStyle(color: AppColors.red)),
                            const SizedBox(height: 10),
                          ],
                          if (_info != null) ...[
                            Text(_info!,
                                style:
                                    const TextStyle(color: AppColors.gold)),
                            const SizedBox(height: 10),
                          ],
                          ElevatedButton(
                            onPressed: _loading ? null : _submit,
                            child: _loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.background,
                                    ),
                                  )
                                : Text(_isSignUp
                                    ? 'СОЗДАТЬ АККАУНТ'
                                    : 'ВОЙТИ'),
                          ),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: _loading
                                ? null
                                : () => setState(() {
                                      _isSignUp = !_isSignUp;
                                      _error = null;
                                      _info = null;
                                    }),
                            child: Text(_isSignUp
                                ? 'Уже есть аккаунт? Войти'
                                : 'Нет аккаунта? Зарегистрироваться'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'DISCIPLINE · PROGRESS · POWER',
                  style: TextStyle(
                    color: AppColors.subtext,
                    letterSpacing: 3,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
