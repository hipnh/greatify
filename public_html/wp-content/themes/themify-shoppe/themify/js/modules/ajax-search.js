/**
 * Ajax Dropdown Search form module
 */
;
(function(Themify){
    'use strict';
    const _init = function(opt){
        const cache = [],
            input = 'overlay' === opt.type ? opt.container.querySelector('#searchform input') : opt.el;
        let working, result_wrapper,controller;

        if('overlay' === opt.type){
            result_wrapper = opt.container.getElementsByClassName('search-results-wrap')[0];
            const overlayCallback = function(){
                    opt.container.classList.toggle('search-active', input.value.length > 0);
                },
                close = opt.container.getElementsByClassName('close-search-box')[0];
            opt.el.addEventListener('click', function(e){
                e.preventDefault();
                overlayCallback();
                opt.container.classList.add('tf_fd_in');
                input.focus();
                Themify.body[0].style.overflowY = 'hidden';
                Themify.body[0].classList.add('searchform-slidedown');
            });
            if(close){
                close.addEventListener('click', function(e){
                    e.preventDefault();
                    overlayCallback();
                    if(working){
                        controller.abort();
                    }
                    opt.container.classList.remove('tf_fd_in');
                    Themify.body[0].style.overflowY = '';
                    Themify.body[0].classList.remove('searchform-slidedown');
                });
            }
        }else if('dropdown' === opt.type){
            opt.container.classList.add('tf_rel', 'tf_s_dropdown');
            opt.container.insertAdjacentHTML('beforeend', '<div class="search-results-wrap tf_ajax_s_dropdown tf_scrollbar" style="display:none"></div>');
            result_wrapper = opt.container.getElementsByClassName('search-results-wrap')[0];
            input.addEventListener('blur', function(e){
                if(e.relatedTarget && null !== e.relatedTarget.closest('.search-results-wrap')){
                    return;
                }
                result_wrapper.style.display = 'none';
            }, {passive:true});

        }
        if(result_wrapper){
            // Tab click event
            const set_tab = function(target){
                let href = target.getAttribute('href').replace('#', '');
                if(href === 'all'){
                    href = 'item';
                }else{
                    const all = result_wrapper.getElementsByClassName('result-item');
                    for(let k = all.length - 1; k > -1; k--){
                        all[k].classList.remove('tf_fd_in');
                        all[k].classList.add('tf_fd_out');
                    }
                    setTimeout(function(){
                        for(let k = all.length - 1; k > -1; k--){
                            all[k].classList.add('tf_hide');
                        }
                    }, 400);
                }
                const item = result_wrapper.querySelector('#result-link-' + href);
                if(item){
                    const all_b = document.getElementsByClassName('view-all-button')[0];
                    if(all_b){
                        all_b.style.display = 'none';
                    }
                    item.style.display = '';
                }
                const founds = result_wrapper.getElementsByClassName('result-' + href);
                setTimeout(function(){
                    if(!founds[0]){
                        return;
                    }
                    for(let k = founds.length - 1; k > -1; k--){
                        founds[k].classList.remove('tf_hide', 'tf_fd_out');
                        founds[k].classList.add('tf_fd_in');
                    }
                }, 401);
                const li = target.closest('li');
                li.classList.add('active');
                Array.prototype.filter.call(li.parentNode.children, function(child){
                    if('LI' === li.tagName && child !== li){
                        child.classList.remove('active');
                    }
                });
                if('dropdown' === opt.type){
                    input.focus();
                }
            };
            result_wrapper.addEventListener('click', function(e){
                const target = e.target;
                if(target.tagName === 'A' && target.closest('.search-option-tab')){
                    e.preventDefault();
                    set_tab(target);
                }
            });

            // Search input Ajax event
            input.autocomplete = "off";
            const get_element_index = function(node){
                    if(null === node){
                        return 0;
                    }
                    let index = 0;
                    while((node = node.previousElementSibling)){
                        index++;
                    }
                    return index;
                },
                set_active_tab = function(index){
                    if(index < 0){
                        index = 0;
                    }
                    const li = result_wrapper.querySelectorAll('.search-option-tab li');
                    if(li[index]){
                        set_tab(li[index].querySelector('a'));
                    }
                    result_wrapper.style.display = '';
                }
            input.addEventListener('keyup', function(e){
                if(this.value.length > 0){
                    opt.container.classList.add('search-active');
                }else{
                    opt.container.classList.remove('search-active');
                    result_wrapper.style.display = 'none';
                }
                if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 8 || e.keyCode === 229){
                    let v = this.value.trim();
                    if(v){
                        const index = get_element_index(result_wrapper.querySelector('.search-option-tab li.active'));
                        if(cache[v]){
                            result_wrapper.style.display = 'none';
                            result_wrapper.innerHTML = cache[v];
                            set_active_tab(index);
                            return;
                        }
                        setTimeout(function(){
                            v = input.value.trim();
                            if(working){
                                controller.abort();
                            }
                            if(!v){
                                result_wrapper.innerHTML = '';
                                return;
                            }

                            const request = new Headers({
                                    'Accept':'application/json',
                                    'X-Requested-With':'XMLHttpRequest'
                                }),
                                data = new FormData();
                            data.append('action', 'themify_search_autocomplete');
                            data.append('s', v);
                            data.append('post_type', opt.post_type ? opt.post_type : '');
                            if(opt.term){
                                data.append('term', opt.term);
                                data.append('tax', opt.tax);
                            }
                            opt.container.classList.add('themify-loading');
                            working = true;
                            controller = new AbortController();
                            fetch(themify_vars.ajax_url, {signal:controller.signal,method:'POST', headers:request, body:data})
                                .then(function(response){
                                    return response.text();
                                })
                                .then(resp => {
                                    if(!v){
                                        result_wrapper.innerHTML = '';
                                    }else if(resp){
                                        result_wrapper.style.display = 'none';
                                        result_wrapper.innerHTML = resp;
                                        set_active_tab(index);
                                        cache[v] = resp;
                                    }
                                    opt.container.classList.remove('themify-loading');
                                    working = false;
                                }).catch(err => {
                                    if (err.name !== 'AbortError') {
                                        console.error('Uh oh, an error!', err);
                                    }
                                });
                        }, 100);
                    }else{
                        result_wrapper.innerHTML = '';
                    }
                }
            }, {passive:true});
        }
    }
    Themify.on('themify_overlay_search_init', function(opt){
        _init(opt);
    });
})(Themify);
