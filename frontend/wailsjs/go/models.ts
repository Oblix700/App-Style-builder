export namespace main {
	
	export class ColorTokens {
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
	
	    static createFrom(source: any = {}) {
	        return new ColorTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.base_hue = source["base_hue"];
	        this.chroma = source["chroma"];
	        this.warm_cool = source["warm_cool"];
	        this.neutral_vivid = source["neutral_vivid"];
	        this.lightness = source["lightness"];
	        this.shadow_colorize = source["shadow_colorize"];
	        this.shadow_intensity = source["shadow_intensity"];
	        this.highlight_opacity = source["highlight_opacity"];
	        this.glass_enabled = source["glass_enabled"];
	        this.glass_blur = source["glass_blur"];
	        this.glass_opacity = source["glass_opacity"];
	        this.harmony = source["harmony"];
	        this.overrides = source["overrides"];
	    }
	}
	export class ComponentStyles {
	    styles: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new ComponentStyles(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.styles = source["styles"];
	    }
	}
	export class ExportLog {
	    id: number;
	    theme_id: number;
	    theme_name: string;
	    export_type: string;
	    exported_at: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.theme_id = source["theme_id"];
	        this.theme_name = source["theme_name"];
	        this.export_type = source["export_type"];
	        this.exported_at = source["exported_at"];
	    }
	}
	export class IconSettings {
	    library: string;
	    default_size: string;
	    sidebar_size: string;
	    button_size: string;
	    table_action_size: string;
	    stroke_width: string;
	    colour_behaviour: string;
	    mappings: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new IconSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.library = source["library"];
	        this.default_size = source["default_size"];
	        this.sidebar_size = source["sidebar_size"];
	        this.button_size = source["button_size"];
	        this.table_action_size = source["table_action_size"];
	        this.stroke_width = source["stroke_width"];
	        this.colour_behaviour = source["colour_behaviour"];
	        this.mappings = source["mappings"];
	    }
	}
	export class MotionTokens {
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
	
	    static createFrom(source: any = {}) {
	        return new MotionTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.global_speed = source["global_speed"];
	        this.button_hover = source["button_hover"];
	        this.button_press = source["button_press"];
	        this.card_hover = source["card_hover"];
	        this.modal_animation = source["modal_animation"];
	        this.sidebar_animation = source["sidebar_animation"];
	        this.page_transition = source["page_transition"];
	        this.alert_animation = source["alert_animation"];
	        this.loading_animation = source["loading_animation"];
	        this.duration_fast = source["duration_fast"];
	        this.duration_normal = source["duration_normal"];
	        this.duration_slow = source["duration_slow"];
	        this.ease_standard = source["ease_standard"];
	        this.ease_emphasised = source["ease_emphasised"];
	        this.ease_bounce = source["ease_bounce"];
	    }
	}
	export class RadiusTokens {
	    none: string;
	    sm: string;
	    md: string;
	    lg: string;
	    xl: string;
	    pill: string;
	
	    static createFrom(source: any = {}) {
	        return new RadiusTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.none = source["none"];
	        this.sm = source["sm"];
	        this.md = source["md"];
	        this.lg = source["lg"];
	        this.xl = source["xl"];
	        this.pill = source["pill"];
	    }
	}
	export class ShadowTokens {
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
	
	    static createFrom(source: any = {}) {
	        return new ShadowTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.none = source["none"];
	        this.sm = source["sm"];
	        this.md = source["md"];
	        this.lg = source["lg"];
	        this.xl = source["xl"];
	        this.card = source["card"];
	        this.modal = source["modal"];
	        this.dropdown = source["dropdown"];
	        this.button = source["button"];
	        this.focus_ring = source["focus_ring"];
	    }
	}
	export class SpacingTokens {
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
	
	    static createFrom(source: any = {}) {
	        return new SpacingTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.xs = source["xs"];
	        this.sm = source["sm"];
	        this.md = source["md"];
	        this.lg = source["lg"];
	        this.xl = source["xl"];
	        this.xxl = source["xxl"];
	        this.xxxl = source["xxxl"];
	        this.page_padding = source["page_padding"];
	        this.section_gap = source["section_gap"];
	        this.card_padding = source["card_padding"];
	        this.form_gap = source["form_gap"];
	        this.table_cell_padding = source["table_cell_padding"];
	        this.sidebar_width = source["sidebar_width"];
	        this.topbar_height = source["topbar_height"];
	        this.modal_width = source["modal_width"];
	        this.dashboard_grid_gap = source["dashboard_grid_gap"];
	        this.preset_name = source["preset_name"];
	    }
	}
	export class Theme {
	    id: number;
	    name: string;
	    app_type: string;
	    style_mood: string;
	    default_mode: string;
	    density: string;
	    border_style: string;
	    component_style: string;
	    ui_mode: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Theme(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.app_type = source["app_type"];
	        this.style_mood = source["style_mood"];
	        this.default_mode = source["default_mode"];
	        this.density = source["density"];
	        this.border_style = source["border_style"];
	        this.component_style = source["component_style"];
	        this.ui_mode = source["ui_mode"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class TypographyTokens {
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
	
	    static createFrom(source: any = {}) {
	        return new TypographyTokens(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.heading_font = source["heading_font"];
	        this.body_font = source["body_font"];
	        this.mono_font = source["mono_font"];
	        this.base_font_size = source["base_font_size"];
	        this.scale_ratio = source["scale_ratio"];
	        this.heading_sizes = source["heading_sizes"];
	        this.body_text_size = source["body_text_size"];
	        this.small_text_size = source["small_text_size"];
	        this.muted_text_size = source["muted_text_size"];
	        this.table_text_size = source["table_text_size"];
	        this.button_text_size = source["button_text_size"];
	        this.label_text_size = source["label_text_size"];
	        this.font_weights = source["font_weights"];
	        this.line_heights = source["line_heights"];
	        this.letter_spacings = source["letter_spacings"];
	        this.preset_name = source["preset_name"];
	    }
	}
	export class ThemeDetail {
	    theme: Theme;
	    colour_tokens: ColorTokens;
	    typography_tokens: TypographyTokens;
	    spacing_tokens: SpacingTokens;
	    radius_tokens: RadiusTokens;
	    shadow_tokens: ShadowTokens;
	    icon_settings: IconSettings;
	    motion_tokens: MotionTokens;
	    component_styles: ComponentStyles;
	
	    static createFrom(source: any = {}) {
	        return new ThemeDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = this.convertValues(source["theme"], Theme);
	        this.colour_tokens = this.convertValues(source["colour_tokens"], ColorTokens);
	        this.typography_tokens = this.convertValues(source["typography_tokens"], TypographyTokens);
	        this.spacing_tokens = this.convertValues(source["spacing_tokens"], SpacingTokens);
	        this.radius_tokens = this.convertValues(source["radius_tokens"], RadiusTokens);
	        this.shadow_tokens = this.convertValues(source["shadow_tokens"], ShadowTokens);
	        this.icon_settings = this.convertValues(source["icon_settings"], IconSettings);
	        this.motion_tokens = this.convertValues(source["motion_tokens"], MotionTokens);
	        this.component_styles = this.convertValues(source["component_styles"], ComponentStyles);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

