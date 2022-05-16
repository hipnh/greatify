/**
 * Lightbox Themibox module
 */
;
(function ($,document,Themify) {
    'use strict';
    const Themibox = {
        topOffset: '50%',
		isFrameLoading:false,
		lightboxOpen:false,
        doOnOrientationChange() {
            if (Themibox.lightboxOpen) {
                setTimeout(function () {
                    Themibox.topOffset = window.scrollTop;
                    $("#post-lightbox-wrap").animate({top: Themibox.topOffset}, 300);
                }, 300);
            }
        },
		addToBasket(){
			const wrap=document.createElement('div'),
				header=document.createElement('h3'),
				close=document.createElement('a'),
				checkout=document.createElement('a');
				wrap.className='tf_textc lightbox-added';
				header.textContent=themifyScript.lng.add_to;
				close.className='button outline';
				close.href='#';
				close.textContent=themifyScript.lng.keep_shop;
				close.addEventListener('click', this.closeLightBox,{once:true});
				checkout.href=themifyScript.checkout_url;
				checkout.className='button checkout';
				checkout.textContent=themifyScript.lng.checkout;
				wrap.appendChild(header);
				wrap.appendChild(close);
				wrap.appendChild(checkout);
				return wrap;
		},
        init() {
                            const f=document.createDocumentFragment(),
				$body = Themify.body,
				wrap=document.createElement('div'),
				pattern = document.createElement('div'),
				container =document.createElement('div'),
				close = document.createElement('a');
				wrap.id='post-lightbox-wrap';
				wrap.className='tf_hide tf_scrollbar';
                pattern.id='pattern';
                pattern.className='tf_hide tf_w tf_h';
				container.id='post-lightbox-container';
				container.className='tf_box tf_w tf_overflow';
				close.className='close-lightbox';
				close.href='#';
				pattern.addEventListener('click', this.closeLightBox);
				close.addEventListener('click', this.closeLightBox);
				wrap.appendChild(close);
				wrap.appendChild(container);
				f.appendChild(wrap);
				f.appendChild(pattern);
				$body[0].appendChild(f);
				document.addEventListener('keyup', this.keyUp,{passive:true});
				if (Themify.isTouch) {
					window.addEventListener('orientationchange', this.doOnOrientationChange,{passive:true});
				}
				$body.on('click', '.themify-lightbox', this.clickLightBox)
				.on('added_to_cart', function () {
					if (Themibox.lightboxOpen) {
							$('#post-lightbox-wrap').addClass('lightbox-message');
							$('#post-lightbox-container').slideUp(400, function () {
								$(this).empty();
								this.appendChild(Themibox.addToBasket());
								$(this).slideDown();
							});
					}									
				});
        },
        clickLightBox(e) {
			e.preventDefault();
			
			if (Themibox.isFrameLoading) return false;
			let url = $(this).prop('href'),
				product = $(this).closest('.product,.slide-inner-wrap'),
                img = product.find('.product-image img,.post-image img'),
				container = $('#post-lightbox-container'),
				wrap = $("#post-lightbox-wrap"),
				width = 960,
				$body = Themify.body,
				item = product.find('.product-image,.post-image'),
				w;

			img = img.length ? img.prop( 'src' ) : $( this ).data( 'image' );
			img = typeof img !== 'undefined' ? img : themifyScript.placeholder;
			item = item.length ? item : $( this ).closest( '.type-product' );
			w = item.outerWidth( true ) < 180 ? item.outerWidth( true ) : 180;
			Themify.initWC(true);//start to load js files
            $('.themibox-clicked').removeClass('themibox-clicked');
            $(this).addClass('themibox-clicked');
            Themibox.isFrameLoading = true;
            $body.addClass('post-lightbox').css('overflow-y', 'hidden');
            wrap.hide().removeClass('lightbox-message').addClass('post-lightbox-prepare woocommerce');
            container.html('<div class="post-lightbox-iframe"><div class="post-lightbox-main-image"><img src="' + img + '"/></div></div>');
            wrap.css({'width': item.outerWidth(true), 'height': item.outerHeight(true), 'top': item.offset().top - $(window).scrollTop() + (item.outerHeight(true) / 2), 'left': item.offset().left - $(window).scrollLeft() + parseInt(item.outerWidth(true) / 2)}).
                    fadeIn().animate(
                    {
                        'width': w,
                        'top': '50%',
                        'left': '50%'
                    },
            'fast',
                    function () {
						if(!themify_vars.wc_js){
                    		url = Themify.UpdateQueryString('load_wc','1',url);
						}
                        $.ajax({
							url: Themify.UpdateQueryString('post_in_lightbox','1',url),
                            beforeSend: function () {
                                $('#pattern').hide().fadeIn(300);
                                container.addClass('post-lightbox-flip-infinite');
                            },
                            success: function (resp) {
                                let loaded = true;
                                Themify.imagesLoad($('<div class="post-lightbox-temp" id="post-lightbox-wrap"><div id="post-lightbox-container"><div class="post-lightbox-iframe">' + resp + '</div></div></div>').prependTo('body'),function () {
                                    const outherheight = $('#post-lightbox-wrap.post-lightbox-temp').outerHeight(true);
                                    $('#post-lightbox-wrap.post-lightbox-temp').remove();
									
									let pswp=document.getElementsByClassName('pswp')[0];
                                    container.children('.post-lightbox-iframe').append(resp);
                                    const share_wrap=container[0].getElementsByClassName('share-wrap');
                                    if(share_wrap.length>0 && Themify.cssLazy['theme_social_share'] === undefined){
                                        Themify.LoadCss(themify_vars.theme_url+'/styles/wc/modules/social-share.css', themify_vars.theme_v, document.getElementById('themify_concate-css').nextElementSibling, null, function () {
                                            Themify.fontAwesome(share_wrap[0]);
                                            Themify.cssLazy['theme_social_share'] = true;
                                        });

                                    }
									if(!pswp){
										pswp=container[0].getElementsByClassName('pswp')[0];
										if(pswp){
											Themify.body[0].prepend(pswp);
										}
									}
                                    container.one('animationiteration', function () {
                                        if (loaded) {
                                            loaded = false;
                                            $(this).removeClass('post-lightbox-flip-infinite');
                                            wrap.addClass('animate_start').animate({
                                                'width': width,
                                                'height': outherheight
                                            }, 'normal', function () {
                                                if (Themify.device==='mobile') {
                                                    Themibox.topOffset = $(window).scrollTop() + 10;
                                                }
                                                // also for the form should exit the lightbox
                                                Themibox.isFrameLoading = false; // update current status
                                                Themibox.lightboxOpen = true;
                                                $(this).removeClass('post-lightbox-prepare animate_start');
                                                Themify.trigger('themiboxloaded',this).initWC(true);
												if ( typeof ThemifyShoppeAjaxCart === 'function' ) {
													this.querySelector('form.cart').addEventListener('submit',ThemifyShoppeAjaxCart);
												}
                                            });
                                        }
                                    });

                                });
                            }
                        });

                    });
        },
        closeLightBox(e) {
            e.preventDefault();
            if (Themibox.lightboxOpen) {
                $('#pattern').fadeOut(300, function () {
                    const wrap = $("#post-lightbox-wrap"),
						 _callback=function(){
							$('.post-lightbox-iframe').empty();
							Themify.body.removeClass('post-lightbox').css('overflow-y', 'visible');
							Themify.trigger('themiboxclosed');
							Themibox.lightboxOpen = false;
						 };
                    if (wrap.hasClass('lightbox-message')) {
                        wrap.animate({
                            top: '150%'
                        }, 500, _callback);
                    }
                    else {

                        let item = $('.themibox-clicked').closest('.type-product,.slide-inner-wrap').find('.product-image,.post-image');

                            item = item.length ? item : $( '.themibox-clicked' ).closest( '.type-product' );

                        wrap.addClass('animate_start post-lightbox-prepare animate_closing').animate({
                            'width': item.outerWidth(true),
                            'height': item.outerHeight(true),
                        }, 'normal', function () {
                            $(this).find('#pagewrap').remove();
                            $(this).removeClass('animate_start animate_closing woocommerce').delay(100).animate({'top': item.offset().top - $(window).scrollTop() + (item.outerHeight(true) / 2), 'left': item.offset().left - $(window).scrollLeft() + parseInt(item.outerWidth(true) / 2)}, 'normal', function () {
                                $(this).fadeOut();
								_callback();
                            });
                        });
                    }
                });
            }
        },
        keyUp(e) {
            if (Themibox.lightboxOpen && e.keyCode === 27) {
                $('.close-lightbox').click();
            }
        }
    };
    Themify.on('themify_theme_themibox_run',function(){
		Themibox.init();
	},true);
})(jQuery,document,Themify);
