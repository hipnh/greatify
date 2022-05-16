<div class="header-icons">
    <div class="top-icon-wrap">
	<?php
	if ($show_menu_navigation === true) {
		add_filter( 'themify_menu_icon', 'themify_theme_menu_icon', 10, 4 );
	    themify_menu_nav(array(
			'theme_location' => 'icon-menu',
			'fallback_cb' => '',
			'container' => '',
			'menu_id' => 'icon-menu',
			'menu_class' => 'icon-menu'
	    ));
		remove_filter( 'themify_menu_icon', 'themify_theme_menu_icon' );
	}
	?>
	<?php if (themify_is_woocommerce_active()): ?>
	    <ul class="icon-menu">
		    <?php if (!themify_check('setting-exclude_wishlist', true) && Themify_Wishlist::is_enabled() && themify_theme_show_area('wishlist')) : ?>
			<li class="wishlist">
			    <a class="tools_button" href="https://greatify.live/wishlist/<?php //echo Themify_Wishlist::get_wishlist_page(); ?>">
				<em class="icon-heart"><?php echo themify_get_icon('heart','ti',false,false,array('aria-label'=>__('Whishlist','themify'))); ?></em>
				<span class="icon-menu-count wishlist_empty"></span>
				<span class="tooltip"><?php _e('Wishlist', 'themify') ?></span>
			    </a>
			</li>
		    <?php endif; ?>
		    <?php if ($show_cart === true) : ?>
			<?php $cart_is_dropdown = $cart_style === 'dropdown'; ?>
			<li id="cart-icon-count" class="<?php echo $total > 0 ? 'cart' : 'cart empty-cart'; ?>">
			    <a <?php if ($cart_is_dropdown === false && $cart_style !== 'link_to_cart'): ?>id="cart-link"<?php endif; ?> href="<?php echo $cart_is_dropdown === true || $cart_style === 'link_to_cart' ? wc_get_cart_url() : '#slide-cart'; ?>">
				<em class="icon-shopping-cart"><?php echo themify_get_icon('shopping-cart','ti',false,false,array('aria-label'=>__('Shopping Cart','themify'))); ?></em>
				<span class="icon-menu-count<?php if ($total <= 0): ?> cart_empty<?php endif; ?>"><?php echo $total; ?></span>
				<span class="tooltip"><?php _e('Cart', 'themify') ?></span>
			    </a>
			    <?php
			    if ($cart_is_dropdown === true) {
				themify_get_ecommerce_template('includes/shopdock');
			    }
			    ?>

			</li>
		    <?php endif; ?>
	    </ul>
	<?php endif; ?>
    </div>
    <?php if (themify_theme_show_area('search_button')) : ?>
        <a class="search-button tf_box" href="#"><?php echo themify_get_icon('search','ti',false,false,array('aria-label'=>__('Search','themify'))); ?><span class="screen-reader-text"><?php _e('Search','themify'); ?></span></a>
        <!-- /search-button -->
    <?php endif; ?>
</div>
