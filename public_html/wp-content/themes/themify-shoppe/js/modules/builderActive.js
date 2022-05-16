/* Themify Theme Builder Active Module*/
;
(function ($,Themify,document,themify_vars) {
    'use strict';
	const modules = ['contact','product-categories','image','optin','pro-slider','fancy-heading','products'],
		st_url=themify_vars.theme_url+'/styles/modules/builder/',
		v=themify_vars.theme_v,
		mainCss=document.getElementById('themify_concate-css'),
		init=function(){
			for(let i=modules.length-1;i>-1;--i){
				if((modules[i]==='products' && document.getElementsByClassName('wc-products')[0])|| (document.getElementsByClassName('module-'+modules[i])[0])){
                                    if(modules[i]==='products' && document.querySelector('.wc-products.list-thumb-image,.wc-products.grid2-thumb')===null ){
                                        continue;
                                    }
                                    Themify.LoadCss(st_url+modules[i]+'.css',v,mainCss);
                                    modules.splice(i,1);
				}
			}
		};
	Themify.on('builder_load_module_partial',init);
	init();
	
})(jQuery,Themify,document,themify_vars);