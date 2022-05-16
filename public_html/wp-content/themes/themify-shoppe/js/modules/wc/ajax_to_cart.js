/**
 * Ajax To cart module
 */
;
let ThemifyShoppeAjaxCart;
(function ($, Themify, themifyScript) {
    'use strict';
    // Ajax add to cart   
    let isWorking=false;
	const icons = Themify.body[0].querySelectorAll('#header .icon-shopping-cart');
    Themify.body.on('adding_to_cart', function (e, button, data) {
        Themify.trigger('themify_theme_spark', [$(button)]);
        for(let i=icons.length-1;i>-1;--i){
        	icons[i].className+=' tf_loader';
		}
    })
    .on('wc_fragments_loaded', function (e, fragments, cart_hash) {
        const cartButton = document.getElementById('cart-icon-count');
			if(cartButton!==null){
				this.classList.toggle('wc-cart-empty',cartButton.getElementsByClassName('cart_empty')[0]!==undefined);
			}
    })
	.on('added_to_cart', function (e) {
		for(let i=icons.length-1;i>-1;--i){
			icons[i].classList.remove('tf_loader');
		}
		let shopping_cart = Themify.body[0].querySelector('.cart .icon-shopping-cart');
		if ( shopping_cart ) {
			shopping_cart.classList.remove('tf_loader');
		}
		if(themifyScript.ajaxCartSeconds && isWorking===false && !this.classList.contains('post-lightbox')){
			isWorking=true;
			let seconds=parseInt(themifyScript.ajaxCartSeconds);
			if(!Themify.body[0].classList.contains('cart-style-dropdown')){
				const id=Themify.isTouch?'cart-link-mobile-link':'cart-link',
				el=document.getElementById(id);
				if(el!==null){
					const panelId=el.getAttribute('href'),
						panel=document.getElementById(panelId.replace('#',''));
					if(panel!==null){
						Themify.on('sidemenushow.themify', function(panel_id, side,_this){
							if(panelId===panel_id){
								setTimeout(function () {
									if($(panel).is(':hover')){
										panel.addEventListener('mouseleave',function(){
											_this.hidePanel();
											Themify.body[0].classList.remove('tf_auto_cart_open');
										},{once:true,passive:true});
									}else{
										_this.hidePanel();
										Themify.body[0].classList.remove('tf_auto_cart_open');
									}
									isWorking=false;
								},seconds);
							}
						},true);
						Themify.body[0].classList.add('tf_auto_cart_open');
						setTimeout(function(){
							el.click();
						},100);
					}
				}
			}
			else{
				const items=document.getElementsByClassName('shopdock');
				for(let i=items.length-1;i>-1;--i){
					items[i].parentNode.classList.add('show_cart');
					setTimeout(function () {
						items[i].parentNode.classList.remove('show_cart');
						isWorking=false;
					},seconds);
				}
			}
		
		}
	});
    // remove item ajax
	if ( typeof wc_add_to_cart_params !== 'undefined' ) {
		Themify.body.on('click', '.remove_from_cart_button', function(e){
			e.preventDefault();
			this.classList.remove('tf_close');
			this.classList.add('tf_loader');
		});
	}
	ThemifyShoppeAjaxCart = function(e){
		if (this.closest('.product-type-external')!==null) {
			return;
		}
		// WooCommerce Subscriptions plugin compatibility
		if (window.location.search.indexOf('switch-subscription') > -1)
			return this;

		e.preventDefault();

		const data = new FormData(this),
			btn = this.getElementsByClassName('single_add_to_cart_button')[0],
			add_to_cart = this.querySelector('[name="add-to-cart"]');
		if(add_to_cart.tagName!=='INPUT'){
			data.append('add-to-cart', add_to_cart.value);
		}
		if (btn) {
			btn.classList.remove('added');
			btn.classList.add('loading');
		}

		Themify.body.triggerHandler('adding_to_cart', [this.querySelector('[type="submit"]'), data]);
		fetch(woocommerce_params.wc_ajax_url.toString().replace( '%%endpoint%%', 'theme_add_to_cart' ), {
			method:'POST', headers:new Headers({
				'Accept':'application/json',
				'X-Requested-With':'XMLHttpRequest'
			}), body:data})
			.then(res => res.redirected || res.json())
			.then(response => {
				if (!response) {
					return;
				}
				if (themifyScript.redirect) {
					window.location.href = themifyScript.redirect;
					return;
				}
				const fragments = response.fragments,
					cart_hash = response.cart_hash;
				// Block fragments class
				if (fragments) {
					const keys = Object.keys(fragments);
					let els = null;
					for(let i = keys.length-1;i>-1;i--){
						els = document.querySelectorAll(keys[i]);
						for(let k = els.length-1;k>-1;k--){
							els[k].className += ' updating';
							els[k].outerHTML = fragments[keys[i]];
						}
					}
				}
				if(btn){
					btn.classList.remove('loading');
					btn.classList.add('added');
				}
				// Trigger event so themes can refresh other areas
				Themify.body.triggerHandler('added_to_cart', [fragments, cart_hash]);
			});
	}
	// Ajax add to cart in single page
	if (themifyScript.ajaxSingleCart) {
		const form = document.querySelector('form.cart');
		if(form){
			form.addEventListener('submit', ThemifyShoppeAjaxCart);
		}
	}

})(jQuery, Themify, themifyScript);
