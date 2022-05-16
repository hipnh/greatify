/**
 * Sticky Buy Button
 */
;
(function(Themify, $,document){
	'use strict';
	const _init = function(pr_wrap,wrap){
			const container = document.createElement('div'),
				product = document.createElement('div'),
				img_wrap = document.createElement('div'),
				summary = document.createElement('div'),
				pr_form = pr_wrap.querySelector('form.cart'),
				pr_title = !pr_wrap.classList.contains('tbp_template')?pr_wrap.querySelector('.product_title'):pr_wrap.querySelector('.module-product-title .tbp_title'),
				pr_price = pr_wrap.getElementsByClassName('price')[0],
				pr_image = pr_wrap.getElementsByClassName('woocommerce-product-gallery__image')[0],
				ind = document.getElementById('tf_sticky_form_wrap');
			container.className = 'tf_box pagewidth clearfix';
			product.id = pr_wrap.id;
			product.className = pr_wrap.classList;
			//wrap image
			img_wrap.className = 'tf_sticky_prod_img';
			// Image
			if(pr_image!==undefined){
				const gallery = document.createElement('div');
				gallery.className = 'images';
				gallery.appendChild(pr_image.cloneNode(true));
				img_wrap.appendChild(gallery);
			}
			summary.className = 'summary entry-summary';
			// Title
			if(pr_title!==null){
				summary.appendChild(pr_title.cloneNode(true));
			}
			// Price
			if(pr_price!==undefined){
				summary.appendChild(pr_price.cloneNode(true));
			}
			img_wrap.appendChild(summary);
			product.appendChild(img_wrap);
			// Form
			ind.style.height = pr_form.getBoundingClientRect().height+'px';
			product.appendChild(pr_form);
			container.appendChild(product);
			wrap.appendChild(container);
			_pw_padding(pr_wrap.classList.contains('tbp_template')?pr_wrap:document.getElementById('pagewrap'),wrap,'show');
		},
		_pw_padding = function(wrap,el,act){
			wrap.style.paddingBottom = act==='show'?el.getBoundingClientRect().height + 'px':'';
		},
		_move_form = function(wrap,el, act){
			const obs_el = document.getElementById('tf_sticky_form_wrap'),
				form = 'hide' === act ? el.querySelector('form.cart') : document.querySelector('form.cart'),
				$var_form = $('.variations_form');
			if(!form){
				return;
			}
			if('hide' === act){
				obs_el.appendChild(form);
				obs_el.style.height = '';
			}else{
				obs_el.style.height = form.getBoundingClientRect().height+'px';
				el.getElementsByClassName('product')[0].appendChild(form);
			}
			if($var_form.length>0){
				$var_form.trigger( 'check_variations' );
			}
			_pw_padding(wrap,el,act);
		};
	Themify.on('tf_sticky_buy_init', function(pr_wrap,el){
		const wrap=pr_wrap.classList.contains('tbp_template')?pr_wrap:document.getElementById('pagewrap');
		Themify.on('tfsmartresize', function(){
			_pw_padding(wrap,el,(el.classList.contains('tf_st_show')?'show':'hide'));
		});
		_init(pr_wrap,el);
		const observer = new window['IntersectionObserver'](function (entries) {
			if (!entries[0].isIntersecting && entries[0].boundingClientRect.top<0) {
				_move_form(wrap,el,'show');
				el.classList.add('tf_st_show');
			} else {
				_move_form(wrap,el,'hide');
				el.classList.remove('tf_st_show');
			}
		});
		observer.observe(document.getElementById('tf_sticky_buy_observer'));
	},true);
})(Themify, jQuery,document);