/**
 * Module Product Gallery
 */
;
(function($,document,Themify){
    'use strict';
	let isFormInit=null;
	const zoomInit=function(item){
		const items=item.getElementsByClassName('zoom');
		for(let i=items.length-1;i>-1;--i){
			items[i].addEventListener('click',function(e){
				if(!this.hasAttribute('data-zoom-init')){
					this.setAttribute('data-zoom-init',true);
					const el=this;
					Themify.LoadAsync(themify_vars.theme_url + '/js/modules/wc/zoom.js', function(){
						Themify.jsLazy['theme_product_zoom']=true;
						Themify.trigger('themify_theme_product_zoom',[el,e]);
					}, themify_vars.theme_v, null, function () {
						return !!Themify.jsLazy['theme_product_zoom'];
					});
					}
			});
		}
	},
	init=function(item) {
		const items=item.getElementsByClassName('tf_swiper-container'),
			main=items[0],
			thumbs=items[1];
		setTimeout(function(){
			zoomInit(main);
		},800);
		if(main.getElementsByClassName('tf_swiper-slide').length<=1){
			main.classList.add('tf_swiper-container-initialized');
			main.classList.remove('tf_hidden');
			Themify.lazyScroll(main.querySelectorAll('[data-lazy]'),true);
			if(thumbs){
				thumbs.classList.add('tf_swiper-container-initialized');
				thumbs.classList.remove('tf_swiper-container-initialized');
				Themify.lazyScroll(thumbs.querySelectorAll('[data-lazy]'),true);
			}
			return;
		}
		Themify.imagesLoad(thumbs,function (instance) {
			Themify.InitCarousel(instance.elements[0],{
				direction: 'vertical',
				visible: 'auto',
				height:'auto',
				wrapvar:false
			});
		});
		Themify.imagesLoad(main,function (instance) {
		Themify.InitCarousel(instance.elements[0],{
			slider_nav:false,
			pager:false,
			wrapvar:false,
			height:'auto',
			thumbs:thumbs,
			onInit(){
							/* when using Product Image module in Builder Pro, use the closest Row as the container */
							const container = this.el.closest( '.module-product-image' ) ? this.el.closest( '.themify_builder_row' ) : this.el.closest( '.product' );
							const form = isFormInit===null ? container.getElementsByClassName('variations_form')[0] : null;
							if(form){
								const _this=this;
								let isInit=null;
								// Variation zoom carousel fix for Additional Variation Images by WooCommerce Addon
								if (typeof wc_additional_variation_images_local === 'object') {
									isFormInit=true;
									$(form).on('wc_additional_variation_images_frontend_image_swap_callback', function (e,response) {
										if(isInit===true){
											const tmp=document.createElement('div');
											tmp.innerHTML=response.main_images;
											Themify.LoadAsync(themify_vars.theme_url + '/js/modules/wc/additional_variations_images.js', function(){
												Themify.jsLazy['theme_product_additional_variations']=true;
												galleryThumbs.destroy(true,true);
												_this.destroy(true,true);
												Themify.trigger('themify_theme_additional_variations_images_init',[tmp.getElementsByClassName('woocommerce-product-gallery__image'),main,thumbs]);
										
											},
											themify_vars.theme_v,null,function(){
												return !!Themify.jsLazy['theme_product_additional_variations'];
											});
										}
									}).on('found_variation hide_variation',function (e) {
										if(e.type==='hide_variation'){
											if(isInit===true){
												$(this).off('hide_variation');
											}
										}
										else{
											isInit=true;
										}
									});
								}
								else{
								
									const mainImage= this.el.getElementsByTagName('img')[0],
									thumbImage=thumbs.getElementsByTagName('img')[0],
										cloneMain=mainImage.cloneNode(false),
										cloneThumb=thumbImage.cloneNode(false),
										zoomUrl=mainImage.parentNode.getAttribute('data-zoom-image');
									$(form).on('found_variation',function (e, v) {
											Themify.LoadCss(themify_vars.theme_url+'/styles/wc/modules/reset-variations.css',themify_vars.theme_v);
											const images=v.image;
											if (typeof images.full_src === 'string') {
												isInit=true;
												const zoomed=mainImage.closest('.zoom');
												if(zoomed){
													$(zoomed).trigger('zoom.destroy')[0].removeAttribute('data-zoom-init');
													zoomed.setAttribute('data-zoom-image',images.full_src);
												}
												mainImage.setAttribute('src',(images.src?images.src:images.full_src))
												mainImage.setAttribute('srcset',(images.srcset?images.srcset:''));
												thumbImage.setAttribute('src',images.gallery_thumbnail_src);
												_this.slideTo(0, _this.params.speed);
											}
									})
									.on('hide_variation',function(){
										if(isInit===true){
											mainImage.setAttribute('src',(cloneMain.hasAttribute('src')?cloneMain.getAttribute('src'):''))
											mainImage.setAttribute('srcset',(cloneMain.hasAttribute('srcset')?cloneMain.getAttribute('srcset'):''));
											thumbImage.setAttribute('src',(cloneThumb.hasAttribute('src')?cloneThumb.getAttribute('src'):''));
											const zoomed=mainImage.closest('.zoom');
											if(zoomed){
												$(zoomed).trigger('zoom.destroy')[0].removeAttribute('data-zoom-init');
												zoomed.setAttribute('data-zoom-image',zoomUrl);
											}
											_this.slideTo(0, _this.params.speed);
											isInit=null;
										}
									});
								}
								Themify.initWC(true);
							}
			}
		});
	});
    };
    Themify.on('themify_theme_product_single_slider',function(item){
		init(item);
    });
	
})(jQuery,document,Themify);
