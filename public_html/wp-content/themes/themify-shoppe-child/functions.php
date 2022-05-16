<?php

/* To enable child-theme-scripts.js file, remove the PHP comment below: */
/* remove this line

function custom_child_theme_scripts() {
	wp_enqueue_script( 'themify-child-theme-js', get_stylesheet_directory_uri() . '/child-theme-scripts.js', [ 'jquery' ], '1.0', true );
}
add_action( 'wp_enqueue_scripts', 'custom_child_theme_scripts' );

remove this line too */

/* Custom functions can be added below. */
add_filter('script_loader_tag', 'clean_script_tag');
  function clean_script_tag($input) {
  $input = str_replace("type='text/javascript' ", '', $input);
  return str_replace("'", '"', $input);
}