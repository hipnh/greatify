<?php
/**
 * Tooltip display
 *
 *
 * @package    Themify_Builder
 * @subpackage Themify_Builder/classes
 */

defined( 'ABSPATH' ) || exit;

class ThemifyBuilder_Tooltips {

	public static function init() {
		add_filter( 'themify_builder_column_lightbox_form_settings', [ __CLASS__, 'options' ] );
		add_filter( 'themify_builder_row_lightbox_form_settings', [ __CLASS__, 'options' ] );
		add_filter( 'themify_builder_module_lightbox_form_settings', [ __CLASS__, 'options' ] );
		add_filter( 'themify_builder_subrow_lightbox_form_settings', [ __CLASS__, 'options' ] );
		add_filter( 'themify_builder_background_styling', [ __CLASS__, 'display' ], 10, 4 );
	}

	static function options( $options ) {
		$tooltip = [
			'type' => 'tb_tooltip'
		];
		$options['setting']['options'] = array_merge( $options['setting']['options'], [ $tooltip ] );

		return $options;
	}

	public static function display( $builder_id, $options, $element_id, $type ) {
		if ( empty( $options['styling'] ) ) {
			return;
		}
		$options = $options['styling'];

		if ( ! empty( $options['_tooltip'] ) ) {
			$styles = [];
			if ( ! empty( $options['_tooltip_bg'] ) ) {
				$styles[] = 'background-color: ' . Themify_Builder_Stylesheet::get_rgba_color( $options['_tooltip_bg'] );
			}
			if ( ! empty( $options['_tooltip_c'] ) ) {
				$styles[] = 'color: ' . Themify_Builder_Stylesheet::get_rgba_color( $options['_tooltip_c'] );
			}
			echo '<div class="tb_tooltip tf_hide" style="' . join( ';', $styles ) . '">' . esc_html( $options['_tooltip'] ) . '</div>';
		}
	}
}
ThemifyBuilder_Tooltips::init();