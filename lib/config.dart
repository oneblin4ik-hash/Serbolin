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
    defaultValue: 'https://vqoorbjzqgvznzlpemwq.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb29yYmp6cWd2em56bHBlbXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODcwNDcsImV4cCI6MjA5MjM2MzA0N30.ddvG-XIM5NZYygTrW26080hBFBFsMCO9Z9xtat27XEo',
  );

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
