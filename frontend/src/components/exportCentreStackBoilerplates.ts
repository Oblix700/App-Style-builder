interface StackBoilerplateColors {
  primary?: string;
  secondary?: string;
  success?: string;
  info?: string;
  warning?: string;
  danger?: string;
}

export function buildStackBoilerplates(colors: StackBoilerplateColors) {
  const reactToggleCode = `import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkClass = document.documentElement.classList.contains('dark');
    const localSetting = localStorage.getItem('theme-mode');
    
    if (localSetting) {
      const wantDark = localSetting === 'dark';
      setIsDark(wantDark);
      if (wantDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setIsDark(isDarkClass);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-light)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Icons.Sun size={18} className="text-[var(--primary)]" />
      ) : (
        <Icons.Moon size={18} className="text-[var(--secondary)]" />
      )}
    </button>
  );
}`;

  const reactEChartsCode = `import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartsWrapperProps {
  options: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
}

export function EChartsWrapper({ options, style, className }: EChartsWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const themeName = 'app_style_studio_theme';
    echarts.registerTheme(themeName, {
      color: [
        '${colors.primary || '#7c66dc'}', 
        '${colors.secondary || '#dc66c5'}', 
        '${colors.success || '#5bea87'}', 
        '${colors.info || '#5bcaea'}', 
        '${colors.warning || '#eaab5b'}', 
        '${colors.danger || '#ea5b5b'}'
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'var(--font-body)',
        color: 'var(--text)'
      },
      title: {
        textStyle: {
          fontFamily: 'var(--font-heading)',
          color: 'var(--text)'
        }
      },
      line: {
        smooth: true,
        lineStyle: { width: 3 }
      },
      categoryAxis: {
        axisLine: { lineStyle: { color: 'var(--border)' } },
        axisLabel: { color: 'var(--text-muted)' },
        splitLine: { show: false }
      },
      valueAxis: {
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'var(--border-muted)', type: 'dashed' } },
        axisLabel: { color: 'var(--text-muted)' }
      }
    });

    const chart = echarts.init(chartRef.current, themeName);
    chartInstance.current = chart;
    chart.setOption(options);

    const observer = new MutationObserver(() => {
      chart.dispose();
      const newChart = echarts.init(chartRef.current!, themeName);
      chartInstance.current = newChart;
      newChart.setOption(options);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [options]);

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '350px', ...style }} 
      className={className} 
    />
  );
}`;

  const goDbCode = `package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type ThemePreferences struct {
	ID        int64  \`json:"id"\`
	ThemeName string \`json:"theme_name"\`
	TokenData string \`json:"token_data"\`
	UpdatedAt string \`json:"updated_at"\`
}

type DBStore struct {
	db *sql.DB
}

func NewDBStore(dbName string) (*DBStore, error) {
	exePath, err := os.Executable()
	var dbDir string
	if err != nil {
		dbDir = "."
	} else {
		dbDir = filepath.Dir(exePath)
	}

	dbPath := filepath.Join(dbDir, dbName)
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	store := &DBStore{db: db}
	if err := store.migrate(); err != nil {
		db.Close()
		return nil, err
	}

	return store, nil
}

func (s *DBStore) Close() {
	if s.db != nil {
		s.db.Close()
	}
}

func (s *DBStore) migrate() error {
	query := \`
	CREATE TABLE IF NOT EXISTS theme_preferences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		theme_name TEXT NOT NULL,
		token_data TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);\`
	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to run database migration: %w", err)
	}
	return nil
}

func (s *DBStore) GetPreferences() (*ThemePreferences, error) {
	query := \`SELECT id, theme_name, token_data, updated_at FROM theme_preferences ORDER BY id DESC LIMIT 1\`
	var prefs ThemePreferences
	err := s.db.QueryRow(query).Scan(&prefs.ID, &prefs.ThemeName, &prefs.TokenData, &prefs.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &prefs, nil
}

func (s *DBStore) SavePreferences(themeName string, tokenData interface{}, timestamp string) error {
	jsonData, err := json.Marshal(tokenData)
	if err != nil {
		return fmt.Errorf("failed to marshal token data: %w", err)
	}

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, _ = tx.Exec(\`DELETE FROM theme_preferences\`)
	_, err = tx.Exec(
		\`INSERT INTO theme_preferences (theme_name, token_data, updated_at) VALUES (?, ?, ?)\`,
		themeName, string(jsonData), timestamp,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}`;

  const stackReadmeCode = `# App Style Studio - Stack Harmony Bundle

This bundle contains styling files, config setups, and boilerplate files customized for your stack: **React (TS) + Wails + Tailwind + SQLite + ECharts**.

## Folder Contents
- \`styles/theme.css\`: Custom CSS properties for your design palette. Copy this to your CSS folder and import it in \`main.tsx\` or \`index.html\`.
- \`styles/components.css\`: Premium component styles (buttons, card layout, inputs, tables) utilizing the CSS variables.
- \`config/tailwind.config.ts\`: Tailwind settings showing color, border radius, and font-family extensions. Merge these definitions with your current Tailwind config.
- \`components/ThemeToggle.tsx\`: A pre-styled, interactive light/dark mode switch. Place it in your navbar.
- \`components/EChartsWrapper.tsx\`: A React component wrapping ECharts. It registers your color tokens and dynamically updates whenever the theme switches between light and dark mode.
- \`database/theme_store.go\`: A Go SQLite manager for Wails showing how to serialize and persist styling configurations or other app records inside SQLite.

## Quick Integration Steps
1. **Fonts**: Add google font loading in your HTML index file:
   \`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">\`
2. **Styles**: Import \`theme.css\` and \`components.css\` in your React entry file (e.g. \`main.tsx\`):
   \`\`\`typescript
   import './styles/theme.css';
   import './styles/components.css';
   \`\`\`
3. **Tailwind Config**: Extend your \`tailwind.config\` to use the CSS variable mappings so classes like \`bg-bg\`, \`text-primary\`, and \`border-border\` function out of the box.
4. **Theme Toggle**: Render the \`<ThemeToggle />\` component in your sidebar or header.
5. **Charts**: Wrap your charts inside the \`<EChartsWrapper options={myOptions} />\` to automatically style charts to match the layout.

*Generated with love by App Style Studio.*`;

  return {
    reactToggleCode,
    reactEChartsCode,
    goDbCode,
    stackReadmeCode,
  };
}
