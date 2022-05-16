;(function (Themify,document) {
    
    let curX, 
        curY, 
        req=null;

    const _ENTER_= Themify.isTouch ? 'touchstart' : 'mouseenter',
        _MOVE_= Themify.isTouch ? 'touchmove' : 'mousemove',
        _LEAVE_= Themify.isTouch ? 'touchend' : 'mouseleave',
        wrap = document.createElement( 'div' ),
        callback = function( e ) {
            if(req!==null){
                cancelAnimationFrame(req);
            }
            req=requestAnimationFrame(function(){
                let x = Themify.isTouch ? e.touches[0].clientX : e.clientX,
                    y = Themify.isTouch ? e.touches[0].clientY : e.clientY;
                if ( curX !== x || curY !== y ) {
					curX = x;
					curY = y;
					wrap.style.left = x + 'px';
					wrap.style.top = y + 'px';
					wrap.classList.toggle('left',(x > Themify.w / 2));
					wrap.classList.toggle('top',(y > Themify.h / 2));
                }
            });
        };

    wrap.style.display = 'none';
    wrap.className = 'tb_tooltip_wrap';
    Themify.body[0].appendChild( wrap );

    Themify.LoadCss( ThemifyBuilderModuleJs.cssUrl + 'tooltip.css' );

    Themify.on( 'tb_tooltip_init', function( items ) {
        const fr=document.createDocumentFragment();
        for ( let i = items.length - 1; i > -1 ; --i ) {
			let item=items[i],
				parent = item.parentNode,
				cl=parent.classList,
				order = 1; /* order controls display order of tooltips when multiple elements are applicable. 1 is for modules, highest priority */
			if(cl.contains( 'module_row' )){
				order=5;
			}
			else if(cl.contains( 'tb-column')){
				order=4;
			}
			else if(cl.contains( 'module_subrow')){
				order=3;
			}
			else if(cl.contains( 'sub_column' )){
				order=2;
			}
			item.classList.add( 'order-' + order);
			parent.addEventListener( _ENTER_, function( e ) {
				item.classList.add( 'tb_show' );
				callback( e );

				parent.addEventListener( _MOVE_, callback, { passive : true } );
				/* on touch devices, untapping anywhere on screen should hide the tooltips */
				( Themify.isTouch ? Themify.body[0] : parent ).addEventListener( _LEAVE_, function() {
					parent.removeEventListener( _MOVE_, callback );
					item.classList.remove( 'tb_show' );
				}, { once : true, passive : true } );
			}, { passive : true } );
			fr.appendChild( item );
			item.classList.remove( 'tf_hide' );
        }
        wrap.appendChild(fr);
        wrap.style.display = '';
    } );

} )( Themify, document );