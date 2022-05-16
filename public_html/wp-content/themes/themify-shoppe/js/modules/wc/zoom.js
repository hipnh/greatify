/**
 * Module Product Zoom
 */
;
(function($,document,Themify){
    'use strict';
    const _init = function(el,e){
	
        const $this = $(el);
		el.classList.add('zoom_progress');
		Themify.imagesLoad(el,function(){
			$(el).zoom({
					on: 'click',
					url:el.getAttribute('data-zoom-image'),
					callback: function () {
						$(el).trigger('click.zoom',e);
						el.classList.remove('zoom_progress');
					},
					onZoomIn: function () {
						$this.addClass('zoomed');
					},
					onZoomOut: function () {
						$this.removeClass('zoomed');
					}
			});
		})
    };
    Themify.on('themify_theme_product_zoom',function(items,e){
		Themify.LoadAsync(themify_vars.theme_url + '/js/modules/wc/jquery.zoom.min.js', function(){
			_init(items,e);
		}, '1.7.21', null, function () {
			return 'undefined' !== typeof $.fn.zoom;
		});
    });
})(jQuery,document,Themify);