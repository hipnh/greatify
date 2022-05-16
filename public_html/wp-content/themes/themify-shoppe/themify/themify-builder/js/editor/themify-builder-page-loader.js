'use strict';
;( function() {

	/* loading spinner icon */
	let style = document.createElement( 'style' );
	style.innerText = ".tbbp_spinner{margin:-20px 0 0 -20px;width:62px;height:62px;background-color:rgba(0,0,0,.6);border-radius:50%;box-sizing:border-box;position:fixed;top:50%;left:50%;z-index:100001;line-height:62px}.tbbp_spinner:before{width:80%;height:80%;border:5px solid transparent;border-top-color:#fff;border-radius:50%;box-sizing:border-box;position:absolute;top:10%;left:10%;content:'';animation:circle-loader 1.4s infinite linear}@keyframes circle-loader{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}";
	Themify.body[0].appendChild( style );

	window.addEventListener( 'load', () => {
		let links = document.querySelectorAll( 'a[href="#tb_builder_page"]' ),
			spinner = document.createElement( 'div' );
		spinner.style.display = 'none';
		spinner.classList.add( 'tbbp_spinner' );
		document.body.appendChild( spinner );
		for ( let i = 0; i < links.length; i++ ) {
			links[ i ].addEventListener( 'click', ( e ) => {
				e.preventDefault();
				if ( window.ThemifyBuilderPage ) {
					ThemifyBuilderPage.showPanel();
				} else {
					spinner.style.display = 'block';
					let script = document.createElement( 'script' );
					script.onload = function() {
						ThemifyBuilderPage.spinner = spinner;
						ThemifyBuilderPage.run();
					}
					script.src = tbBuilderPage.script;
					Themify.body[0].appendChild( script );
				}
			} );
		}
	}, { passive: true } );
} )();