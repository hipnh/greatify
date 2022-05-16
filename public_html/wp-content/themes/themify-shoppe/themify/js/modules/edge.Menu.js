/**
 *Edge menu module
 */
;
(function ($, document,window) {
    const mouseEnter=function (e) {
            /* prevent "edge" classname being removed by mouseleave event when flipping through menu items really fast */
            const timeout= this.getAttribute('data-edge_menu_t');
            if(timeout){
                window.clearTimeout(timeout);
            }
            const elm = $('ul:first', this);
            if ((elm.offset().left+elm.width()) > Themify.w) {
                this.classList.add('edge');
            }
        },
        mouseLeave=function (e) {
            if(e.target.closest('.edge')){
                return;
            }
            const t = setTimeout(function () {
                this.classList.remove('edge');
            }.bind(this), 300);
            this.setAttribute('data-edge_menu_t', t);
        },
        apply=function(items){
            let link=null;
            for(let i=items.length-1;i>-1;--i){
                if(items[i].getElementsByTagName('ul')[0]){
                    items[i].addEventListener('mouseenter',mouseEnter,{passive:true});
                    items[i].addEventListener('mouseleave',mouseLeave,{passive:true});
                    $(items[i]).on('dropdown_open',mouseEnter).on('dropdown_close',mouseLeave);
                    /* tab keyboard menu nav */
                    link = items[i].firstChild;
                    if('A'===link.tagName){
                        link.addEventListener('focus',mouseEnter.bind(items[i]),{passive:true});
                        link.addEventListener('blur',mouseLeave.bind(items[i]),{passive:true});
                    }
                }
            }
        },
        init=function (menu){
            if(menu===null || menu.dataset['edge']){
                return;
            }
            menu.dataset['edge']=true;
            apply(menu.getElementsByTagName('li'));
        };
    Themify.on('tf_edge_menu', function (el) {
        if(el===undefined){
            init(document.getElementById('main-nav'));
            init(document.getElementById('footer-nav'));
        }else{
            init(el);
        }
    });
})(jQuery,document, window);