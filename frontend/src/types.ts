export interface Theme {
  id: number;
  name: string;
  app_type: string;
  style_mood: string;
  default_mode: string;
  density: string;
  border_style: string;
  component_style: string;
  ui_mode?: string;
  created_at: string;
  updated_at: string;
}

export interface ColorTokens {
  base_hue: number;
  chroma: number;
  warm_cool: number;
  neutral_vivid: number;
  lightness: number;
  shadow_colorize: boolean;
  shadow_intensity: number;
  highlight_opacity: number;
  glass_enabled: boolean;
  glass_blur: number;
  glass_opacity: number;
  harmony: string;
  overrides: Record<string, string>;
}

export interface TypographyTokens {
  heading_font: string;
  body_font: string;
  mono_font: string;
  base_font_size: number;
  scale_ratio: number;
  heading_sizes: Record<string, string>;
  body_text_size: string;
  small_text_size: string;
  muted_text_size: string;
  table_text_size: string;
  button_text_size: string;
  label_text_size: string;
  font_weights: Record<string, string>;
  line_heights: Record<string, string>;
  letter_spacings: Record<string, string>;
  preset_name: string;
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
  page_padding: string;
  section_gap: string;
  card_padding: string;
  form_gap: string;
  table_cell_padding: string;
  sidebar_width: string;
  topbar_height: string;
  modal_width: string;
  dashboard_grid_gap: string;
  preset_name: string;
}

export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  pill: string;
}

export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  card: string;
  modal: string;
  dropdown: string;
  button: string;
  focus_ring: string;
}

export interface IconSettings {
  library: string;
  default_size: string;
  sidebar_size: string;
  button_size: string;
  table_action_size: string;
  stroke_width: string;
  colour_behaviour: string;
  mappings: Record<string, string>;
}

export interface MotionTokens {
  enabled: boolean;
  global_speed: string;
  button_hover: string;
  button_press: string;
  card_hover: string;
  modal_animation: string;
  sidebar_animation: string;
  page_transition: string;
  alert_animation: string;
  loading_animation: string;
  duration_fast: string;
  duration_normal: string;
  duration_slow: string;
  ease_standard: string;
  ease_emphasised: string;
  ease_bounce: string;
}

export interface ComponentStyles {
  styles: Record<string, string>;
}

export interface ThemeDetail {
  theme: Theme;
  colour_tokens: ColorTokens;
  typography_tokens: TypographyTokens;
  spacing_tokens: SpacingTokens;
  radius_tokens: RadiusTokens;
  shadow_tokens: ShadowTokens;
  icon_settings: IconSettings;
  motion_tokens: MotionTokens;
  component_styles: ComponentStyles;
}

export interface ExportLog {
  id: number;
  theme_id: number;
  theme_name: string;
  export_type: string;
  exported_at: string;
}
