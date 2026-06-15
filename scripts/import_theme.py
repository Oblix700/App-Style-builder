#!/usr/bin/env python3
import os
import sys
import json
import sqlite3
import argparse
import re
import math
from datetime import datetime

# Default Template Values (from Emerald Command preset theme)
DEFAULT_THEME = {
    "app_type": "Admin Dashboard",
    "style_mood": "Modern",
    "default_mode": "Dark",
    "density": "Comfortable",
    "border_style": "Subtle",
    "component_style": "Rounded",
}

DEFAULT_COLOUR_TOKENS = {
    "base_hue": 145,
    "chroma": 0.04,
    "warm_cool": 0.0,
    "neutral_vivid": 0.05,
    "lightness": 0.5,
    "shadow_colorize": True,
    "shadow_intensity": 0.25,
    "highlight_opacity": 0.08,
    "glass_enabled": False,
    "glass_blur": 12.0,
    "glass_opacity": 0.25,
    "harmony": "complementary",
    "overrides": {}
}

DEFAULT_TYPOGRAPHY_TOKENS = {
    "heading_font": "Inter",
    "body_font": "Inter",
    "mono_font": "JetBrains Mono",
    "base_font_size": 16.0,
    "scale_ratio": 1.25,
    "heading_sizes": {
        "h1": "2.25rem",
        "h2": "1.875rem",
        "h3": "1.5rem",
        "h4": "1.25rem",
        "h5": "1.125rem",
        "h6": "1rem"
    },
    "body_text_size": "1rem",
    "small_text_size": "0.875rem",
    "muted_text_size": "0.875rem",
    "table_text_size": "0.875rem",
    "button_text_size": "0.875rem",
    "label_text_size": "0.875rem",
    "font_weights": {
        "normal": "400",
        "medium": "500",
        "bold": "700"
    },
    "line_heights": {
        "normal": "1.5",
        "tight": "1.25",
        "loose": "1.75"
    },
    "letter_spacings": {
        "normal": "0",
        "wide": "0.025em"
    },
    "preset_name": "Modern Dashboard"
}

DEFAULT_SPACING_TOKENS = {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "xxl": "48px",
    "xxxl": "64px",
    "page_padding": "24px",
    "section_gap": "32px",
    "card_padding": "20px",
    "form_gap": "16px",
    "table_cell_padding": "12px",
    "sidebar_width": "260px",
    "topbar_height": "64px",
    "modal_width": "540px",
    "dashboard_grid_gap": "20px",
    "preset_name": "Comfortable"
}

DEFAULT_RADIUS_TOKENS = {
    "none": "0px",
    "sm": "6px",
    "md": "10px",
    "lg": "16px",
    "xl": "22px",
    "pill": "9999px"
}

DEFAULT_SHADOW_TOKENS = {
    "none": "none",
    "sm": "0 1px 2px 0 rgba(0,0,0,0.05)",
    "md": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    "lg": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    "xl": "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    "card": "0 10px 30px rgba(0,0,0,0.25)",
    "modal": "0 20px 40px rgba(0,0,0,0.4)",
    "dropdown": "0 10px 20px rgba(0,0,0,0.3)",
    "button": "0 4px 12px rgba(0,0,0,0.18)",
    "focus_ring": "0 0 0 3px rgba(59,130,246,0.5)"
}

DEFAULT_ICON_SETTINGS = {
    "library": "Lucide",
    "default_size": "20px",
    "sidebar_size": "22px",
    "button_size": "18px",
    "table_action_size": "16px",
    "stroke_width": "2px",
    "colour_behaviour": "inherit text",
    "mappings": {
        "Dashboard": "LayoutDashboard",
        "Setup": "Settings",
        "Users": "Users",
        "Reports": "BarChart",
        "Finance": "CreditCard",
        "Calendar": "Calendar",
        "Documents": "FileText",
        "Search": "Search",
        "Filter": "Filter",
        "Export": "Download",
        "Edit": "Edit",
        "Delete": "Trash",
        "Save": "Save",
        "Warning": "AlertTriangle",
        "Success": "CheckCircle",
        "Info": "Info"
    }
}

