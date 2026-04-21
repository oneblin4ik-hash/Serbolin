/// Supabase configuration.
///
/// Эти значения можно задать двумя способами:
/// 1. Через --dart-define при запуске / сборке:
///    flutter run -d chrome \
///      --dart-define=SUPABASE_URL=https://xxx.supabase.co \
///      --dart-define=SUPABASE_ANON_KEY=eyJhbGci...
/// 2. Прямо здесь, заменив пустые строки своими ключами (менее безопасно).
class AppConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
