(function ( Themify, document) {
    'use strict';
    function tf_meta_options_loader(){
        const el = document.getElementById('wp-admin-bar-themify-page-options');
        if(el){
            el.addEventListener('click',function(e){
                e.preventDefault();
                let loaded={},
                    checkLoad=function(){
                        if(loaded['pgopt_css']===true && loaded['pgopt_js']===true){
                            Themify.trigger('tf_page_options_init',[el]);
                            loaded=null;
                        }
                    };
                Themify.LoadCss(Themify.css_modules.pgopt,null,null,null,function(){
                    loaded['pgopt_css']=true;
                    checkLoad();
                });
                Themify.LoadAsync(Themify.js_modules.pgopt, function () {
                    loaded['pgopt_js']=true;
                    checkLoad();
                }, null, null, function () {
                    return 'undefined' !== typeof ThemifyPageOptions;
                });
            },{once:true});
        }
    }
    if (document.readyState === 'complete') {
        tf_meta_options_loader();
    } else {
        window.addEventListener('load', tf_meta_options_loader, {once:true, passive:true});
    }
}(Themify, document));
