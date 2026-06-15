package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

type Theme struct {
	ID             int64  `json:"id"`
	Name           string `json:"name"`
	AppType        string `json:"app_type"`
	StyleMood      string `json:"style_mood"`
	DefaultMode    string `json:"default_mode"`
	Density        string `json:"density"`
	BorderStyle    string `json:"border_style"`
	ComponentStyle string `json:"component_style"`
	UIMode         string `json:"ui_mode"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

type ColorTokens struct {
	BaseHue          float64           `json:"base_hue"`
	Chroma           float64           `json:"chroma"`
	WarmCool         float64           `json:"warm_cool"`
	NeutralVivid     float64           `json:"neutral_vivid"`
	Lightness        float64           `json:"lightness"`
	ShadowColorize   bool              `json:"shadow_colorize"`
	ShadowIntensity  float64           `json:"shadow_intensity"`
	HighlightOpacity float64           `json:"highlight_opacity"`
	GlassEnabled     bool              `json:"glass_enabled"`
	GlassBlur        float64           `json:"glass_blur"`
	GlassOpacity     float64           `json:"glass_opacity"`
	Harmony          string            `json:"harmony"`
	Overrides        map[string]string `json:"overrides"`
}

type TypographyTokens struct {
	HeadingFont    string            `json:"heading_font"`
	BodyFont       string            `json:"body_font"`
	MonoFont       string            `json:"mono_font"`
	BaseFontSize   float64           `json:"base_font_size"`
	ScaleRatio     float64           `json:"scale_ratio"`
	HeadingSizes   map[string]string `json:"heading_sizes"`
	BodyTextSize   string            `json:"body_text_size"`
	SmallTextSize  string            `json:"small_text_size"`
	MutedTextSize  string            `json:"muted_text_size"`
	TableTextSize  string            `json:"table_text_size"`
	ButtonTextSize string            `json:"button_text_size"`
	LabelTextSize  string            `json:"label_text_size"`
	FontWeights    map[string]string `json:"font_weights"`
	LineHeights    map[string]string `json:"line_heights"`
	LetterSpacings map[string]string `json:"letter_spacings"`
	PresetName     string            `json:"preset_name"`
}

type SpacingTokens struct {
	XS               string `json:"xs"`
	SM               string `json:"sm"`
	MD               string `json:"md"`
	LG               string `json:"lg"`
	XL               string `json:"xl"`
	XXL              string `json:"xxl"`
	XXXL             string `json:"xxxl"`
	PagePadding      string `json:"page_padding"`
	SectionGap       string `json:"section_gap"`
	CardPadding      string `json:"card_padding"`
	FormGap          string `json:"form_gap"`
	TableCellPadding string `json:"table_cell_padding"`
	SidebarWidth     string `json:"sidebar_width"`
	TopbarHeight     string `json:"topbar_height"`
	ModalWidth       string `json:"modal_width"`
	DashboardGridGap string `json:"dashboard_grid_gap"`
	PresetName       string `json:"preset_name"`
}

type RadiusTokens struct {
	None string `json:"none"`
	SM   string `json:"sm"`
	MD   string `json:"md"`
	LG   string `json:"lg"`
	XL   string `json:"xl"`
	Pill string `json:"pill"`
}

type ShadowTokens struct {
	None      string `json:"none"`
	SM        string `json:"sm"`
	MD        string `json:"md"`
	LG        string `json:"lg"`
	XL        string `json:"xl"`
	Card      string `json:"card"`
	Modal     string `json:"modal"`
	Dropdown  string `json:"dropdown"`
	Button    string `json:"button"`
	FocusRing string `json:"focus_ring"`
}

type IconSettings struct {
	Library         string            `json:"library"`
	DefaultSize     string            `json:"default_size"`
	SidebarSize     string            `json:"sidebar_size"`
	ButtonSize      string            `json:"button_size"`
	TableActionSize string            `json:"table_action_size"`
	StrokeWidth     string            `json:"stroke_width"`
	ColourBehaviour string            `json:"colour_behaviour"`
	Mappings        map[string]string `json:"mappings"`
}

type MotionTokens struct {
	Enabled          bool   `json:"enabled"`
	GlobalSpeed      string `json:"global_speed"`
	ButtonHover      string `json:"button_hover"`
	ButtonPress      string `json:"button_press"`
	CardHover        string `json:"card_hover"`
	ModalAnimation   string `json:"modal_animation"`
	SidebarAnimation string `json:"sidebar_animation"`
	PageTransition   string `json:"page_transition"`
	AlertAnimation   string `json:"alert_animation"`
	LoadingAnimation string `json:"loading_animation"`
	DurationFast     string `json:"duration_fast"`
	DurationNormal   string `json:"duration_normal"`
	DurationSlow     string `json:"duration_slow"`
	EaseStandard     string `json:"ease_standard"`
	EaseEmphasised   string `json:"ease_emphasised"`
	EaseBounce       string `json:"ease_bounce"`
}

type ComponentStyles struct {
	Styles map[string]string `json:"styles"`
}

type ThemeDetail struct {
	Theme            Theme            `json:"theme"`
	ColourTokens     ColorTokens      `json:"colour_tokens"`
	TypographyTokens TypographyTokens `json:"typography_tokens"`
	SpacingTokens    SpacingTokens    `json:"spacing_tokens"`
	RadiusTokens     RadiusTokens     `json:"radius_tokens"`
	ShadowTokens     ShadowTokens     `json:"shadow_tokens"`
	IconSettings     IconSettings     `json:"icon_settings"`
	MotionTokens     MotionTokens     `json:"motion_tokens"`
	ComponentStyles  ComponentStyles  `json:"component_styles"`
}

type ExportLog struct {
	ID         int64  `json:"id"`
	ThemeID    int64  `json:"theme_id"`
	ThemeName  string `json:"theme_name"`
	ExportType string `json:"export_type"`
	ExportedAt string `json:"exported_at"`
}

type DBManager struct {
	db *sql.DB
}

func NewDBManager() (*DBManager, error) {
	// Find directory where the executable is located to keep data portable
	exePath, err := os.Executable()
	var dbDir string
	if err != nil {
		// Fallback to current directory
		dbDir = "."
	} else {
		dbDir = filepath.Dir(exePath)
	}

	dbPath := filepath.Join(dbDir, "app_style_studio.db")
	fmt.Printf("Using SQLite database path: %s\n", dbPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	mgr := &DBManager{db: db}
	if err := mgr.initSchema(); err != nil {
		db.Close()
		return nil, err
	}

	return mgr, nil
}

func (m *DBManager) Close() {
	if m.db != nil {
		m.db.Close()
	}
}

func (m *DBManager) initSchema() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS themes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			app_type TEXT,
			style_mood TEXT,
			default_mode TEXT,
			density TEXT,
			border_style TEXT,
			component_style TEXT,
			ui_mode TEXT DEFAULT 'easy',
			created_at TEXT,
			updated_at TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS colour_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS typography_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS spacing_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS radius_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS shadow_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS icon_settings (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS motion_tokens (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS component_styles (
			theme_id INTEGER PRIMARY KEY,
			data TEXT NOT NULL,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
		`CREATE TABLE IF NOT EXISTS export_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			theme_id INTEGER,
			export_type TEXT,
			exported_at TEXT,
			FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
		);`,
	}

	for _, query := range queries {
		if _, err := m.db.Exec(query); err != nil {
			return fmt.Errorf("failed schema execution: %w", err)
		}
	}

	// Safe schema migration: add ui_mode column to themes table if it doesn't already exist
	_, _ = m.db.Exec("ALTER TABLE themes ADD COLUMN ui_mode TEXT DEFAULT 'easy'")

	// Seed standard default theme if table is empty
	return m.seedDefaultIfNeeded()
}

func (m *DBManager) seedDefaultIfNeeded() error {
	var count int
	err := m.db.QueryRow("SELECT COUNT(*) FROM themes").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	// Create default theme Detail
	nowStr := time.Now().Format(time.RFC3339)
	defaultDetail := &ThemeDetail{
		Theme: Theme{
			Name:           "Emerald Command",
			AppType:        "Admin Dashboard",
			StyleMood:      "Modern",
			DefaultMode:    "Dark",
			Density:        "Comfortable",
			BorderStyle:    "Subtle",
			ComponentStyle: "Rounded",
			UIMode:         "easy",
			CreatedAt:      nowStr,
			UpdatedAt:      nowStr,
		},
		ColourTokens: ColorTokens{
			BaseHue:          264,
			Chroma:           0.02,
			WarmCool:         0,
			NeutralVivid:     0.05,
			Lightness:        0.5,
			ShadowColorize:   true,
			ShadowIntensity:  0.25,
			HighlightOpacity: 0.08,
			GlassEnabled:     false,
			GlassBlur:        12.0,
			GlassOpacity:     0.25,
			Harmony:          "complementary",
			Overrides:        make(map[string]string),
		},
		TypographyTokens: TypographyTokens{
			HeadingFont:  "Inter",
			BodyFont:     "Inter",
			MonoFont:     "JetBrains Mono",
			BaseFontSize: 16,
			ScaleRatio:   1.25,
			HeadingSizes: map[string]string{
				"h1": "2.25rem",
				"h2": "1.875rem",
				"h3": "1.5rem",
				"h4": "1.25rem",
				"h5": "1.125rem",
				"h6": "1rem",
			},
			BodyTextSize:   "1rem",
			SmallTextSize:  "0.875rem",
			MutedTextSize:  "0.875rem",
			TableTextSize:  "0.875rem",
			ButtonTextSize: "0.875rem",
			LabelTextSize:  "0.875rem",
			FontWeights: map[string]string{
				"normal": "400",
				"medium": "500",
				"bold":   "700",
			},
			LineHeights: map[string]string{
				"normal": "1.5",
				"tight":  "1.25",
				"loose":  "1.75",
			},
			LetterSpacings: map[string]string{
				"normal": "0",
				"wide":   "0.025em",
			},
			PresetName: "Modern Dashboard",
		},
		SpacingTokens: SpacingTokens{
			XS:               "4px",
			SM:               "8px",
			MD:               "16px",
			LG:               "24px",
			XL:               "32px",
			XXL:              "48px",
			XXXL:             "64px",
			PagePadding:      "24px",
			SectionGap:       "32px",
			CardPadding:      "20px",
			FormGap:          "16px",
			TableCellPadding: "12px",
			SidebarWidth:     "260px",
			TopbarHeight:     "64px",
			ModalWidth:       "540px",
			DashboardGridGap: "20px",
			PresetName:       "Comfortable",
		},
		RadiusTokens: RadiusTokens{
			None: "0px",
			SM:   "6px",
			MD:   "10px",
			LG:   "16px",
			XL:   "22px",
			Pill: "9999px",
		},
		ShadowTokens: ShadowTokens{
			None:      "none",
			SM:        "0 1px 2px 0 rgba(0,0,0,0.05)",
			MD:        "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
			LG:        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
			XL:        "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
			Card:      "0 10px 30px rgba(0,0,0,0.25)",
			Modal:     "0 20px 40px rgba(0,0,0,0.4)",
			Dropdown:  "0 10px 20px rgba(0,0,0,0.3)",
			Button:    "0 4px 12px rgba(0,0,0,0.18)",
			FocusRing: "0 0 0 3px rgba(59,130,246,0.5)",
		},
		IconSettings: IconSettings{
			Library:         "Lucide",
			DefaultSize:     "20px",
			SidebarSize:     "22px",
			ButtonSize:      "18px",
			TableActionSize: "16px",
			StrokeWidth:     "2px",
			ColourBehaviour: "inherit text",
			Mappings: map[string]string{
				"Dashboard": "LayoutDashboard",
				"Setup":     "Settings",
				"Users":     "Users",
				"Reports":   "BarChart",
				"Finance":   "CreditCard",
				"Calendar":  "Calendar",
				"Documents": "FileText",
				"Search":    "Search",
				"Filter":    "Filter",
				"Export":    "Download",
				"Edit":      "Edit",
				"Delete":    "Trash",
				"Save":      "Save",
				"Warning":   "AlertTriangle",
				"Success":   "CheckCircle",
				"Info":      "Info",
			},
		},
		MotionTokens: MotionTokens{
			Enabled:          true,
			GlobalSpeed:      "normal",
			ButtonHover:      "scale-up",
			ButtonPress:      "scale-down",
			CardHover:        "lift",
			ModalAnimation:   "fade-in-scale",
			SidebarAnimation: "slide-in-left",
			PageTransition:   "fade-in",
			AlertAnimation:   "slide-in-right",
			LoadingAnimation: "spin",
			DurationFast:     "150ms",
			DurationNormal:   "300ms",
			DurationSlow:     "500ms",
			EaseStandard:     "cubic-bezier(0.4, 0, 0.2, 1)",
			EaseEmphasised:   "cubic-bezier(0.2, 0.8, 0.2, 1)",
			EaseBounce:       "cubic-bezier(0.34, 1.56, 0.64, 1)",
		},
		ComponentStyles: ComponentStyles{
			Styles: map[string]string{},
		},
	}

	_, err = m.SaveTheme(defaultDetail)
	return err
}

func (m *DBManager) ListThemes() ([]Theme, error) {
	rows, err := m.db.Query("SELECT id, name, app_type, style_mood, default_mode, density, border_style, component_style, ui_mode, created_at, updated_at FROM themes ORDER BY updated_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var themes []Theme
	for rows.Next() {
		var t Theme
		err := rows.Scan(&t.ID, &t.Name, &t.AppType, &t.StyleMood, &t.DefaultMode, &t.Density, &t.BorderStyle, &t.ComponentStyle, &t.UIMode, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		themes = append(themes, t)
	}
	return themes, nil
}

func (m *DBManager) GetTheme(id int64) (*ThemeDetail, error) {
	var detail ThemeDetail

	err := m.db.QueryRow("SELECT id, name, app_type, style_mood, default_mode, density, border_style, component_style, ui_mode, created_at, updated_at FROM themes WHERE id = ?", id).
		Scan(&detail.Theme.ID, &detail.Theme.Name, &detail.Theme.AppType, &detail.Theme.StyleMood, &detail.Theme.DefaultMode, &detail.Theme.Density, &detail.Theme.BorderStyle, &detail.Theme.ComponentStyle, &detail.Theme.UIMode, &detail.Theme.CreatedAt, &detail.Theme.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("theme not found")
	} else if err != nil {
		return nil, err
	}

	// Fetch color
	var colorData string
	err = m.db.QueryRow("SELECT data FROM colour_tokens WHERE theme_id = ?", id).Scan(&colorData)
	if err == nil {
		json.Unmarshal([]byte(colorData), &detail.ColourTokens)
	}

	// Fetch typography
	var typographyData string
	err = m.db.QueryRow("SELECT data FROM typography_tokens WHERE theme_id = ?", id).Scan(&typographyData)
	if err == nil {
		json.Unmarshal([]byte(typographyData), &detail.TypographyTokens)
	}

	// Fetch spacing
	var spacingData string
	err = m.db.QueryRow("SELECT data FROM spacing_tokens WHERE theme_id = ?", id).Scan(&spacingData)
	if err == nil {
		json.Unmarshal([]byte(spacingData), &detail.SpacingTokens)
	}

	// Fetch radius
	var radiusData string
	err = m.db.QueryRow("SELECT data FROM radius_tokens WHERE theme_id = ?", id).Scan(&radiusData)
	if err == nil {
		json.Unmarshal([]byte(radiusData), &detail.RadiusTokens)
	}

	// Fetch shadow
	var shadowData string
	err = m.db.QueryRow("SELECT data FROM shadow_tokens WHERE theme_id = ?", id).Scan(&shadowData)
	if err == nil {
		json.Unmarshal([]byte(shadowData), &detail.ShadowTokens)
	}

	// Fetch icons
	var iconData string
	err = m.db.QueryRow("SELECT data FROM icon_settings WHERE theme_id = ?", id).Scan(&iconData)
	if err == nil {
		json.Unmarshal([]byte(iconData), &detail.IconSettings)
	}

	// Fetch motion
	var motionData string
	err = m.db.QueryRow("SELECT data FROM motion_tokens WHERE theme_id = ?", id).Scan(&motionData)
	if err == nil {
		json.Unmarshal([]byte(motionData), &detail.MotionTokens)
	}

	// Fetch components
	var componentData string
	err = m.db.QueryRow("SELECT data FROM component_styles WHERE theme_id = ?", id).Scan(&componentData)
	if err == nil {
		json.Unmarshal([]byte(componentData), &detail.ComponentStyles)
	}

	return &detail, nil
}

func (m *DBManager) SaveTheme(detail *ThemeDetail) (int64, error) {
	tx, err := m.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	nowStr := time.Now().Format(time.RFC3339)

	if detail.Theme.UIMode == "" {
		detail.Theme.UIMode = "easy"
	}

	var themeID int64
	if detail.Theme.ID > 0 {
		themeID = detail.Theme.ID
		_, err = tx.Exec("UPDATE themes SET name = ?, app_type = ?, style_mood = ?, default_mode = ?, density = ?, border_style = ?, component_style = ?, ui_mode = ?, updated_at = ? WHERE id = ?",
			detail.Theme.Name, detail.Theme.AppType, detail.Theme.StyleMood, detail.Theme.DefaultMode, detail.Theme.Density, detail.Theme.BorderStyle, detail.Theme.ComponentStyle, detail.Theme.UIMode, nowStr, themeID)
		if err != nil {
			return 0, err
		}
	} else {
		res, err := tx.Exec("INSERT INTO themes (name, app_type, style_mood, default_mode, density, border_style, component_style, ui_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			detail.Theme.Name, detail.Theme.AppType, detail.Theme.StyleMood, detail.Theme.DefaultMode, detail.Theme.Density, detail.Theme.BorderStyle, detail.Theme.ComponentStyle, detail.Theme.UIMode, nowStr, nowStr)
		if err != nil {
			return 0, err
		}
		themeID, err = res.LastInsertId()
		if err != nil {
			return 0, err
		}
		detail.Theme.ID = themeID
	}

	saveJSON := func(table string, val interface{}) error {
		bytes, err := json.Marshal(val)
		if err != nil {
			return err
		}
		_, err = tx.Exec(fmt.Sprintf("INSERT INTO %s (theme_id, data) VALUES (?, ?) ON CONFLICT(theme_id) DO UPDATE SET data = excluded.data", table), themeID, string(bytes))
		return err
	}

	if err := saveJSON("colour_tokens", detail.ColourTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("typography_tokens", detail.TypographyTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("spacing_tokens", detail.SpacingTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("radius_tokens", detail.RadiusTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("shadow_tokens", detail.ShadowTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("icon_settings", detail.IconSettings); err != nil {
		return 0, err
	}
	if err := saveJSON("motion_tokens", detail.MotionTokens); err != nil {
		return 0, err
	}
	if err := saveJSON("component_styles", detail.ComponentStyles); err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return themeID, nil
}

func (m *DBManager) DuplicateTheme(id int64) (int64, error) {
	detail, err := m.GetTheme(id)
	if err != nil {
		return 0, err
	}

	detail.Theme.ID = 0
	detail.Theme.Name = detail.Theme.Name + " (Copy)"
	return m.SaveTheme(detail)
}

func (m *DBManager) DeleteTheme(id int64) error {
	_, err := m.db.Exec("DELETE FROM themes WHERE id = ?", id)
	return err
}

func (m *DBManager) AddExportLog(themeID int64, exportType string) error {
	nowStr := time.Now().Format(time.RFC3339)
	_, err := m.db.Exec("INSERT INTO export_history (theme_id, export_type, exported_at) VALUES (?, ?, ?)", themeID, exportType, nowStr)
	return err
}

func (m *DBManager) GetExportHistory() ([]ExportLog, error) {
	rows, err := m.db.Query(`
		SELECT e.id, e.theme_id, t.name, e.export_type, e.exported_at 
		FROM export_history e
		JOIN themes t ON e.theme_id = t.id 
		ORDER BY e.exported_at DESC LIMIT 50`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []ExportLog
	for rows.Next() {
		var l ExportLog
		err := rows.Scan(&l.ID, &l.ThemeID, &l.ThemeName, &l.ExportType, &l.ExportedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}
