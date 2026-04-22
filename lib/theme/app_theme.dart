import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color background = Color(0xFF0D0D0D);
  static const Color surface = Color(0xFF1E1E1E);
  static const Color surfaceElevated = Color(0xFF262626);
  static const Color gold = Color(0xFFC9A84C);
  static const Color goldBright = Color(0xFFE6C56A);
  static const Color red = Color(0xFF8B1A1A);
  static const Color text = Color(0xFFF0F0F0);
  static const Color subtext = Color(0xFF888888);
  static const Color divider = Color(0xFF2A2A2A);
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);

  // Дополнительные акценты для более живой палитры.
  static const Color violet = Color(0xFF7C5CFF);
  static const Color violetDeep = Color(0xFF4F2BC7);
  static const Color cyan = Color(0xFF4DD0E1);
  static const Color emerald = Color(0xFF1FAF72);

  static const LinearGradient xpGradient = LinearGradient(
    colors: [Color(0xFF1A1A1A), gold],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [gold, goldBright],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Для карточки квеста / цели.
  static const LinearGradient questGradient = LinearGradient(
    colors: [Color(0xFF242424), Color(0xFF1A1A1A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Акцентный градиент для Босса недели.
  static const LinearGradient bossGradient = LinearGradient(
    colors: [Color(0xFF2A1116), Color(0xFF180A0D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Градиент для целей (прохладный фиолетово-cyan).
  static const LinearGradient goalGradient = LinearGradient(
    colors: [violetDeep, violet],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Градиент для заголовка/hero-блока на дашборде.
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF1E1E1E), Color(0xFF111111)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppTheme {
  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    final textTheme = GoogleFonts.rajdhaniTextTheme(base.textTheme).apply(
      bodyColor: AppColors.text,
      displayColor: AppColors.text,
    );

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.background,
      canvasColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.surface,
        primary: AppColors.gold,
        secondary: AppColors.red,
        onPrimary: AppColors.background,
        onSurface: AppColors.text,
        error: AppColors.red,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: AppColors.gold),
        titleTextStyle: GoogleFonts.rajdhani(
          color: AppColors.text,
          fontSize: 22,
          fontWeight: FontWeight.w700,
          letterSpacing: 2,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
        ),
        hintStyle: const TextStyle(color: AppColors.subtext),
        labelStyle: const TextStyle(color: AppColors.subtext),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.background,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.rajdhani(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gold,
          side: const BorderSide(color: AppColors.gold),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.gold),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.gold;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(AppColors.background),
        side: const BorderSide(color: AppColors.subtext, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: AppColors.gold,
        inactiveTrackColor: AppColors.divider,
        thumbColor: AppColors.goldBright,
        overlayColor: Color(0x33C9A84C),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.gold,
        unselectedItemColor: AppColors.subtext,
        type: BottomNavigationBarType.fixed,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        space: 1,
        thickness: 1,
      ),
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.divider),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        selectedColor: AppColors.gold,
        labelStyle: const TextStyle(color: AppColors.text),
        secondaryLabelStyle: const TextStyle(color: AppColors.background),
        side: const BorderSide(color: AppColors.divider),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      tabBarTheme: TabBarTheme(
        labelColor: AppColors.gold,
        unselectedLabelColor: AppColors.subtext,
        indicator: const UnderlineTabIndicator(
          borderSide: BorderSide(color: AppColors.gold, width: 2),
        ),
        labelStyle: GoogleFonts.rajdhani(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.5,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.surface,
        contentTextStyle: const TextStyle(color: AppColors.gold),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.gold, width: 0.5),
        ),
      ),
    );
  }

  static TextStyle get title => GoogleFonts.rajdhani(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.text,
        letterSpacing: 2,
      );

  static TextStyle get subtitle => GoogleFonts.rajdhani(
        fontSize: 14,
        color: AppColors.subtext,
        letterSpacing: 1.5,
      );

  static TextStyle get hero => GoogleFonts.rajdhani(
        fontSize: 56,
        fontWeight: FontWeight.w800,
        color: AppColors.gold,
        letterSpacing: 4,
      );
}