DEFAULT_MOTION_TOKENS = {
    "enabled": True,
    "global_speed": "normal",
    "button_hover": "scale-up",
    "button_press": "scale-down",
    "card_hover": "lift",
    "modal_animation": "fade-in-scale",
    "sidebar_animation": "slide-in-left",
    "page_transition": "fade-in",
    "alert_animation": "slide-in-right",
    "loading_animation": "spin",
    "duration_fast": "150ms",
    "duration_normal": "300ms",
    "duration_slow": "500ms",
    "ease_standard": "cubic-bezier(0.4, 0, 0.2, 1)",
    "ease_emphasised": "cubic-bezier(0.2, 0.8, 0.2, 1)",
    "ease_bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"
}

DEFAULT_COMPONENT_STYLES = {
    "styles": {}
}

# Math utilities for RGB -> OKLCH
def rgb_to_oklch(r, g, b):
    # sRGB -> linear sRGB
    def to_linear(v):
        v_norm = v / 255.0
        return v_norm / 12.92 if v_norm <= 0.04045 else math.pow((v_norm + 0.055) / 1.055, 2.4)

    r_l = to_linear(r)
    g_l = to_linear(g)
    b_l = to_linear(b)

    # linear sRGB -> LMS
    l_lms = 0.4122214708 * r_l + 0.5363325363 * g_l + 0.0514459929 * b_l
    m_lms = 0.2119034982 * r_l + 0.6806995477 * g_l + 0.1073969541 * b_l
    s_lms = 0.0883024619 * r_l + 0.2817188376 * g_l + 0.6299787005 * b_l

    # LMS cubed root
    def cbrt(x):
        return math.copysign(abs(x) ** (1.0/3.0), x)

    l_ = cbrt(l_lms)
    m_ = cbrt(m_lms)
    s_ = cbrt(s_lms)

    # LMS cubed -> OKLab
    l_val = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a_val = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_val = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    # OKLab -> OKLCH
    c_val = math.sqrt(a_val * a_val + b_val * b_val)
    h_val = 0.0
    if c_val > 0:
        h_val = (math.atan2(b_val, a_val) * 180.0) / math.pi
        if h_val < 0:
            h_val += 360.0

    return l_val, c_val, h_val

def parse_color_to_rgb(color_str):
    color_str = color_str.strip().lower()
    
    # Hex: #ffffff or #fff
    if color_str.startswith('#'):
        hex_val = color_str[1:]
        if len(hex_val) == 3:
            hex_val = "".join([c*2 for c in hex_val])
        if len(hex_val) == 6 or len(hex_val) == 8:
            try:
                r = int(hex_val[0:2], 16)
                g = int(hex_val[2:4], 16)
                b = int(hex_val[4:6], 16)
                return r, g, b
            except ValueError:
                pass
            
    # rgb/rgba: rgb(255, 255, 255)
    match_rgb = re.match(r'^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d\.]+)?\)$', color_str)
    if match_rgb:
        return int(match_rgb.group(1)), int(match_rgb.group(2)), int(match_rgb.group(3))
        
    # hsl: hsl(200, 100%, 50%)
    match_hsl = re.match(r'^hsla?\((\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*[\d\.]+)?\)$', color_str)
    if match_hsl:
        h = int(match_hsl.group(1)) / 360.0
        s = int(match_hsl.group(2)) / 100.0
        l = int(match_hsl.group(3)) / 100.0
        
        if s == 0:
            r = g = b = l
        else:
            def hue_to_rgb(p, q, t):
                if t < 0: t += 1
                if t > 1: t -= 1
                if t < 1/6: return p + (q - p) * 6 * t
                if t < 1/2: return q
                if t < 2/3: return p + (q - p) * (2/3 - t) * 6
                return p
            q = l * (1 + s) if l < 0.5 else l + s - l * s
            p = 2 * l - q
            r = hue_to_rgb(p, q, h + 1/3)
            g = hue_to_rgb(p, q, h)
            b = hue_to_rgb(p, q, h - 1/3)
        return int(r * 255), int(g * 255), int(b * 255)

    return None

