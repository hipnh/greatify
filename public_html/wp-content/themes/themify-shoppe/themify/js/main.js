;
var Themify;
(function (win, doc, und, $) {
    'use strict';
    Themify = {
        cssLazy: {},
        jsLazy: {},
        jsCallbacks: {},
        cssCallbacks: {},
        fontsQueue: {},
        is_min: false,
        events: {},
        body: null,
        is_builder_active: false,
        is_builder_loaded: false,
        w: null,
        h: null,
        isTouch: false,
        device: 'desktop',
        isRTL: false,
        lazyDisable: false,
        lazyScrolling: null,
        url: null,
        js_modules: null,
        css_modules: null,
        jsUrl: null,
        observer: null,
        hasDecode: null,
        triggerEvent(target, type, params) {
            let ev;
            if (type === 'click' || type === 'submit' || type === 'input' || type==='resize' || (type === 'change' && !params) || type.indexOf('pointer') === 0 || type.indexOf('touch') === 0 || type.indexOf('mouse') === 0) {
                if (!params) {
                    params = {};
                }
                if (params['bubbles'] === und) {
                    params['bubbles'] = true;
                }
                if (params['cancelable'] === und) {
                    params['cancelable'] = true;
                }
                ev = new Event(type, params);
            } else {
                try {
                    ev = new win.CustomEvent(type, {detail: params});
                } catch (e) {
                    ev = win.CustomEvent(type, {detail: params});
                }
            }
            target.dispatchEvent(ev);
        },
        on(ev, func, once) {
            ev = ev.split(' ');
            const len = ev.length;
            for (let i = 0; i < len; ++i) {
                if (this.events[ev[i]] === und) {
                    this.events[ev[i]] = [];
                }
                let item = {'f': func};
                if (once === true) {
                    item['o'] = true;
                }
                this.events[ev[i]].push(item);
            }
            return this;
        },
        off(ev, func) {
            if (this.events[ev]) {
                if (!func) {
                    delete this.events[ev];
                } else {
                    const events = this.events[ev];
                    for (let i = events.length - 1; i > -1; --i) {
                        if (events[i]['f'] === func) {
                            this.events[ev].splice(i, 1);
                        }
                    }
                }
            }
            return this;
        },
        trigger(ev, args) {
            if (this.events[ev]) {
                const events = this.events[ev].reverse();
                if (!Array.isArray(args)) {
                    args = [args];
                }
                for (let i = events.length - 1; i > -1; --i) {
                    if (events[i] !== und) {
                        events[i]['f'].apply(null, args);
                        if (events[i] !== und && events[i]['o'] === true) {
                            this.events[ev].splice(i, 1);
                            if (Object.keys(this.events[ev]).length === 0) {
                                delete this.events[ev];
                                break;
                            }
                        }
                    }
                }
            }
            return this;
        },
        requestIdleCallback(callback, timeout) {
            if (win.requestIdleCallback) {
                win.requestIdleCallback(callback, {timeout: timeout});
            } else {
                setTimeout(callback, timeout);
            }
        },
        UpdateQueryString(a, b, c) {
            c || (c = win.location.href);
            const d = RegExp('([?|&])' + a + '=.*?(&|#|$)(.*)', 'gi');
            if (d.test(c))
                return b !== void 0 && null !== b ? c.replace(d, '$1' + a + '=' + b + '$2$3') : c.replace(d, '$1$3').replace(/(&|\?)$/, '');
            if (b !== void 0 && null !== b) {
                const e = -1 !== c.indexOf('?') ? '&' : '?', f = c.split('#');
                return c = f[0] + e + a + '=' + b, f[1] && (c += '#' + f[1]), c;
            }
            return c;
        },
        selectWithParent(selector, el) {
            let items = null;
            const isCl = selector.indexOf('.') === -1 && selector.indexOf('[') === -1,
                    isTag = isCl === true && (selector === 'video' || selector === 'audio' || selector === 'img');
            if (el && el[0] !== und) {
                el = el[0];
            }
            if (el) {
                items = isCl === false ? el.querySelectorAll(selector) : (isTag === true ? el.getElementsByTagName(selector) : el.getElementsByClassName(selector));
                if ((isCl === true && el.classList.contains(selector)) || (isCl === false && el.matches(selector)) || (isTag === true && el.tagName.toLowerCase() === selector)) {
                    items = this.convert(items, el);
                }
            } else {
                items = isCl === false ? doc.querySelectorAll(selector) : (isTag === true ? doc.getElementsByTagName(selector) : doc.getElementsByClassName(selector));
            }
            return items;
        },
        convert(items, el) {
            let l = items.length;
            const arr = new Array(l);
            while (l--) {
                arr[l] = items[l];
            }
            if (el) {
                arr.push(el);
            }
            return arr;
        },
        Init() {
            this.is_builder_active = doc.body.classList.contains('themify_builder_active');
            this.body = $('body');
            const self = this,
                    windowLoad = function () {
                        self.w = win.innerWidth;
                        self.h = win.innerHeight;
                        self.isRTL = self.body[0].classList.contains('rtl');
                        self.isTouch = !!(('ontouchstart' in win) || navigator.msMaxTouchPoints > 0);
                        self.lazyDisable = self.is_builder_active === true || self.body[0].classList.contains('tf_lazy_disable');
                        if (self.isTouch) {
                            const ori = typeof win.screen !== 'undefined' && typeof win.screen.orientation !== 'undefined' ? win.screen.orientation.angle : win.orientation,
                                    w = ori === 90 || ori === -90 ? self.h : self.w;
                            if (w < 769) {
                                self.device = w < 681 ? 'mobile' : 'tablet';
                            }
                        }
                        const img = new Image(),
                                _loaded = function (c) {
                                    let cl = ' page-loaded';
                                    if (c) {
                                        cl += ' ' + c;
                                    }
                                    const body = self.body[0];
                                    if (typeof woocommerce_params !== 'undefined') {
                                        body.classList.remove('woocommerce-no-js');
                                        cl += ' woocommerce-js';
                                    }
                                    body.className += cl;
                                };
                        self.hasDecode = 'decode' in img;
                        if (typeof themify_vars === 'undefined') {
                            const vars = doc.getElementById('tf_vars'),
                                    script = doc.createElement('script');
                            script.type = 'text/javascript';
                            script.textContent = vars.textContent;
                            vars.parentNode.replaceChild(script, vars);
                        }
                        self.is_min = themify_vars.is_min ? true : false;
                        self.url = themify_vars.url;
                        self.jsUrl = self.url + '/js/modules/';
                        self.js_modules = themify_vars.js_modules;
                        self.css_modules = themify_vars.css_modules;
                        if (!win['IntersectionObserver']) {
                            self.LoadAsync(self.jsUrl + 'fallback.js');
                        }
                        if (themify_vars['done'] !== und) {
                            self.cssLazy = themify_vars['done'];
                            delete themify_vars['done'];
                        }
                        self.mobileMenu();
                        self.trigger('tf_init');
                        win.loaded = true;
                        if (themify_vars && !themify_vars['is_admin']) {
                            if (false && themify_vars['sw'] && win.self === win.top && ('serviceWorker' in navigator)) {// temprorary disabling    
                                const swargs=themify_vars['sw'],
                                uniqueID=self.hash(swargs.site_url);
                                if(!swargs.unbind){
                                        let swUrl=self.url+'/sw/sw',
                                                includesURL=encodeURIComponent(themify_vars.includesURL.replace(/\/$/, '').replace(swargs.site_url.replace(/\/$/, '')+'/','6789'));//6789 random name to replace it in sw.js
                                        if(self.is_min===true){
                                                swUrl+='.min';
                                        }
                                        swUrl+='.js?ver='+themify_vars.version+'&tv='+themify_vars['theme_v']+'&wp='+themify_vars.wp+'&uid='+uniqueID+'&i='+includesURL+'&jq='+$.fn.jquery+'&pl='+swargs.plugins_url;
                                        if(swargs.wp_n_min){
                                                swUrl+='&wpm=1';
                                        }
                                        if(swargs.is_multi){
                                                swUrl+='&m=1';
                                        }
                                        if(themify_vars.wc_version){
                                                swUrl+='&wc='+themify_vars.wc_version;
                                        }

                                        navigator.serviceWorker.register(swUrl,{scope:'/'});
                                }
                                else{
                                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                                                for(let i=registrations.length-1;i>-1;--i) {
                                                        if( registrations[i].active.scriptURL.indexOf(uniqueID)!==-1){
                                                          registrations[i].unregister();
                                                        }
                                                } 
                                        });
                                }  
                            }
                            if (themify_vars['theme_js']) {
                                self.LoadAsync(themify_vars.theme_js, null, themify_vars.theme_v);
                                delete themify_vars['theme_js'];
                            }
                            if (self.is_builder_active === false) {
                                if (win['tbLocalScript'] && doc.getElementsByClassName('module_row')[0]) {
                                    self.LoadAsync(win['tbLocalScript'].builder_url + '/js/themify.builder.script.js', function () {
                                        self.is_builder_loaded = true;
                                        _loaded('has-builder');
                                        self.lazyLoading();
                                    }, null, null, function () {
                                        return typeof ThemifyBuilderModuleJs !== 'undefined';
                                    });
                                } else {
                                    _loaded();
                                    self.lazyLoading();
                                }
                                self.loadFonts();
                                self.stickyBuy();
                            } else {
                                _loaded();
                            }
                            requestAnimationFrame(function () {
                                self.initWC();
                                setTimeout(function () {
                                    self.InitGallery();
                                }, 800);
                            });
                        }
                        self.initResizeHelper();
                        if (self.is_builder_active === false) {
                            self.touchDropDown();
                        }
                    };
            if (doc.readyState === 'complete' || self.is_builder_active === true) {
                windowLoad();
            } else {
                win.addEventListener('load', windowLoad, {once: true, passive: true});
            }
        },
        FixedHeader(options) {
            if (!this.is_builder_active && win['IntersectionObserver']) {
                if (typeof ThemifyFixedHeader==='undefined') {
                    const self = this;
                    this.LoadAsync(this.js_modules.fxh, function () {
                        self.trigger('tf_fixed_header_init', options);
                    }, null, null, function () {
                        return typeof ThemifyFixedHeader!=='undefined';
                    });
                } else {
                    this.trigger('tf_fixed_header_init', options);
                }
            }
        },
        initComponents(el, isLazy) {
            if (isLazy === true && el[0].tagName === 'IMG') {
                return;
            }
            let items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('tf_carousel')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('tf_carousel', el);
            }
            if (items !== null && items.length > 0) {
                this.InitCarousel(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('themify_map')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('themify_map', el);
            }
            if (items !== null && items.length > 0) {
                this.InitMap(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('auto_tiles')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('auto_tiles', el);
            }
            if (items !== null && items.length > 0) {
                this.autoTiles(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].hasAttribute('data-lax')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('[data-lax]', el);
            }
            if (items !== null && items.length > 0) {
                this.lax(items, null);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].tagName === 'VIDEO') {
                    items = el;
                }
            } else {
                items = this.selectWithParent('video', el);
            }
            if (items !== null && items.length > 0) {
                this.video(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].tagName === 'AUDIO') {
                    items = el;
                }
            } else {
                items = this.selectWithParent('audio', el);
            }
            if (items !== null && items.length > 0) {
                this.audio(items);
            }
            items = null;
            if (isLazy === true) {
                if (el[0].classList.contains('masonry')) {
                    items = el;
                }
            } else {
                items = this.selectWithParent('masonry', el);
            }
            if (items !== null && items.length > 0) {
                this.isoTop(items);
            }
			items=null;
            if (isLazy === true) {
                if (el[0].classList.contains('wp-embedded-content')) {
                    items = el;
                } else {
                    this.loadWPEmbed(el[0].getElementsByClassName('wp-embedded-content'));
                }
            } else {
                items = this.selectWithParent('wp-embedded-content', el);
            }
            if (items !== null && items.length > 0) {
                this.loadWPEmbed(items);
            }
            items=null;
            this.checkLargeImages(el);
        },
        fontAwesome(icons) {
            if (icons) {
                if (typeof icons === 'string') {
                    icons = [icons];
                } else if (!Array.isArray(icons)) {
                    if (icons instanceof jQuery) {
                        icons = icons[0];
                    }
                    icons = this.selectWithParent('tf_fa', icons);
                }
            } else {
                icons = doc.getElementsByClassName('tf_fa');
            }
            const Loaded = {},
                    needToLoad = [],
                    parents = [],
                    svg = doc.getElementById('tf_svg').firstChild,
                    loadedIcons = svg.getElementsByTagName('symbol');
            for (let i = loadedIcons.length - 1; i > -1; --i) {
                Loaded[loadedIcons[i].id] = true;
            }
            for (let i = icons.length - 1; i > -1; --i) {
                let id = icons[i].classList ? icons[i].classList[1] : icons[i];
                if (id && !Loaded[id]) {
                    if (this.fontsQueue[id] === und) {
                        this.fontsQueue[id] = true;
                        let tmp = id.replace('tf-', ''),
                                tmp2 = tmp.split('-');
                        if (tmp2[0] === 'fas' || tmp2[0] === 'far' || tmp2[0] === 'fab') {
                            let pre = tmp2[0];
                            tmp2.shift();
                            tmp = pre + ' ' + tmp2.join('-');
                        }
                        needToLoad.push(tmp);
                    }
                    if (icons[i].classList) {
                        let p = icons[i].parentNode;
                        p.classList.add('tf_lazy');
                        parents.push(p);
                    }
                }
            }
            if (needToLoad.length > 0) {
                const time = this.is_builder_active ? 5 : 2000,
                        self = this;
                setTimeout(function () {
                    const request = new Headers({
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }),
                            data = new FormData();
                    data.append('action', 'tf_load_icons');
                    data.append('icons', JSON.stringify(needToLoad));

                    fetch(themify_vars.ajax_url, {method: 'POST', headers: request, body: data})
                            .then(res => res.json())
                            .then(data => {
                                const fr = doc.createDocumentFragment(),
                                        ns = 'http://www.w3.org/2000/svg';
                                let st = [];
                                for (let i in data) {
                                    let s = doc.createElementNS(ns, 'symbol'),
                                            p = doc.createElementNS(ns, 'path'),
                                            k = 'tf-' + i.replace(' ', '-'),
                                            viewBox = '0 0 ';
                                    viewBox += data[i].vw ? data[i].vw : '32';
                                    viewBox += ' 32';
                                    s.id = k;
                                    s.setAttributeNS(null, 'viewBox', viewBox);
                                    p.setAttributeNS(null, 'd', data[i]['p']);
                                    s.appendChild(p);
                                    fr.appendChild(s);
                                    if (data[i].w) {
                                        st.push('.tf_fa.' + k + '{width:' + data[i].w + 'em}');
                                    }
                                }
                                svg.appendChild(fr);
                                if (st.length > 0) {
                                    let css = doc.getElementById('tf_fonts_style');
                                    if (css === null) {
                                        css = doc.createElement('style');
                                        css.id = 'tf_fonts_style';
                                    }
                                    css.textContent += st.join('');
                                }
                                self.fontsQueue = {};
                                for (let i = parents.length - 1; i > -1; --i) {
                                    if (parents[i]) {
                                        parents[i].classList.remove('tf_lazy');
                                    }
                                }

                            });
                }, time);
            }
            return;
        },
        loadFonts() {
            const self = this;
            if (!self.cssLazy['framework-css'] && (self.is_builder_active === true || doc.getElementsByClassName('shortcode')[0])) {
                const el = doc.getElementById('themify-framework-css');
                if (el !== null) {
                    self.LoadCss(el.getAttribute('data-href'), false, el, null, function () {
                        self.cssLazy['framework-css'] = true;
                    });
                } else {
                    self.cssLazy['framework-css'] = false;
                }
            } else {
                self.cssLazy['framework-css'] = false;
            }
            this.requestIdleCallback(function () {
                self.fontAwesome();
            }, 200);
            if (themify_vars['commentUrl']) {
                setTimeout(function () {
                    self.loadComments();
                }, 3000);
            }
            if (themify_vars.wp_emoji) {
                setTimeout(function () {
                    self.loadExtra(themify_vars.wp_emoji, null, false, function () {
                        win._wpemojiSettings['DOMReady'] = true;
                    });
                    themify_vars.wp_emoji = null;
                }, 5100);
            }
        },
        loadComments(callback) {
            if (!win['addComment'] && themify_vars['commentUrl']) {
                let comments = doc.getElementById('cancel-comment-reply-link');
                if (comments) {
                    comments = comments.closest('#comments');
                    if (comments) {
                        const self = this,
                                load = function () {
                                    this.removeEventListener('focusin', load, {once: true, passive: true});
                                    this.removeEventListener((self.isTouch ? 'touchstart' : 'mouseenter'), load, {once: true, passive: true});
                                    self.LoadAsync(themify_vars.commentUrl, callback, themify_vars.wp, null, function () {
                                        return !!win['addComment'];
                                    });
                                    themify_vars['commentUrl'] = null;
                                };
                        comments.addEventListener('focusin', load, {once: true, passive: true});
                        comments.addEventListener((this.isTouch ? 'touchstart' : 'mouseenter'), load, {once: true, passive: true});
                    }
                }
            }
        },
        InitCarousel(items, options) {
            if (items) {
                if (this.jsLazy['tf_carousel'] === und) {
                    const self = this;
                    this.LoadAsync(this.js_modules.tc, function () {
                        self.jsLazy['tf_carousel'] = true;
                        self.trigger('tf_carousel_init', [items, options]);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_carousel'];
                    });
                } else {
                    this.trigger('tf_carousel_init', [items, options]);
                }
            }
        },
        InitMap(items) {
            if (items.length > 0) {
                if (this.jsLazy['tf_map'] === und) {
                    const self = this;
                    this.LoadAsync(this.js_modules.map, function () {
                        self.jsLazy['tf_map'] = true;
                        self.trigger('themify_map_init', [items]);
                    }, null, null, function () {
                        return !!win['ThemifyGoogleMap'];
                    });
                } else {
                    this.trigger('themify_map_init', [items]);
                }
            }
        },
        LoadAsync(src, callback, version, extra, test, async) {
            const id = this.hash(src), // Make script path as ID
                    exist = !!this.jsLazy[id];
            if (exist === false) {
                this.jsLazy[id] = true;
            }
            if (exist === true || doc.getElementById(id) !== null) {
                if (callback) {
                    if (test) {
                        if (test() === true) {
                            callback();
                            return;
                        }
                        if (this.jsCallbacks[id] === und) {
                            this.jsCallbacks[id] = [];
                        }
                        this.jsCallbacks[id].push(callback);
                    } else {
                        callback();
                    }
                }
                return;
            } else if (test && test() === true) {
                if (extra) {
                    this.loadExtra(extra);
                }
                if (callback) {
                    callback();
                }
                return;
            }
            if (this.is_min === true && src.indexOf('.min.js') === -1 && src.indexOf(win.location.hostname) !== -1) {
                src = src.replace('.js', '.min.js');
            }
            if (version !== false) {
                if(!version){
                    version = themify_vars.version;
                }
                src += '?ver=' + version;
            }
            const s = doc.createElement('script'),
                    self = this;
            s.setAttribute('id', id);
            if (async !== false) {
                async = 'async';
            }
            s.setAttribute('async', async);
            s.addEventListener('load', function () {
                if (callback) {
                    callback();
                }
                const key = this.getAttribute('id');
                if (self.jsCallbacks[key]) {
                    for (let i = 0, len = self.jsCallbacks[key].length; i < len; ++i) {
                        self.jsCallbacks[key][i]();
                    }
                    delete self.jsCallbacks[key];
                }

            }, {passive: true, once: true});
            s.setAttribute('src', src);
            doc.head.appendChild(s);
            if (extra) {
                this.loadExtra(extra, s);
            }
        },
        loadExtra(data, handler, inHead, callback) {
            if (data) {
                if (typeof handler === 'string') {
                    handler = doc.querySelector('script#' + handler);
                    if (handler === null) {
                        return;
                    }
                }
                let str = '';
                if (handler) {
                    if (data['before']) {
                        if (typeof data['before'] !== 'string') {
                            for (let i in data['before']) {
                                if (data['before'][i]) {
                                    str += data['before'][i];
                                }
                            }
                        } else {
                            str = data['before'];
                        }
                        if (str !== '') {
                            const before = doc.createElement('script');
                            before.type = 'text/javascript';
                            before.text = str;
                            handler.parentNode.insertBefore(before, handler);
                        }
                    }
                }
                if (typeof data !== 'string') {
                    str = '';
                    for (let i in data) {
                        if (i !== 'before' && data[i]) {
                            str += data[i];
                        }
                    }
                } else {
                    str = data;
                }
                if (str !== '') {
                    const extra = doc.createElement('script');
                    extra.type = 'text/javascript';
                    extra.text = str;
                    if (inHead === und || inHead === true) {
                        doc.head.appendChild(extra);
                    } else {
                        doc.body.appendChild(extra);
                    }
                    if (callback) {
                        callback();
                    }
                }
            }
        },
        LoadCss(href, version, before, media, callback) {
            if (!version && version !== false) {
                version = themify_vars.version;
            }
            const id = this.hash(href);
            let  fullHref = version ? href + '?ver=' + version : href;
            if (this.is_min === true && href.indexOf('.min.css') === -1 && href.indexOf(win.location.hostname) !== -1) {
                fullHref = fullHref.replace('.css', '.min.css');
            }
            if (this.cssLazy[id] !== true) {
                this.cssLazy[id] = true;
            } else {
                if (callback) {
                    const el = doc.getElementById(id);
                    if (el !== null && el.getAttribute('media') !== 'only_x') {
                        callback();
                    } else {
                        if (this.cssCallbacks[id] === und) {
                            this.cssCallbacks[id] = [];
                        }
                        this.cssCallbacks[id].push(callback);
                    }
                }
                return false;
            }

            if (!media) {
                media = 'all';
            }
            const ss = doc.createElement('link'),
                    self = this,
                    onload = function () {
                        this.setAttribute('media', media);
                        const key = this.getAttribute('id'),
                                checkApply = function () {
                                    const sheets = doc.styleSheets;
                                    let found = false;
                                    for (let i = sheets.length - 1; i > -1; --i) {
                                        if (sheets[i].ownerNode.id === key) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found === true) {
                                        if (callback) {
                                            callback();
                                        }
                                        if (self.cssCallbacks[key]) {
                                            for (let i = 0, len = self.cssCallbacks[key].length; i < len; ++i) {
                                                self.cssCallbacks[key][i]();
                                            }
                                            delete self.cssCallbacks[key];
                                        }
                                    } else {
                                        setTimeout(checkApply, 80);
                                    }
                                };
                        if (callback || self.cssCallbacks[key] !== und) {
                            checkApply();
                        }
                    };
            if (fullHref.indexOf('http') === -1) {
                // convert protocol-relative url to absolute url
                const placeholder = doc.createElement('a');
                placeholder.href = fullHref;
                fullHref = placeholder.href;
            }
            ss.setAttribute('href', fullHref);
            ss.setAttribute('rel', 'stylesheet');
            ss.setAttribute('importance', 'low');
            ss.setAttribute('media', 'only_x');
            ss.setAttribute('id', id);
            if ('isApplicationInstalled' in navigator) {
                ss.onloadcssdefined(onload);
            } else {
                ss.addEventListener('load', onload, {passive: true, once: true});
            }
            let ref = before;
            if (!ref) {
                const critical_st = doc.getElementById('tf_lazy_common');
                ref = critical_st ? critical_st.nextSibling : doc.head.firstElementChild;
            }
            ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
        },
        InitGallery() {
            const lbox = this.is_builder_active === false && themify_vars['lightbox'] ? themify_vars.lightbox : false;
            if (lbox !== false && lbox['lightboxOn'] !== false && this.jsLazy['tf_gallery_init'] === und) {
                this.jsLazy['tf_gallery_init'] = true;
                const self = this,
                        hash = win.location.hash.replace('#', ''),
                        p = self.body.parent(),
                        args = {
                            'extraLightboxArgs': themify_vars['extraLightboxArgs'],
                            'lightboxSelector': lbox['lightboxSelector'] ? lbox['lightboxSelector'] : '.themify_lightbox',
                            'gallerySelector': lbox['gallerySelector'] ? lbox['gallerySelector'] : '.gallery-item a',
                            'contentImagesAreas': lbox['contentImagesAreas'],
                            'i18n': lbox['i18n'] ? lbox['i18n'] : []
                        };
                if (lbox['disable_sharing']) {
                    args['disableSharing'] = lbox['disable_sharing'];
                }
                let isWorking = false;
                const isImg = function (url) {
                    return url.match(/\.(gif|jpg|jpeg|tiff|png|webp|apng)(\?fit=\d+(,|%2C)\d+)?(\&ssl=\d+)?$/i);
                },
                        _click = function (e) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            if (isWorking === true) {
                                return;
                            }
                            isWorking = true;
                            const _this = $(e.currentTarget),
                                    link = _this[0].getAttribute('href'),
                                    loaderP = doc.createElement('div'),
                                    loaderC = doc.createElement('div'),
                                    checkLoad = function () {
                                        if (self.cssLazy['tf_lightbox'] === true && self.jsLazy['tf_lightbox'] === true && self.jsLazy['tf_gallery'] === true) {
                                            p.off('click.tf_gallery');
                                            self.trigger('tf_gallery_init', args);
                                            _this.click();
                                            loaderP.remove();
                                        }
                                    };
                            loaderP.className = 'tf_lazy_lightbox tf_w tf_h';
                            if (link && isImg(link)) {
                                loaderP.textContent = 'Loading...';
                                const img = new Image();
                                img.decoding = 'async';
                                img.src = link;
                            } else {
                                loaderC.className = 'tf_lazy tf_w tf_h';
                                loaderP.appendChild(loaderC);
                            }
                            self.body[0].appendChild(loaderP);
                            if (!self.cssLazy['tf_lightbox']) {
                                self.LoadCss(self.css_modules.lb, null, null, null, function () {
                                    self.cssLazy['tf_lightbox'] = true;
                                    checkLoad();
                                });
                            }
                            if (!self.jsLazy['tf_lightbox']) {
                                self.LoadAsync(self.js_modules.lb, function () {
                                    self.jsLazy['tf_lightbox'] = true;
                                    checkLoad();
                                }, '1.1.0', null, function () {
                                    return 'undefined' !== typeof $.fn.magnificPopup;
                                });
                            }
                            if (!self.jsLazy['tf_gallery']) {
                                self.LoadAsync(self.js_modules.gal, function () {
                                    self.jsLazy['tf_gallery'] = true;
                                    checkLoad();
                                }, null, null, function () {
                                    return !!self.jsLazy['tf_gallery'];
                                });
                            }
                            checkLoad();
                        };
                p.on('click.tf_gallery', args['lightboxSelector'], _click);
                if (args['gallerySelector']) {
                    p.on('click.tf_gallery', args['gallerySelector'], function (e) {
                        if (isImg(this.getAttribute('href')) && !this.closest('.module-gallery')) {
                            _click(e);
                        }
                    });
                }
                if (lbox['contentImagesAreas']) {
                    p.on('click.tf_gallery', '.post-content a', function (e) {
                        if (isImg(this.getAttribute('href')) && $(this).closest(args.contentImagesAreas)) {
                            _click(e);
                        }
                    });
                }
                if (hash && hash !== '#') {
                    let item = doc.querySelector('img[alt="' + decodeURI(hash) + '"]');
                    item = null === item ? doc.querySelector('img[title="' + decodeURI(hash) + '"]') : item;
                    if (item) {
                        item = item.closest('.themify_lightbox');
                        if (item) {
                            item.click();
                        }
                    }
                }
            }
        },
        parseVideo(url) {
            const m = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/i);
            return{
                type: m !== null ? (m[3].indexOf('youtu') > -1 ? 'youtube' : (m[3].indexOf('vimeo') > -1 ? 'vimeo' : false)) : false,
                id: m !== null ? m[6] : false
            };
        },
        hash(s) {
            let hash = 0;
            for (let i = s.length - 1; i > -1; --i) {
                hash = ((hash << 5) - hash) + s.charCodeAt(i);
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        },
        scrollTo(val, speed, complete, progress) {
            if (!speed) {
                speed = 800;
            }
            if (!val) {
                val = 0;
            }
            const doc = $('html,body'),
                    hasScroll = doc.css('scroll-behavior') === 'smooth';
            if (hasScroll) {
                doc.css('scroll-behavior', 'auto');
            }
            doc.stop().animate({
                scrollTop: val
            }, {
                progress: progress,
                duration: speed,
                done: function () {
                    if (hasScroll) {
                        doc.css('scroll-behavior', '');
                    }
                    if (complete) {
                        complete();
                    }
                }
            });
        },
        imagesLoad(items, callback) {
            const init = function (items, callback) {
                if (!callback && typeof items === 'function') {
                    items();
                } else if (items !== null) {
                    if (items instanceof jQuery) {
                        items.imagesLoaded().always(callback);
                    } else {
                        imagesLoaded(items, callback);
                    }
                } else if (typeof callback === 'function') {
                    callback();
                }
            };
            if (win['imagesLoaded'] === und) {
                this.LoadAsync(this.js_modules.img, init.bind(null, items, callback), themify_vars['i_v'], null, function () {
                    return !!win['imagesLoaded'];
                });
            } else {
                init(items, callback);
            }
        },
        autoTiles(items, callback) {
            if (!items || items.length === 0) {
                return;
            }
            if (this.jsLazy['tf_autotiles'] === und) {
                const self = this;
                this.LoadAsync(this.js_modules.at, function () {
                    self.jsLazy['tf_autotiles'] = true;
                    self.trigger('tf_autotiles_init', [items, callback]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_autotiles'];
                });
            } else {
                this.trigger('tf_autotiles_init', [items, callback]);
            }
        },
        isoTop(items, options) {
            if (typeof items === 'string') {
                return;
            }
            if (items instanceof jQuery) {
                items = items.get();
            } else if (items.length === und) {
                items = [items];
            }
            const res = [];
            for (let i = items.length - 1; i > -1; --i) {
                let cl = items[i].classList;
                if (!cl.contains('masonry-done') && (!cl.contains('auto_tiles') || !cl.contains('list-post') || !items[i].previousElementSibling || items[i].previousElementSibling.classList.contains('post-filter'))) {
                    res.push(items[i]);
                }
            }
            if (res.length > 0) {
                if (this.jsLazy['tf_isotop'] === und) {
                    const self = this;
                    if (win['imagesLoaded'] === und) {
                        self.imagesLoad(null);
                    }
                    this.LoadAsync(this.js_modules.iso, function () {
                        self.jsLazy['tf_isotop'] = true;
                        self.trigger('tf_isotop_init', [res, options]);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_isotop'];
                    });
                } else {
                    this.trigger('tf_isotop_init', [res, options]);
                }
            }
        },
        reLayoutIsoTop() {
            this.trigger('tf_isotop_layout');
        },
        infinity(container, options) {
            if (!container || container.length === 0 || this.is_builder_active === true || (!options['button'] && options.hasOwnProperty('button')) || (options['path'] && typeof options['path'] === 'string' && doc.querySelector(options['path']) === null)) {
                return;
            }
            // there are no elements to apply the Infinite effect on
            if (options['append'] && !$(options['append']).length) {
                // show the Load More button, just in case.
                if (options['button']) {
                    options['button'].style.display = 'block';
                }
                return;
            }
            if (this.jsLazy['tf_infinite'] === und) {
                const self = this;
                this.LoadAsync(this.js_modules.inf, function () {
                    self.jsLazy['tf_infinite'] = true;
                    self.trigger('tf_infinite_init', [container, options]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_infinite'];
                });
            } else {
                this.trigger('tf_infinite_init', [container, options]);
            }
        },
        lax(items, is_live) {
            if ((is_live !== true && this.is_builder_active) || items.length === 0) {
                return;
            }
            if (this.jsLazy['tf_lax'] === und) {
                const self = this;
                this.LoadAsync(this.js_modules.lax, function () {
                    self.jsLazy['tf_lax'] = true;
                    self.trigger('tf_lax_init', [items]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_lax'];
                });
            } else {
                this.trigger('tf_lax_init', [items]);
            }
        },
        video(items, options) {
            if (!items || items.length === 0) {
                return false;
            }
            if (this.jsLazy['tf_video'] === und) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['tf_video'] === true && self.jsLazy['tf_video'] === true) {
                                self.trigger('tf_video_init', [items, options]);
                            }
                        };
                this.LoadCss(self.css_modules.video, null, null, null, function () {
                    self.cssLazy['tf_video'] = true;
                    check();
                });
                this.LoadAsync(this.js_modules.video, function () {
                    self.jsLazy['tf_video'] = true;
                    check();
                }, null, null, function () {
                    return !!self.jsLazy['tf_video'];
                });
            } else {
                this.trigger('tf_video_init', [items, options]);
            }
        },
        audio(items, options) {
            if (!items || items.length === 0) {
                return false;
            }
            if (this.jsLazy['tf_audio'] === und) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['tf_audio'] === true && self.jsLazy['tf_audio'] === true) {
                                self.trigger('tf_audio_init', [items, options]);
                            }
                        };
                this.LoadCss(self.css_modules.audio, null, null, null, function () {
                    self.cssLazy['tf_audio'] = true;
                    check();
                });
                this.LoadAsync(this.js_modules.audio, function () {
                    self.jsLazy['tf_audio'] = true;
                    check();
                }, null, null, function () {
                    return !!self.jsLazy['tf_audio'];
                });
            } else {
                this.trigger('tf_audio_init', [items, options]);
            }
        },
        lazyLoading(parent) {
            if (this.lazyDisable === true) {
                return;
            }
            if (!parent) {
                parent = doc;
            }
            const items = (parent instanceof HTMLDocument || parent instanceof HTMLElement) ? parent.querySelectorAll('[data-lazy]') : parent,
                    len = items.length;
            if (len > 0) {
                const self = this,
                        lazy = function (entries, _self, init) {
                            for (let i = entries.length - 1; i > -1; --i) {
                                if (self.lazyScrolling === null && entries[i].isIntersecting === true) {
                                    _self.unobserve(entries[i].target);
                                    self.requestIdleCallback(function () {
                                        self.lazyScroll([entries[i].target], init);
                                    }, 70);
                                }
                            }
                        };
                let observerInit;
                if (self.observer === null) {
                    if (win['IntersectionObserver']) {
                        observerInit = new win['IntersectionObserver'](function (entries, _self) {
                            lazy(entries, _self, true);
                            _self.disconnect();
                            let intersect2 = false;
                            const ev = self.isTouch ? 'touchstart' : 'mousemove',
                                    oneScroll = function () {
                                        if (intersect2) {
                                            intersect2.disconnect();
                                        }
                                        intersect2 = null;
                                        win.removeEventListener(ev, oneScroll, {once: true, passive: true});
                                        win.removeEventListener('scroll', oneScroll, {once: true, passive: true});
                                        self.observer = new win['IntersectionObserver'](function (entries, _self) {
                                            lazy(entries, _self);
                                        }, {
                                            rootMargin: '300px 0px 300px 0px'
                                        });
                                        for (let i = 0; i < len; ++i) {
                                            if (items[i].hasAttribute('data-lazy') && !items[i].hasAttribute('data-tf-not-load')) {
                                                self.observer.observe(items[i]);
                                            }
                                        }
                                        setTimeout(function () {//pre cache after one scroll/mousemove
                                            const prefetched = [];
                                            let j = 0;
                                            for (let i = 0; i < len; ++i) {
                                                if (items[i].hasAttribute('data-tf-src') && items[i].hasAttribute('data-lazy')) {
                                                    if (j < 10) {
                                                        let src = items[i].getAttribute('data-tf-src');
                                                        if (src && !prefetched[src]) {
                                                            prefetched[src] = true;
                                                            let img = new Image();
                                                            img.decoding = 'async';
                                                            img.src = src;
                                                            ++j;
                                                        }
                                                    } else {
                                                        break;
                                                    }
                                                }
                                            }
                                            if (doc.getElementsByClassName('wow')[0]) {
                                                self.loadWowJs();
                                            }
                                        }, 1500);
                                    };
                            win.addEventListener('beforeprint', function () {
                                self.lazyScroll(doc.querySelectorAll('[data-lazy]'), true);
                            }, {passive: true});

                            win.addEventListener('scroll', oneScroll, {once: true, passive: true});
                            win.addEventListener(ev, oneScroll, {once: true, passive: true});
                            setTimeout(function () {
                                if (intersect2 === false) {
                                    intersect2 = new win['IntersectionObserver'](function (entries, _self) {
                                        if (intersect2 !== null) {
                                            lazy(entries, _self, true);
                                        }
                                        _self.disconnect();
                                    }, {
                                        threshold: .1
                                    });
                                    const len2 = len > 15 ? 15 : len;
                                    for (let i = 0; i < len2; ++i) {
                                        if (items[i] && items[i].hasAttribute('data-lazy') && !items[i].hasAttribute('data-tf-not-load')) {
                                            intersect2.observe(items[i]);
                                        }
                                    }
                                }
                            }, 1600);
                        });
                    }
                } else {
                    observerInit = self.observer;
                }
                if (observerInit) {
                    for (let i = 0; i < len; ++i) {
                        if (!items[i].hasAttribute('data-tf-not-load')) {
                            observerInit.observe(items[i]);
                        }
                    }
                }
            }
        },
        lazyScroll(items, init) {

            let len = 0;
            if (items) {
                len = items.length;
                if (len === und) {
                    items = [items];
                    len = 1;
                } else if (len === 0) {
                    return;
                }
            }
            const svg_callback = function () {
                this.classList.remove('tf_svg_lazy_loaded', 'tf_svg_lazy');
            };
            for (let i = len - 1; i > -1; --i) {
                let el = items[i],
                        tagName = el.tagName;
                if (!el || !el.hasAttribute('data-lazy')) {
                    if (el) {
                        el.removeAttribute('data-lazy');
                    }
                } else {
                    el.removeAttribute('data-lazy');
                    if (tagName !== 'IMG' && (tagName === 'DIV' || !el.hasAttribute('data-tf-src'))) {
                        let $el = $(el);
                        try {
                            el.classList.remove('tf_lazy');
                            this.reRun($el, null, true);
                            this.trigger('tf_lazy', $el);
                        } catch (e) {
                            console.log(e);
                        }
                    } else if (tagName !== 'svg') {
                        let src = el.getAttribute('data-tf-src'),
                                srcset = el.getAttribute('data-tf-srcset');
                        if (src) {
                            el.setAttribute('src', src);
                            el.removeAttribute('data-tf-src');
                        }
                        if (srcset) {
                            let sizes = el.getAttribute('data-tf-sizes');
                            if (sizes) {
                                el.setAttribute('sizes', sizes);
                                el.removeAttribute('data-tf-sizes');
                            }
                            el.setAttribute('srcset', srcset);
                            el.removeAttribute('data-tf-srcset');
                        }
                        el.removeAttribute('loading');
                        if (el.classList.contains('tf_svg_lazy')) {
                            this.imagesLoad(el, function (instance) {
                                const svg = instance.elements[0];
                                requestAnimationFrame(function () {
                                    svg.addEventListener('transitionend', svg_callback, {once: true, passive: true});
                                    svg.classList.add('tf_svg_lazy_loaded');
                                });
                            });
                        } else if (tagName !== 'IFRAME') {
                            if(init !== true && el.parentNode !== this.body[0]){
                                el.parentNode.classList.add('tf_lazy');
                                this.imagesLoad(el, function (instance) {
                                        instance.elements[0].parentNode.classList.remove('tf_lazy');
                                });
                            }
                            this.checkLargeImages();
                        }
                    }
                }
                if (this.observer !== null && el) {
                    this.observer.unobserve(el);
                }
            }
        },
        reRun(el, type, isLazy) {
            if (isLazy !== true) {
                this.loadFonts();
            }
            if (typeof ThemifyBuilderModuleJs !== 'undefined') {
                ThemifyBuilderModuleJs.loadOnAjax(el, type, isLazy);
                this.initComponents(el, isLazy);
            } else if (!this.is_builder_loaded && themify_vars && !themify_vars['is_admin'] && win['tbLocalScript'] && doc.getElementsByClassName('module_row')[0]) {
                const self = this;
                self.LoadAsync(win['tbLocalScript'].builder_url + '/js/themify.builder.script.js', function () {
                    self.is_builder_loaded = true;
                    ThemifyBuilderModuleJs.loadOnAjax(el, type, isLazy);
                    self.initComponents(el, isLazy);
                }, null, null, function () {
                    return typeof ThemifyBuilderModuleJs !== 'undefined';
                });
            } else {
                this.initComponents(el, isLazy);
            }
        },
        sideMenu(items, options, callback) {
            if (!items || items.length === 0) {
                return;
            }
            if (this.jsLazy['tf_sidemenu'] === und) {
                const self = this;
                this.LoadAsync(this.js_modules.side, function (items, options, callback) {
                    self.jsLazy['tf_sidemenu'] = true;
                    self.trigger('tf_side_menu_init', [items, options, callback]);

                }.bind(null, items, options, callback), null, null, function () {
                    return !!self.jsLazy['tf_sidemenu'];
                });
            } else {
                this.trigger('tf_side_menu_init', [items, options, callback]);
            }
        },
        edgeMenu(menu) {
            const self = this;
            if (this.jsLazy['tf_edgeMenu'] === und) {
                this.jsLazy['tf_edgeMenu'] = true;
                if (doc.getElementsByClassName('sub-menu')[0]) {
                    this.LoadAsync(this.js_modules.edge, function () {
                        self.trigger('tf_edge_menu', [menu]);
                    });
                }
            } else {
                self.trigger('tf_edge_menu', [menu]);
            }
        },
        wayPoints(callback) {
            if (this.jsLazy['wayPoints'] === und) {
                const self = this;
                this.LoadAsync(self.url + '/js/waypoints.min.js', function (callback) {
                    self.jsLazy['wayPoints'] = true;
                    callback();
                }.bind(null, callback), '4.0.0', null, function () {
                    return 'undefined' !== typeof $.fn.waypoint;
                });
            } else {
                callback();
            }
        },
        loadAnimateCss(callback) {
            if (this.cssLazy['animate'] === und) {
                const self = this;
                this.LoadCss(self.css_modules.an, themify_vars['a_v'], null, null, function () {
                    self.cssLazy['animate'] = true;
                    if (callback) {
                        callback();
                    }
                });
            } else if (callback) {
                callback();
            }
        },
        loadWowJs(callback) {
            if (this.jsLazy['tf_wow'] === und || this.cssLazy['animate'] === und) {
                const self = this,
                        check = function () {
                            if (self.cssLazy['animate'] === true && self.jsLazy['tf_wow'] === true && callback) {
                                callback();
                            }
                        };
                if (this.cssLazy['animate'] === und) {
                    this.loadAnimateCss(check);
                }
                if (this.jsLazy['tf_wow'] === und) {
                    this.LoadAsync(this.js_modules.wow, function () {
                        self.jsLazy['tf_wow'] = true;
                        check();
                    }, null, null, function () {
                        return !!self.jsLazy['tf_wow'];
                    });
                }
            } else if (callback) {
                callback();
            }
        },
        sharer(type, url, title) {
            if (this.jsLazy['tf_sharer'] === und) {
                const self = this;
                this.LoadAsync(this.js_modules.share, function () {
                    self.jsLazy['tf_sharer'] = true;
                    self.trigger('tf_sharer_init', [type, url, title]);
                }, null, null, function () {
                    return !!self.jsLazy['tf_sharer'];
                });
            } else {
                this.trigger('tf_sharer_init', [type, url, title]);
            }
        },
        loadDropDown(items, callback, load_stylesheet) {
            if (!items || items.length === 0) {
                return;
            }
            const self = this;
            if (load_stylesheet !== false) {
                this.LoadCss(self.css_modules.drop);
            }
            this.LoadAsync(this.js_modules.drop, function () {
                self.jsLazy['tf_dropdown'] = true;
                self.trigger('tf_dropdown_init', [items]);
                if (callback) {
                    callback();
                }
            }, null, null, function () {
                return !!self.jsLazy['tf_dropdown'];
            });
        },
        initResizeHelper() {
            let running = false,
                    timeout,
                    timer;
            const self = this,
                    ev = 'onorientationchange' in win ? 'orientationchange' : 'resize';
            win.addEventListener(ev, function () {
                if (running) {
                    return;
                }
                running = true;
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function () {
                    if (timer) {
                        cancelAnimationFrame(timer);
                    }
                    timer = requestAnimationFrame(function () {
                        const w = win.innerWidth,
                                h = win.innerHeight;
                        if (h !== self.h || w !== self.w) {
                            const params = {w: w, h: h, type: 'tfsmartresize', 'origevent': ev};
                            self.trigger('tfsmartresize', params);
                            $(win).triggerHandler('tfsmartresize', [params]);
                            self.w = w;
                            self.h = h;
                        }
                        running = false;
                        timer = timeout = null;
                    });
                }, 150);
            }, {passive: true});
        },
        mobileMenu() {
            if (themify_vars.menu_point) {
                const self = this,
                        w = parseInt(themify_vars.menu_point),
                        _init = function (e) {
                            const cl = self.body[0].classList;
                            if ((!e && self.w <= w) || (e && e.w <= w)) {
                                cl.add('mobile_menu_active');
                            } else if (e !== und) {
                                cl.remove('mobile_menu_active');
                            }
                        };
                _init();
                this.on('tfsmartresize', _init);
            }
        },
        initWC(force) {
            if (themify_vars.wc_js) {
                const self = this;
                if (!themify_vars.wc_js_normal) {
                    setTimeout(function () {
                        doc.addEventListener((self.isTouch ? 'touchstart' : 'mousemove'), function () {
                            const fr = doc.createDocumentFragment();
                            for (let i in themify_vars.wc_js) {
                                let link = doc.createElement('link'),
                                        href = themify_vars.wc_js[i];
                                if (href.indexOf('ver', 12) === -1) {
                                    href += '?ver=' + themify_vars.wc_version;
                                }
                                link.as = 'script';
                                link.rel = 'prefetch';
                                link.href = href;
                                fr.appendChild(link);
                            }
                            doc.head.appendChild(fr);
                        }, {once: true, passive: true});
                    }, 1800);
                }
                if (this.jsLazy['tf_wc'] === und) {
                    this.LoadAsync(this.js_modules.wc, function () {
                        self.jsLazy['tf_wc'] = true;
                        self.trigger('tf_wc_init', force);
                    }, null, null, function () {
                        return !!self.jsLazy['tf_wc'];
                    });
                } else {
                    this.trigger('tf_wc_init', force);
                }
            }
        },
        megaMenu(menu, disable) {
            if (menu) {
                if (menu.dataset['init']) {
                    return;
                }
                menu.dataset.init = true;
                const isDisabled = disable || themify_vars.disableMega,
                        self = this,
                        maxW = 1 * themify_vars.menu_point + 1,
                        removeDisplay = function (e) {
                            const el = e instanceof jQuery ? e : this,
                                    w = e instanceof jQuery ? self.w : e.w;
                            if (w > maxW) {
                                el.css('display', '');
                            } else {
                                self.on('tfsmartresize', removeDisplay.bind(el), true);
                            }
                        },
                        closeDropdown = function (e) {
                            const el = e instanceof jQuery ? e : this;
                            if (e.target && !el[0].parentNode.contains(e.target)) {
                                el.css('display', '');
                                el[0].parentNode.classList.remove('toggle-on');
                            } else {
                                doc.addEventListener('touchstart', closeDropdown.bind(el), {once: true});
                            }
                        };
                if (!isDisabled && menu.getElementsByClassName('mega-link')[0]) {
                    const loadMega = function () {
                        const check = function () {
                            if (self.cssLazy['tf_megamenu'] === true && self.jsLazy['tf_megamenu'] === true) {
                                self.trigger('tf_mega_menu', [menu, maxW]);
                            }
                        };
                        if (!self.cssLazy['tf_megamenu']) {
                            self.LoadCss(self.css_modules.mega, null, null, 'screen and (min-width:' + maxW + 'px)', function () {
                                self.cssLazy['tf_megamenu'] = true;
                                check();
                            });
                        }
                        if (!self.jsLazy['tf_megamenu']) {
                            self.LoadAsync(self.js_modules.mega, function () {
                                self.jsLazy['tf_megamenu'] = true;
                                check();
                            });
                        }
                        check();
                    };
                    if (this.w >= maxW || !this.isTouch) {
                        loadMega();
                    } else if (this.isTouch) {
                        const _resize = function () {
                            const ori = typeof this.screen !== 'undefined' && typeof this.screen.orientation !== 'undefined' ? this.screen.orientation.angle : this.orientation,
                                    w = (ori === 90 || ori === -90) ? this.innerHeight : this.innerWidth;
                            if (w >= maxW) {
                                this.removeEventListener('orientationchange', _resize, {passive: true});
                                loadMega();
                            }
                        };
                        win.addEventListener('orientationchange', _resize, {passive: true});
                    }
                } else {
                    if (!self.isTouch) {
                        setTimeout(function () {
                            self.edgeMenu();
                        }, 1500);
                    }
                }
                menu.addEventListener('click', function (e) {
                    if (e.target.classList.contains('child-arrow') || (e.target.tagName === 'A' && (e.target.getAttribute('href') === '#' || e.target.parentNode.classList.contains('themify_toggle_dropdown')))) {
                        let el = $(e.target);
                        if (el[0].tagName === 'A') {
                            if (!el.find('.child-arrow')[0]) {
                                return;
                            }
                        } else {
                            el = el.parent();
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        const li = el.parent();
                        let els = null,
                                is_toggle = und !== themify_vars.m_m_toggle && !li.hasClass('toggle-on') && self.w < maxW;
                        if (is_toggle) {
                            els = li.siblings('.toggle-on');
                            is_toggle = els.length > 0;
                        }
                        if (self.w < maxW || e.target.classList.contains('child-arrow') || el.find('.child-arrow:visible').length > 0) {
                            const items = el.next('div, ul'),
                                    ist = items[0].getAttribute('style'),
                                    headerwrap = doc.getElementById('headerwrap');
                            if (self.w < maxW && (ist === null || ist === '')) {
                                removeDisplay(items);
                            }
                            if (Themify.isTouch && !li.hasClass('toggle-on') && !Themify.body[0].classList.contains('mobile-menu-visible') && (null === headerwrap || (headerwrap.offsetWidth > 400))) {
                                closeDropdown(items);
                                li.siblings('.toggle-on').removeClass('toggle-on');
                            }
                            items.toggle('fast');
                            if (is_toggle) {
                                const slbs = els.find('>div,>ul'),
                                        sst = slbs[0].getAttribute('style');
                                if (self.w < maxW && (sst === null || sst === '')) {
                                    removeDisplay(slbs);
                                }
                                slbs.toggle('fast');
                            }
                        }
                        if (is_toggle) {
                            els.removeClass('toggle-on');
                        }
                        li.toggleClass('toggle-on');
                    }
                });
                menu.dataset.init = true;
            }
        },
        touchDropDown() {
            const menus = doc.querySelectorAll('ul:not(.sub-menu)>.menu-item:first-child');
            for (let i = menus.length - 1; i > -1; --i) {
                let m = menus[i].parentNode,
                        p = m.parentNode;
                if (p.tagName !== 'LI' && !p.classList.contains('sub-menu')) {
                    this.megaMenu(m);
                }
            }
        },
        ajaxSearch(opt) {
            if (opt.el) {
                if (!opt.type) {
                    opt.type = 'dropdown';
                }
                if ('dropdown' === opt.type) {
                    opt.el.autocomplete = 'off';
                }
                const self = this;
                opt.el.addEventListener((opt.type === 'overlay' ? 'click' : 'focus'), function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    let extra_css_loaded = !opt.css;
                    const el = this,
                            type = opt.type,
                            ops = type === 'overlay' ? 'dropdown' : 'overlay',
                            _check = function () {
                                if (self.jsLazy['tf_ajax_search'] && self.cssLazy['tf_search_overlay_' + type] && extra_css_loaded) {
                                    if (true === opt.both && !self.cssLazy['tf_search_overlay_' + ops]) {
                                        return;
                                    }
                                    self.trigger('themify_overlay_search_init', opt);
                                    self.triggerEvent(el, e.type);
                                    opt = null;
                                }
                            };
                    _check();

                    if (true === opt.both && !self.cssLazy['tf_search_overlay_' + ops]) {
                        self.LoadCss(self.url + '/css/modules/search-form-' + ops + '.css', null, null, null, function () {
                            self.cssLazy['tf_search_overlay_' + ops] = true;
                            _check();
                        });
                    }
                    if (!self.cssLazy['tf_search_overlay_' + type]) {
                        self.LoadCss(self.url + '/css/modules/search-form-' + type + '.css', null, null, null, function () {
                            self.cssLazy['tf_search_overlay_' + type] = true;
                            _check();
                        });
                    }
                    if (!self.jsLazy['tf_ajax_search']) {
                        self.LoadAsync(self.url + '/js/modules/ajax-search.js', function () {
                            self.jsLazy['tf_ajax_search'] = true;
                            _check();
                        }, self.v);
                    }
                    if (!extra_css_loaded) {
                        self.LoadCss(opt.css.url, opt.css.v, null, null, function () {
                            extra_css_loaded = true;
                            _check();
                        });
                    }
                }, {once: true});
            }
        },
        stickyBuy() {
            if (win['IntersectionObserver']) {
                const pr_wrap = doc.querySelector('#content .product') || doc.querySelector('.tbp_template.product'),
                        st_buy = doc.getElementById('tf_sticky_buy'),
                        self = this;
                if (st_buy && pr_wrap) {
                    (new win['IntersectionObserver'](function (entries, _self) {
                        if (entries[0].isIntersecting || entries[0].boundingClientRect.top < 0) {
                            _self.disconnect();
                            let loaded = {},
                                    check = function () {
                                        if (loaded['stb'] === true && loaded['stb_t'] === true && loaded['js_stb_t'] === true) {
                                            self.trigger('tf_sticky_buy_init', [pr_wrap, st_buy]);
                                            loaded = null;
                                        }
                                    };
                            self.LoadCss(self.css_modules.stb, null, null, null, function () {
                                loaded['stb'] = true;
                                check();
                            });
                            if (self.css_modules.stb_t) {
                                self.LoadCss(self.css_modules.stb_t, null, null, null, function () {
                                    loaded['stb_t'] = true;
                                    check();
                                });
                            } else {
                                loaded['stb_t'] = true;
                            }
                            self.LoadAsync(self.js_modules.stb, function () {
                                loaded['js_stb_t'] = true;
                                check();
                            });
                        }
                    })).observe(doc.getElementById('tf_sticky_buy_observer'));
                }
            }
        },
        loadWPEmbed(items) {
            if (items instanceof jQuery) {
                items = items.get();
            } else if (items.length === und) {
                items = [items];
            }
            if (items[0] !== und) {
                const embeds = [];
                for (let i = items.length - 1; i > -1; --i) {
                    if (!items[i].hasAttribute('data-done') && items[i].tagName === 'IFRAME') {
                        items[i].setAttribute('data-done', 1);
                        embeds.push(items[i]);
                    }
                }
                if (embeds[0] !== und) {
                    const self = this;
                    this.LoadAsync(themify_vars.wp_embed, function () {
                        for (let i = embeds.length - 1; i > -1; --i) {
                            let secret = embeds[i].getAttribute('data-secret');
                            if (!secret) {
                                secret = Math.random().toString(36).substr(2, 10);
                                embeds[i].setAttribute('data-secret', secret);
                            }
                            if (!embeds[i].hasAttribute('src')) {
                                embeds[i].setAttribute('src', embeds[i].getAttribute('data-tf-src'));
                            }
                            win.wp.receiveEmbedMessage({data: {message: 'height', value: self.h, secret: secret}, source: embeds[i].contentWindow});
                        }
                    }, themify_vars.wp, null, function () {
                        return 'undefined' !== typeof win.wp && 'undefined' !== typeof win.wp.receiveEmbedMessage;
                    });
                }
            }
        },
        checkLargeImages(el){
            if(themify_vars['lgi']!==und || this.is_builder_active===true){
                let self=this;
                setTimeout(function () {
                        self.requestIdleCallback(function () {
                            if(el instanceof jQuery){
                                el=el[0];
                            }
                            let p=el?el:doc,
                                items = p.querySelectorAll('.tf_large_img:not(.tf_large_img_done)'),
                                len=items.length;
                                if(len===0 && el && el.tagName==='IMG' && el.classList.contains('tf_large_img') && !el.classList.contains('tf_large_img_done')){
                                    len=1;
                                    items=[el];
                                }
                            if(len>0){
                                    for(let i=len-1;i>-1;--i){
                                        items[i].className+=' tf_large_img_done';
                                    }
                                    self.LoadAsync(self.url + '/js/modules/large-images-alert.min.js', function () {
                                            self.jsLazy['tf_large_images']=true;
                                            self.trigger('tf_large_images_init', items);
                                            self=items=null;
                                    }, null, null, function () {
                                            return !!self.jsLazy['tf_large_images'];
                                    });
                            }
                        });
                },1000);
            }
        }
    };
    Themify.Init();

}(window, document, undefined, jQuery));
