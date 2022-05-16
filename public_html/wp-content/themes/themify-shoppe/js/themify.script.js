/* Themify Theme Scripts - https://themify.me/ */
;
(function ($,Themify,window,document,themify_vars,themifyScript) {
    'use strict';
    const ThemifyTheme = {
        bodyCl:Themify.body[0].classList,
        v:themify_vars.theme_v,
        headerType:themifyScript.headerType,
        url:themify_vars.theme_url+'/',
        init:function(){
            this.darkMode();
            Themify.megaMenu(document.getElementById('main-nav'));
            this.headerRender();
            this.clickableItems();
            this.headerVideo();
            this.fixedHeader();
            this.wc();
            setTimeout(this.loadFilterCss.bind(this),800);
            setTimeout(this.searchForm,1000);
            setTimeout(this.widgetSearchForm,1500);
            setTimeout(this.backToTop.bind(this),2000);
            this.resize();
            this.doInfinite($('#loops-wrapper'));
            setTimeout(this.commentAnimation,3500);
            this.builderActive();
			if(document.getElementById('mc_embed_signup')){
				Themify.LoadCss(this.url + 'styles/modules/mail_chimp.css', this.v);
			}
			this.revealingFooter();
        },
        builderActive(){
                if(Themify.is_builder_active===true){
                        Themify.LoadAsync(this.url + 'js/modules/builderActive.js',null, this.v);
                }
        },
        fixedHeader(){
            if(Themify.is_builder_active===false && this.bodyCl.contains('fixed-header-enabled') && this.headerType!=='header-bottom' && this.headerType!=='header-leftpane'&& this.headerType!=='header-minbar'&& this.headerType!=='header-rightpane' && this.headerType!=='header-slide-down' && this.headerType!=='header-none' && document.getElementById('headerwrap')!==null){
                Themify.FixedHeader();
            }
        },
        revealingFooter(){
            if (this.bodyCl.contains('revealing-footer') && document.getElementById('footerwrap')!==null) {
                Themify.LoadAsync(this.url + 'js/modules/revealingFooter.js',null, this.v);
            }
        },
        doInfinite($container,wpf){
            Themify.infinity($container, {
                scrollToNewOnLoad: themifyScript.scrollToNewOnLoad,
                scrollThreshold: !('auto' !== themifyScript.autoInfinite),
                history: wpf || !themifyScript.infiniteURL ? false : 'replace'
            });
        },
        searchForm(){
            const container = document.querySelector('body>.search-lightbox-wrap');
            if(container){
                const els = document.querySelectorAll('header .search-button');
                for(let i=els.length-1;i>-1;i--){
                    Themify.ajaxSearch({
                        type:'overlay',
                        el:els[i],
                        container:container,
                        css:{url:ThemifyTheme.url + 'styles/modules/search-form-overlay.css',v:ThemifyTheme.v}
                    });
                }
            }
        },
        widgetSearchForm(){
            const els = document.getElementsByClassName('tf_search_w_ajax');
            let el=null;
            for(let i=els.length-1;i>=0;--i){
                el = els[i].parentElement;
                Themify.ajaxSearch({
                    type:'dropdown',
                    both:true,
                    el:el.querySelector('input[name="s"]'),
                    container:el,
                    css:{url:ThemifyTheme.url + 'styles/modules/search-form-overlay.css',v:ThemifyTheme.v}
                });
            }
        },
        loadFilterCss(){
            const filters = ['blur','grayscale','sepia','none'];
            for(let i=filters.length-1;i>-1;--i){
                    if(document.getElementsByClassName('filter-'+filters[i])[0]!==undefined || document.getElementsByClassName('filter-hover-'+filters[i])[0]!==undefined){
                            Themify.LoadCss(this.url + 'styles/modules/filters/'+filters[i]+'.css',this.v);
                    }
            }
			Themify.on('infiniteloaded.themify',this.loadFilterCss.bind(this),true);
        },
        headerVideo(){
            const header = document.getElementById('headerwrap');
            if(header){
                const videos=Themify.selectWithParent('[data-fullwidthvideo]',header);
                if(videos.length>0){
                    Themify.LoadAsync(this.url + 'js/modules/headerVideo.js',function(){
                            Themify.trigger('themify_theme_header_video_init',[videos]);
                    }, this.v);
                }
            }
        },
        wc(){
            if(window['woocommerce_params']!==undefined){
                const self=this;
                Themify.LoadAsync(self.url + 'js/modules/themify.shop.js',function(){
                    Themify.trigger('themify_theme_shop_init',self);
                }, self.v);
            }
        },
        resize(){
            if (this.headerType==='header-menu-split') {
                Themify.on('tfsmartresize',function(e){
                    if(e && e.w!==Themify.w){
                        if ($('#menu-icon').is(':visible')) {
                                if ($('.header-bar').find('#site-logo').length === 0) {
                                        $('#site-logo').prependTo('.header-bar');
                                }
                        } else if ($('.themify-logo-menu-item').find('#site-logo').length === 0) {
                                $('.themify-logo-menu-item').append($('.header-bar').find('#site-logo'));
                        }
                    }
                });
           }
        },
        clickableItems(){
			const items = document.getElementsByClassName('toggle-sticky-sidebar');
            for(let i=items.length-1;i>-1;--i){
                items[i].addEventListener('click',function () {
                        const sidebar = $('#sidebar');
                        if ($(this).hasClass('open-toggle-sticky-sidebar')) {
                                $(this).removeClass('open-toggle-sticky-sidebar').addClass('close-toggle-sticky-sidebar');
                                sidebar.addClass('open-mobile-sticky-sidebar tf_scrollbar');
                        } else {
                                $(this).removeClass('close-toggle-sticky-sidebar').addClass('open-toggle-sticky-sidebar');
                                sidebar.removeClass('open-mobile-sticky-sidebar tf_scrollbar');
                        }
                },{passive:true});
            }
            setTimeout(function(){
				  Themify.body.on('click', '.post-content', function (e) {
                    if(e.target.tagName!=='A' && e.target.tagName!=='BUTTON'){
						const el = this.closest('.loops-wrapper');
						if(el!==null){
							const cl =el.classList;
							if((cl.contains('grid6') || cl.contains('grid5')|| cl.contains('grid4') || cl.contains('grid3') || cl.contains('grid2')) && (cl.contains('polaroid') || cl.contains('overlay') || cl.contains('flip'))){
								const $link = $(this).closest('.post').find('a[data-post-permalink]');
								if ($link.attr('href') && !$link.hasClass('themify_lightbox')) {
									window.location = $link.attr('href');
								}
							}
						}
					}
                });
            },1500);
        },
        headerRender(){
			Themify.sideMenu(document.getElementById('menu-icon'),{
				close: '#menu-icon-close',
				side:this.headerType==='header-minbar-left' || this.headerType==='header-left-pane' || this.headerType==='header-slide-left'?'left':'right'
			});
			const header_top_wdts=document.getElementsByClassName('top-bar-widgets')[0];
            if(undefined != themify_vars.m_m_expand || header_top_wdts){
                Themify.on('sidemenushow.themify', function(panel_id){
                    if('#mobile-menu'===panel_id){
                        // Expand Mobile Menus
                        if(undefined != themify_vars.m_m_expand){
                            const items = document.querySelectorAll('#main-nav>li.has-sub-menu');
                            for(let i=items.length-1;i>-1;i--){
                                items[i].className+=' toggle-on';
                            }
                        }
                        // Clone Header Top widgets
                        if(header_top_wdts){
                            const mobile_menu=document.getElementById('main-nav-wrap');
                            mobile_menu.parentNode.insertBefore(header_top_wdts.cloneNode(true), mobile_menu.nextSibling);
                        }
                    }
                },true);
            }
        },
        backToTop(){
            if (this.headerType==='header-bottom') {
                const footer_tab=document.getElementsByClassName('footer-tab')[0];
                if(footer_tab!==undefined){
                    footer_tab.addEventListener('click',function (e) {
                        e.preventDefault();
                        const cl=this.classList;
                        if(cl.contains('tf_close')){
                            cl.add('ti-angle-down');
                            cl.remove('tf_close');
                            $('#footerwrap').removeClass('expanded');
                        }
                        else{
                            cl.remove('ti-angle-down');
                            cl.add('tf_close');
                            $('#footerwrap').addClass('expanded');
                        }
                    });
                }
            }
            const back_top = document.getElementsByClassName('back-top')[0];
            if (back_top!==undefined) {
                if (back_top.classList.contains('back-top-float')) {
                    var events =['scroll'],
                        scroll=function(){
                            if (window.scrollY < 10) {
                                back_top.classList.add('back-top-hide');
                            } else {
                                back_top.classList.remove('back-top-hide');
                            }
                        };
                        if(Themify.isTouch){
                            events.push('touchstart');
                            events.push('touchmove');
                        }
                        for(var i=events.length-1;i>-1;--i){
                            window.addEventListener(events[i],scroll,{passive:true});
                        }
                }
                back_top.addEventListener('click',function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    Themify.scrollTo();
                });
            }
        },
        commentAnimation(){
            if(document.getElementById('commentform')){
                $('#commentform').on('focus','input, textarea',function () {
                    $(this).one('blur',function(){
                            if (this.value === '') {
                                    $(this).removeClass('filled').closest('#commentform p').removeClass('focused');
                            } else {
                                    $(this).addClass('filled');
                            }
                    }).closest('#commentform p').addClass('focused');
                });
            }
        },
        darkMode(){
            if(themifyScript.darkmode){
                const current_date = new Date(),
                    start_date = new Date(),
                    end_date = new Date(),
                    start = themifyScript.darkmode.start.split(':'),
                    end = themifyScript.darkmode.end.split(':');
                start_date.setHours(start[0],start[1],0);
                if(parseInt(end[0])<parseInt(start[0])){
                    end_date.setDate(end_date.getDate() + 1);
                }
                end_date.setHours(end[0],end[1],0);
                if(current_date >= start_date && current_date < end_date ){
                    Themify.LoadCss(themifyScript.darkmode.css,this.v,Themify.body[0].lastChild);
                    this.bodyCl.add('tf_darkmode');
                }
                delete themifyScript.darkmode;
            }
        }
    };
    ThemifyTheme.init();
})(jQuery,Themify,window,document,themify_vars,themifyScript);