def main():
    parser = argparse.ArgumentParser(description="Import design token JSON files (Figma variables or W3C design tokens) into SQLite db.")
    parser.add_argument("token_file", help="Path to the JSON tokens file to import.")
    parser.add_argument("-d", "--db", help="Path to the SQLite database file (app_style_studio.db).")
    parser.add_argument("-n", "--name", help="Custom name for the theme (defaults to filename).")
    parser.add_argument("--app-type", default="Admin Dashboard", help="App type tag.")
    parser.add_argument("--style-mood", default="Modern", help="Style mood tag.")
    parser.add_argument("--default-mode", default="Dark", help="Default mode (Dark/Light).")
    parser.add_argument("--density", default="Comfortable", help="Layout density (Comfortable/Compact/Spacious).")
    parser.add_argument("--border-style", default="Subtle", help="Border style (Subtle/Bold/None).")
    parser.add_argument("--component-style", default="Rounded", help="Component corners style (Rounded/Sharp/Pill).")

    args = parser.parse_args()

    # 1. Resolve JSON File
    if not os.path.exists(args.token_file):
        print(f"Error: Token file not found: {args.token_file}")
        sys.exit(1)

    try:
        with open(args.token_file, 'r', encoding='utf-8') as f:
            tokens_data = json.load(f)
    except Exception as e:
        print(f"Error parsing token JSON file: {e}")
        sys.exit(1)

    # 2. Resolve SQLite DB Path
    db_path = None
    if args.db:
        db_path = args.db
    else:
        # Check standard locations
        workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(workspace_root, "build", "bin", "app_style_studio.db"),
            os.path.join(os.getcwd(), "build", "bin", "app_style_studio.db"),
            os.path.join(os.getcwd(), "app_style_studio.db"),
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                db_path = candidate
                break

    if not db_path:
        print("Error: Could not locate app_style_studio.db database file.")
        print("Please run the Wails application first to generate it, or supply the path using --db / -d.")
        sys.exit(1)

    print(f"Using SQLite database: {db_path}")

    # 3. Create theme record dictionaries from templates
    theme_name = args.name if args.name else os.path.splitext(os.path.basename(args.token_file))[0]
    
    theme_meta = {
        "name": theme_name,
        "app_type": args.app_type,
        "style_mood": args.style_mood,
        "default_mode": args.default_mode,
        "density": args.density,
        "border_style": args.border_style,
        "component_style": args.component_style,
    }

    colour_tokens = dict(DEFAULT_COLOUR_TOKENS)
    typography_tokens = dict(DEFAULT_TYPOGRAPHY_TOKENS)
    spacing_tokens = dict(DEFAULT_SPACING_TOKENS)
    radius_tokens = dict(DEFAULT_RADIUS_TOKENS)
    shadow_tokens = dict(DEFAULT_SHADOW_TOKENS)
    icon_settings = dict(DEFAULT_ICON_SETTINGS)
    motion_tokens = dict(DEFAULT_MOTION_TOKENS)
    component_styles = dict(DEFAULT_COMPONENT_STYLES)

    overrides = {}
    found_primary = None

    # Recursive search helper
    def search_obj(current, path=None):
        nonlocal found_primary
        if path is None:
            path = []
        if not current or not isinstance(current, dict):
            return

        for key, val in current.items():
            new_path = path + [key.lower()]
            path_str = ".".join(new_path)

            if isinstance(val, str) and (val.startswith('#') or val.startswith('rgb') or val.startswith('hsl')):
                if 'primary' in path_str or 'brand' in path_str:
                    overrides['primary'] = val
                    found_primary = val
                elif 'secondary' in path_str or 'accent' in path_str:
                    overrides['secondary'] = val
                elif any(x in path_str for x in ['bg', 'background', 'surface']):
                    overrides['bg'] = val
                elif 'text' in path_str or 'foreground' in path_str:
                    overrides['text'] = val
            
            elif isinstance(val, (int, float)) or (isinstance(val, str) and val.endswith('px')):
                px_val = f"{val}px" if isinstance(val, (int, float)) else val
                if 'radius' in path_str or 'rounded' in path_str:
                    if 'sm' in path_str: radius_tokens['sm'] = px_val
                    elif 'md' in path_str or 'medium' in path_str: radius_tokens['md'] = px_val
                    elif 'lg' in path_str or 'large' in path_str: radius_tokens['lg'] = px_val
                    elif 'xl' in path_str: radius_tokens['xl'] = px_val
                elif any(x in path_str for x in ['spacing', 'gap', 'padding']):
                    if 'page' in path_str: spacing_tokens['page_padding'] = px_val
                    elif 'card' in path_str: spacing_tokens['card_padding'] = px_val
                    elif 'cell' in path_str: spacing_tokens['table_cell_padding'] = px_val
                    elif 'grid' in path_str: spacing_tokens['dashboard_grid_gap'] = px_val
                    elif 'form' in path_str: spacing_tokens['form_gap'] = px_val

            elif isinstance(val, dict) and '$value' in val:
                w3c_val = val['$value']
                w3c_type = val.get('$type')
                
                if w3c_type == 'color' and isinstance(w3c_val, str):
                    if 'primary' in path_str or 'brand' in path_str:
                        overrides['primary'] = w3c_val
                        found_primary = w3c_val
                    elif 'secondary' in path_str or 'accent' in path_str:
                        overrides['secondary'] = w3c_val
                    elif any(x in path_str for x in ['bg', 'background', 'surface']):
                        overrides['bg'] = w3c_val
                    elif 'text' in path_str or 'foreground' in path_str:
                        overrides['text'] = w3c_val
                elif w3c_type == 'dimension' or isinstance(w3c_val, (int, float)) or (isinstance(w3c_val, str) and w3c_val.endswith('px')):
                    px_val = f"{w3c_val}px" if isinstance(w3c_val, (int, float)) else w3c_val
                    if 'radius' in path_str or 'rounded' in path_str:
                        if 'sm' in path_str: radius_tokens['sm'] = px_val
                        elif 'md' in path_str or 'medium' in path_str: radius_tokens['md'] = px_val
                        elif 'lg' in path_str or 'large' in path_str: radius_tokens['lg'] = px_val
                        elif 'xl' in path_str: radius_tokens['xl'] = px_val
                    elif any(x in path_str for x in ['spacing', 'gap', 'padding']):
                        if 'page' in path_str: spacing_tokens['page_padding'] = px_val
                        elif 'card' in path_str: spacing_tokens['card_padding'] = px_val
                        elif 'cell' in path_str: spacing_tokens['table_cell_padding'] = px_val

            else:
                search_obj(val, new_path)

    # Execute recursive parsing
    search_obj(tokens_data)

    # Apply color overrides and run OKLCH calculation
    if found_primary:
        colour_tokens['overrides'] = overrides
        rgb = parse_color_to_rgb(found_primary)
        if rgb:
            r, g, b = rgb
            l_val, c_val, h_val = rgb_to_oklch(r, g, b)
            colour_tokens['base_hue'] = round(h_val)
            colour_tokens['chroma'] = round(min(0.25, max(0.0, c_val)), 3)
            print(f"Extracted Primary Color: {found_primary} (Converted to Base Hue: {colour_tokens['base_hue']} deg, Chroma: {colour_tokens['chroma']})")
        else:
            print(f"Warning: Primary color string could not be parsed: {found_primary}")
    else:
        print("Note: No primary or brand color detected. Using default base hue.")

    # 4. Insert into SQLite
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        now_str = datetime.now().isoformat()
        
        # Insert Theme Meta
        cursor.execute("""
            INSERT INTO themes (name, app_type, style_mood, default_mode, density, border_style, component_style, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            theme_meta['name'],
            theme_meta['app_type'],
            theme_meta['style_mood'],
            theme_meta['default_mode'],
            theme_meta['density'],
            theme_meta['border_style'],
            theme_meta['component_style'],
            now_str,
            now_str
        ))
        
        theme_id = cursor.lastrowid
        print(f"Theme '{theme_meta['name']}' inserted successfully with ID: {theme_id}")

        # Insert Tokens Child Records
        child_records = [
            ("colour_tokens", colour_tokens),
            ("typography_tokens", typography_tokens),
            ("spacing_tokens", spacing_tokens),
            ("radius_tokens", radius_tokens),
            ("shadow_tokens", shadow_tokens),
            ("icon_settings", icon_settings),
            ("motion_tokens", motion_tokens),
            ("component_styles", component_styles)
        ]

        for table, data_dict in child_records:
            cursor.execute(f"""
                INSERT INTO {table} (theme_id, data)
                VALUES (?, ?)
            """, (theme_id, json.dumps(data_dict)))

        conn.commit()
        print("[OK] All token sets committed to database successfully!")
        print(f"Run the App Style Studio to select and export '{theme_meta['name']}' now.")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Database insertion failed: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
