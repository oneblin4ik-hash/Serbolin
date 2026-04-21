import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config.dart';
import 'screens/achievements_screen.dart';
import 'screens/login_screen.dart';
import 'screens/setup_required_screen.dart';
import 'screens/shell_screen.dart';
import 'services/achievement_service.dart';
import 'services/quest_service.dart';
import 'services/xp_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ru');

  if (AppConfig.isConfigured) {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
  }

  runApp(const SerbolinApp());
}

class SerbolinApp extends StatelessWidget {
  const SerbolinApp({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.isConfigured) {
      return MaterialApp(
        title: 'Serbolin',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark(),
        home: const SetupRequiredScreen(),
      );
    }
    return MaterialApp(
      title: 'Serbolin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      routes: {
        '/achievements': (_) => const AchievementsScreen(),
      },
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        final session = Supabase.instance.client.auth.currentSession;
        if (session == null) {
          return const LoginScreen();
        }
        return const _AuthedRoot();
      },
    );
  }
}

class _AuthedRoot extends StatefulWidget {
  const _AuthedRoot();

  @override
  State<_AuthedRoot> createState() => _AuthedRootState();
}

class _AuthedRootState extends State<_AuthedRoot> {
  late final XPService _xp;
  late final QuestService _quests;
  late final AchievementService _ach;
  late final Future<void> _bootstrap;

  @override
  void initState() {
    super.initState();
    _xp = XPService();
    _quests = QuestService();
    _ach = AchievementService(xpService: _xp);
    _bootstrap = _boot();
  }

  Future<void> _boot() async {
    await _xp.load();
    await _quests.load();
    await _ach.load();
  }

  @override
  void dispose() {
    _xp.dispose();
    _ach.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _bootstrap,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppColors.gold),
            ),
          );
        }
        if (snap.hasError) {
          return Scaffold(
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline,
                        color: AppColors.red, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      'Ошибка загрузки:\n${snap.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.subtext),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () async {
                        await Supabase.instance.client.auth.signOut();
                      },
                      child: const Text('ВЫЙТИ'),
                    ),
                  ],
                ),
              ),
            ),
          );
        }
        return MultiProvider(
          providers: [
            ChangeNotifierProvider<XPService>.value(value: _xp),
            ChangeNotifierProvider<QuestService>.value(value: _quests),
            ChangeNotifierProvider<AchievementService>.value(value: _ach),
          ],
          child: const ShellScreen(),
        );
      },
    );
  }
}
