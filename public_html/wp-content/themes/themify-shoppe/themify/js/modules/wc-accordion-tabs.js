/**
 * WC Accordion tab
 */
;
(function ($,Themify) {
	'use strict';
	const _clicked = function(e){
		e.preventDefault();
		e.stopPropagation();
		const li = this.closest('li'),
			content=li.querySelector('.tf_wc_acc_content');
		if(li.classList.contains('active')){
			li.classList.remove('active');
			$(content).slideUp();
		}else{
			const active=li.parentNode.querySelector('.active');
			if(active){
				active.classList.remove('active');
				$(active.querySelector('.tf_wc_acc_content')).slideUp();
			}
			li.className+=' active';
			$(content).slideDown();
		}
		$(window).triggerHandler( 'resize' );
	}
	Themify.on('tf_wc_acc_tabs_init', function(wrap){
		const titles = wrap.querySelectorAll('.tf_wc_acc_title');
		for(let i = titles.length-1;i>-1;i--){
			titles[i].addEventListener('click',_clicked);
		}
	},true);
})(jQuery,Themify);
