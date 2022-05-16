;
(function ($, Themify, window, document, themify_vars, themifyScript) {
    'use strict';
    const svgs = {},
        ThemifyShop = {
                v: null,
                url: null,
                js_url: null,
                css_url: null,
                bodyCl: null,
                init(ThemifyTheme) {
                    this.v = ThemifyTheme.v;
                    this.url = ThemifyTheme.url;
                    this.js_url = this.url + 'js/modules/wc/';
                    this.css_url = this.url + 'styles/wc/modules/';
                    this.bodyCl = ThemifyTheme.bodyCl;
                    this.sideMenu();
                    this.wcAjaxInit();
                    this.events();
                    this.initProductSlider();
                    this.initWishlist();
                    setTimeout(this.clicks.bind(this), 1000);
                    setTimeout(this.initThemibox.bind(this), 1000);
                    if (this.bodyCl.contains('single-product')) {
                        this.singleProductSlider();
                        setTimeout(this.plusMinus,800);
                    }
					this.pluginCompatibility();
                },
                events() {
                    const self = this;
                    Themify.body
                            .on('infiniteloaded.themify', this.initProductSlider.bind(this))
                            .on('keyup', 'input.qty', function () {
                                const el = $(this),
                                        max_qty = parseInt(el.attr('max'), 10);
                                if (el.val() > max_qty) {
                                    el.val(max_qty);
                                }
                            });
                    Themify
                            .on('themify_theme_spark', function (item, options) {
                                self.clickToSpark(item, options);
                            })
                            .on('themiboxloaded', function (container) {
                                if ($.fn.prettyPhoto) {
                                    // Run WooCommerce PrettyPhoto after Themibox is loaded
                                    $(".thumbnails a[data-rel^='prettyPhoto']",container).prettyPhoto({
                                        hook: 'data-rel',
                                        social_tools: false,
                                        theme: 'pp_woocommerce',
                                        horizontal_padding: 20,
                                        opacity: 0.8,
                                        deeplinking: false
                                    });
                                } else {
                                    self.singleProductSlider(container);
                                    self.plusMinus(container);
                                }
                            });
                },
                clickToSpark(item, options) {
                    if (themifyScript['sparkling_color'] !== undefined) {
                        if (!options) {
                            options = {};
                        }
                        if (!options['text']) {
                            options['text'] = 'ti-shopping-cart';
                        }
						let isWorking=false;
                        const path = this.url + 'images/' + options['text'] + '.svg',
                                callback = function () {
                                    if (!isWorking && window['clickSpark'] && svgs[path]) {
                                    isWorking=true;
                                        options = $.extend({
                                            duration: 300,
                                            count: 30,
                                            speed: 8,
                                            type: 'splash',
                                            rotation: 0,
                                            size:10
                                        }, options);
                                        clickSpark.setParticleImagePath(svgs[path]);
                                        clickSpark.setParticleDuration(options['duration']);
                                        clickSpark.setParticleCount(options['count']);
                                        clickSpark.setParticleSpeed(options['speed']);
                                        clickSpark.setAnimationType(options['type']);
                                        clickSpark.setParticleRotationSpeed(options['rotation']);
                                        clickSpark.setParticleSize(options['size']);
                                        clickSpark.fireParticles(item);
                                    }
                                },
								getImage = function() {
									if (svgs[path]) {
										callback();
									} else {
										fetch(path)
											.then(r => r.text())
											.then(text => {
												const color = themifyScript.sparkling_color;
												if (color !== '#dcaa2e') {
													text = text.replace('#dcaa2e', color);
												}
												svgs[path] = 'data:image/svg+xml;base64,' + window.btoa(text);
												callback();
											});
									}
								};
						if (window['clickSpark'] !== undefined) {
							getImage();
						} else {
							Themify.LoadAsync(this.js_url + 'clickspark.min.js', getImage, '1.0', null, function () {
								return !!window['clickSpark'];
							});
						}
                    }
                },
                initWishlist() {
                    if (themifyScript['wishlist'] !== undefined) {
                        const self = this,
                            getCookie= function () {
                                const cookie = ' ' + document.cookie,
                                    search = ' ' + themifyScript['wishlist'].cookie + '=',
                                    setStr = [];
                                if (cookie.length > 0) {
                                    let offset = cookie.indexOf(search);
                                    if (offset !== -1) {
                                        offset += search.length;
                                        let end = cookie.indexOf(';', offset);
                                        if (end === -1) {
                                            end = cookie.length;
                                        }
                                        const arr = JSON.parse(unescape(cookie.substring(offset, end)));
                                        for (let x in arr) {
                                            setStr.push(arr[x]);
                                        }
                                    }
                                }
                                return setStr;
                            };
                        setTimeout(function(){
                            // Assign/Reassign wishlist buttons based on cookie
                            const wb=document.getElementsByClassName('wishlist-button'),
                                cookies = getCookie();
                            for(let k=wb.length-1;k>-1;k--){
                                if ($.inArray(parseInt(wb[k].dataset.id), cookies) === -1) {
                                    wb[k].classList.remove('wishlisted');
                                }else{
                                    wb[k].classList.add('wishlisted');
                                }
                            }
                            // Update wishlist count
                            const icon = document.querySelector('.wishlist .icon-menu-count'),
                                total = cookies.length;
                            if(icon){
                                if (total > 0) {
                                    icon.classList.remove('wishlist_empty');
                                }else {
                                    icon.classList.add('wishlist_empty');
                                }
                                icon.textContent=total;
                            }
                        },1500);
                        if (self.bodyCl.contains('wishlist-page')) {
                            $.ajax({
                                url: themify_vars.ajax_url,
                                data : {
                                    action : "themify_load_wishlist_page"
                                },
                                success: function (resp) {
                                    if (resp) {
                                        document.getElementsByClassName('page-content')[0].insertAdjacentHTML('beforeend', resp);
                                    }
                                }
                            });
                        }
                        Themify.body.on('click.tf_wishlist', '.wishlisted,.wishlist-button', function (e) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            const el = $(this);
                            Themify.LoadAsync(self.js_url + 'themify.wishlist.js', function () {
                                Themify.body.off('click.tf_wishlist');
                                el.click();
                            }, self.v);
                        });
                    }
                },
                singleProductSlider(container) {
					if(!container){
						container=document;
					}
                    const items = container.getElementsByClassName('woocommerce-product-gallery__wrapper')[0];
                    if (items && items.getElementsByClassName('tf_swiper-container')[0]) {
                        const checkLoad = function () {
                            if (Themify.jsLazy['theme_single_slider_js'] === true && Themify.cssLazy['theme_single_slider_css'] === true && Themify.cssLazy['theme_swiper_css'] === true && window['TF_Swiper']) {
                              Themify.trigger('themify_theme_product_single_slider', items);
                            }
                        };
                        if (!Themify.cssLazy['theme_swiper_css']) {
                            Themify.LoadCss(Themify.css_modules.sw, null, null, null, function () {
                                Themify.cssLazy['theme_swiper_css'] = true;
                                checkLoad();
                            });
                        }
                        if (!Themify.cssLazy['theme_single_slider_css']) {
                            Themify.LoadCss(this.css_url + 'single/slider.css', this.v, null, null, function () {
                                Themify.cssLazy['theme_single_slider_css'] = true;
                                checkLoad();
                            });
                        }
                        if (!window['TF_Swiper']) {
                            Themify.LoadAsync(Themify.js_modules.sw, function () {
                                checkLoad();
                            },
                                    themify_vars['s_v'],
                                    null,
                                    function () {
                                        return undefined !== window['TF_Swiper'];
                                    });
                        }
                        if (!Themify.jsLazy['theme_single_slider_js']) {
                            Themify.LoadAsync(this.js_url + 'single-slider.js', function () {
                                Themify.jsLazy['theme_single_slider_js'] = true;
                                checkLoad();
                            },
                                    this.v,
                                    null,
                                    function () {
                                        return !!Themify.jsLazy['theme_single_slider_js'];
                                    });
                        }
                        checkLoad();
                    }
                },
                plusMinus(el){
                    el = el?el:Themify.body[0];
                    const items=el.querySelectorAll('#minus1,#add1');
                    for(let i=items.length-1;i>-1;--i){
                        items[i].addEventListener('click',function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            const input=this.closest('form').getElementsByClassName('qty')[0];
                            if(input){
                                let v=(input.value)*1;
                                const min=parseInt(input.min),
                                    step=input.step>0?parseInt(input.step):1,
                                    max=parseInt(input.max);
                                v-=(this.id==='minus1'?step:-1*(step));
                                if(v<min){
                                    v=min;
                                }else if(!isNaN(max) && v>max){
                                    v=max;
                                }
                                input.value=v;
                            }
                        });
                    }
            },
                initProductSlider() {
                    if (!this.bodyCl.contains('wishlist-page')) {
                        const items = document.getElementsByClassName('product-slider'),
                                events = ['mouseover'],
                                self = this,
                                checkLoad = function (el) {
                                    if (Themify.jsLazy['theme_slider'] === true && window['TF_Swiper'] && Themify.cssLazy['theme_swiper_css'] === true && Themify.cssLazy['theme_slider_css'] === true) {
                                        Themify.trigger('themify_theme_product_slider', [el]);
                                    }
                                };
                        if (Themify.isTouch) {
                            events.push('touchstart');
                        }
                        for (let i = items.length - 1; i > -1; --i) {
                            if (items[i].hasAttribute('data-product-slider') && !items[i].classList.contains('slider_attached') && !items[i].classList.contains('hovered')) {
                                items[i].className += ' slider_attached';
                                for (let j = events.length - 1; j > -1; --j) {
                                    items[i].addEventListener(events[j], function () {
                                        if (!this.classList.contains('hovered')) {
                                            let _this = this;
                                            this.classList.add('hovered');
                                            if (!Themify.cssLazy['theme_slider_css']) {
                                                Themify.LoadCss(self.css_url + 'slider.css', self.v, document.getElementById('themify_concate-css').nextElementSibling, null, function () {
                                                    Themify.cssLazy['theme_slider_css'] = true;
                                                    checkLoad(_this);
                                                });
                                            }
                                            if (!Themify.cssLazy['theme_swiper_css']) {
                                                Themify.LoadCss(Themify.css_modules.sw, null, null, null, function () {
                                                    Themify.cssLazy['theme_swiper_css'] = true;
                                                    checkLoad(_this);
                                                });
                                            }
                                            if (!window['TF_Swiper']) {
                                                Themify.LoadAsync(Themify.js_modules.sw, function () {
                                                    checkLoad(_this);
                                                },
                                                        themify_vars['s_v'],
                                                        null,
                                                        function () {
                                                            return undefined !== window['TF_Swiper'];
                                                        });
                                            }
                                            if (!Themify.jsLazy['theme_slider']) {
                                                Themify.LoadAsync(self.js_url + 'slider.js', function () {
                                                    Themify.jsLazy['theme_slider'] = true;
                                                    checkLoad(_this);
                                                },
                                                        self.v,
                                                        null,
                                                        function () {
                                                            return !!Themify.jsLazy['theme_slider'];
                                                        });
                                            }
                                            checkLoad(_this);
                                        }
                                    }, {passive: true, once: true});
                                }
                            }
                        }
                        Themify.on('infiniteloaded.themify', this.initProductSlider.bind(this), true);
                    }
                },
                initThemibox() {
                    if (Themify.jsLazy['theme_quick_look'] === undefined) {
                        const self = this;
                        Themify.body.one('click', '.themify-lightbox', function (e) {
                            e.preventDefault();
                            if (!Themify.jsLazy['theme_quick_look']) {
                                Themify.jsLazy['theme_quick_look'] = true;
                                const loaded = {},
                                    _this = this,
                                    checkLoad = function () {
                                        if (loaded['theme_single'] === true && loaded['themibox'] === true && loaded['theme_lightbox'] === true && loaded['theme_breadcrumb'] === true) {
                                            _this.click();
                                        }
                                    };
                                Themify.cssLazy['theme_social_share'] = Themify.body[0].getElementsByClassName('share-wrap').length>0?true:undefined;
								if(!self.bodyCl.contains('product-single')){
									Themify.LoadCss(self.css_url + 'single/product.css', self.v, document.getElementById('themify_concate-css').nextElementSibling , null, function () {
										loaded['theme_single'] = true;
										checkLoad();
									});
								}
								else{
									loaded['theme_single'] = true;
								}
                                Themify.LoadCss(self.css_url + 'lightbox.css', self.v, null, null, function () {
                                    loaded['theme_lightbox'] = true;
                                    checkLoad();
                                });
                                if(document.getElementsByClassName('woocommerce-breadcrumb').length===0){
                                    Themify.LoadCss(self.css_url + 'breadcrumb.css', self.v, document.getElementById('themify_concate-css').nextElementSibling, null, function () {
                                        loaded['theme_breadcrumb'] = true;
                                        checkLoad();
                                    });
                                }else{
                                    loaded['theme_breadcrumb'] = true;
                                    checkLoad();
                                }
                                Themify.LoadAsync(self.js_url + 'themibox.js', function () {
                                    loaded['themibox'] = true;
                                    Themify.trigger('themify_theme_themibox_run');
                                    checkLoad();
                                },
								self.v);
                            }
                        });
                    }
                },
                clicks() {
                    // reply review
                    let items = document.getElementsByClassName('reply-review');
                    for (let i = items.length - 1; i > -1; --i) {
                        items[i].addEventListener('click', function (e) {
                            e.preventDefault();
                            $('#respond').slideToggle('slow');
                        });
                    }
                    // add review
                    items = document.getElementsByClassName('add-reply-js');
                    for (let i = items.length - 1; i > -1; --i) {
                        items[i].addEventListener('click', function (e) {
                            e.preventDefault();
                            $(this).hide();
                            $('#respond').slideDown('slow');
                            $('#cancel-comment-reply-link').show();
                        });
                    }
                    items = document.getElementById('cancel-comment-reply-link');
                    if (items !== null) {
                        items.addEventListener('click', function (e) {
                            e.preventDefault();
                            $(this).hide();
                            $('#respond').slideUp();
                            $('.add-reply-js').show();
                        });
                    }
                },
                wcAjaxInit() {
                    if (typeof wc_add_to_cart_params !== 'undefined') {
                        Themify.LoadAsync(this.js_url + 'ajax_to_cart.js', null, this.v);
                    }
                },
                sideMenu() {
                    if (null === document.getElementById('slide-cart')) {
                        return;
                    }
                    const self = this;
                    let isLoad = false;
                    Themify.sideMenu(document.querySelectorAll('#cart-link,#cart-link-mobile-link'), {
                        panel: '#slide-cart',
                        close: '#cart-icon-close',
                        beforeShow(settings) {
                            if (isLoad === false) {
                                const cart = document.getElementById('cart-wrap'),
                                        _this = this;
                                if (cart !== null) {
                                    _this.panelVisible = true;
                                    Themify.LoadCss(self.css_url + 'basket.css', self.v, null, null, function () {
                                        isLoad = true;
                                        _this.panelVisible = false;
                                        _this.showPanel();
                                    });
                                }
                            }
                        }
                    });
                },
				pluginCompatibility() {
					// compatibility with plugins
					if(document.querySelector('.loops-wrapper.products')){
						const events={'wpf_form':'wpf_ajax_success','yit-wcan-container':'yith-wcan-ajax-filtered'},
							self = this;
						for(let k in events){
							if(document.getElementsByClassName(k)[0]){
								$(document).on(events[k], function () {
									self.initProductSlider();
								});
							}
						}
					}
				}
            };

    //Remove brackets
	for(let items = document.querySelectorAll('.widget_product_categories .count'),i=items.length-1;i>-1;--i){
		items[i].textContent=items[i].textContent.replace('(', '').replace(')', '');
	}
    Themify.on('themify_theme_shop_init', function (ThemifyTheme) {
        ThemifyShop.init(ThemifyTheme);
    }, true);


}(jQuery, Themify, window, document, themify_vars, themifyScript));
