/**
 * option module
 */
;
(function ($,Themify) {
    'use strict';
    const _captcha = function (el) {
        const sendForm = function(form){
                const data = new FormData(form),
                    recaptcha_rsp = form.querySelector('[name="g-recaptcha-response"]');
                //data.append("action", "tb_optin_subscribe");
                if (recaptcha_rsp!==null) {
                    data.append("contact-recaptcha", recaptcha_rsp.value);
                }
                $.ajax( {
                    url : form.getAttribute('action'),
                    method: 'POST',
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: data,
                    success : function( resp ) {
                        if ( resp.success ) {
                            if ( form.dataset.success === 's1' ) {
                                window.location.href = resp.data.redirect;
                            } else {
                                $(form).fadeOut().closest( '.module' ).find( '.tb_optin_success_message' ).fadeIn();
                            }
                        } else {
                            window.console && console.log( resp.data.error );
                        }
                    },
                    complete : function() {
                        form.classList.remove( 'processing' );
                        if ( typeof grecaptcha === 'object' && form.find( '.themify_captcha_field' ).data( 'ver' ) === 'v2' ) {
                            grecaptcha.reset();
                        }
                    }
                } );
            },
            callback = function (el) {
                if (!Themify.is_builder_active) {
                    el.addEventListener('submit',function(e){
                        e.preventDefault();
                        const form = this;
                        if (form.classList.contains('processing')) {
                            return false;
                        }
                        form.className+=' processing';
                        const cp = el.getElementsByClassName('themify_captcha_field')[0];
                        if( typeof cp !== 'undefined' && 'v3' === cp.dataset['ver'] && typeof grecaptcha !== 'undefined'){
                            grecaptcha.ready(function() {
                                grecaptcha.execute(cp.dataset['sitekey'], {action: 'captcha'}).then(function(token) {
                                    const inp = document.createElement('input');
                                    inp.type='hidden';
                                    inp.name='g-recaptcha-response';
                                    inp.value=token;
                                    form.insertBefore(inp, form.firstChild);
                                    sendForm(form);
                                });
                            });
                        }else{
                            sendForm(form);
                        }
                    });
                }
            },
            cp = el.getElementsByClassName('themify_captcha_field')[0];
        if (cp && typeof grecaptcha === 'undefined') {
            const key=cp.getAttribute('data-sitekey');
            if(key){
                let url = 'https://www.google.com/recaptcha/api.js';
                if( 'v3' === cp.getAttribute('data-ver')){
                    url+='?render='+key;
                }
                Themify.LoadAsync(url, callback.bind(null,el), false, true, function () {
                    return typeof grecaptcha !== 'undefined';
                });
            }
        }
        else {
            callback(el);
        }
    };
    Themify.on('builder_load_module_partial', function(el,type,isLazy){
        if(isLazy===true && !el[0].classList.contains('module-optin')){
            return;
        }
        const forms = Themify.selectWithParent('tb_optin_form',el);
        if(forms[0]){
            Themify.requestIdleCallback(function(){
                _captcha(forms[0]);
            },300);
        }
    });
}(jQuery,Themify));
