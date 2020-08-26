function initElements(element) {
	var $element = $(typeof(element) != 'undefined' ? element : 'body');

	$(window).on('resize', function(){
		onResize();
	});

	$(window).on('scroll', function(e) {
		onScroll();
	});

	$.widget('app.selectmenu', $.ui.selectmenu, {
		_drawButton: function() {
		    this._super();
		    var selected = this.element
		    .find('[selected]')
		    .length,
		        placeholder = this.options.placeholder;

		    if (!selected && placeholder) {
		      	this.buttonItem.text(placeholder).addClass('placeholder');
		    } else {
		    	this.buttonItem.removeClass('placeholder');
		    }
		}
	});

	$.datepicker.regional['ru']={
           closeText: 'Закрыть',
           prevText: '&#x3c;Пред',
           nextText: 'След&#x3e;',
           currentText: 'Сегодня',
           monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
           monthNamesShort: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
           dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
           dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
           dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
           weekHeader: 'Нед',
           dateFormat: 'dd.mm.yy',
           firstDay: 1,
           isRTL: false,
           showMonthAfterYear: false,
           yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['ru']);

	$element.find('select').each(function(i, select) {
		// editable select
		if (typeof($(select).attr('editable')) != 'undefined' && $(select).attr('editable') !== 'false') {
			$(select).editableSelect({ 
				effects: 'fade',
				source: $(select).attr('source') ? $(select).attr('source') : false
			});

		// simple select
		} else {
			if ($(select).offset().left + 370 > $(window).width()) {
				$(select).attr('data-pos', 'right');
			}

			var offset = $(select).attr('data-offset');
			if ($(select).attr('data-pos') == 'right') {
				var data = {
					position: {my : "right"+(offset?"+"+offset:"")+" top-2", at: "right bottom"}
				}
			} else {
				var data = {
					position: {my : "left"+(offset?"+"+offset:"")+" top-2"}
				}
			}
			if (typeof($(select).attr('placeholder')) != 'undefined') {
				data['placeholder'] = $(select).attr('placeholder');
			}
			data['change'] = function(e, ui) {
				$(ui.item.element).closest('.input-holder').addClass('focused');
			}
			data['appendTo'] = $(select).parent();
			$(select).selectmenu(data);
			if (typeof($(select).attr('placeholder')) != 'undefined') {
				$(select).prepend('<option value="" disabled selected>' + data['placeholder'] + '</option>');
			}
		}
	});

	$element.find('.js-date').each(function(index,input){
		var datepicker_options = {
			inline: true,
			language: 'ru',
		    changeYear: true,
		    changeMonth: true,
		    showOtherMonths: true
		};
		var minYear=$(input).attr('data-min-year');
		if(minYear) datepicker_options.minDate='01.01.'+minYear;
		else minYear='c-10';
		var maxYear=$(input).attr('data-max-year');
		if(maxYear) datepicker_options.maxDate='01.01.'+maxYear;
		else maxYear='c+10';
		var defaultDate=$(input).attr('data-default-date');
		if(defaultDate) datepicker_options.defaultDate=defaultDate;
		datepicker_options.yearRange=[minYear,maxYear].join(':');
		
		$(input).attr('type','text').datepicker(datepicker_options).addClass('date').val($(input).attr('value')).after('<i></i>');
		$(input).next('i').click(function() {
			$(this).prev('input').datepicker('show');
			//initElements($('#ui-datepicker-div'));
		});
	});

	$element.find('input[type="checkbox"], input[type="radio"]').checkboxradio();

	$element.find('.file-upload').each(function(index, block) {
		$(block).find('.label').click(function(e){
			e.preventDefault();
		});
	});

	$element.find('.modal-close, .close-btn, .modal .js-cancel').click(function(e) {
		e.preventDefault();
		e.stopPropagation();

		/*
		if ($element.find('.modal-wrapper:visible').length > 1) {
			$element.find('.modal-wrapper[data-transparent]').stop().animate({'opacity': 1}, __animationSpeed);
			hideModal(this, true);
		} else {
			hideModal(this, false);
		}
		*/
		hideModal(this, false);
	});

	$element.find('.tabs, .js-tabs').lightTabs();

	$element.find('.js-scroll').each(function(index, block) {
		if (!$(block).attr('data-on-demand')) {
			scrollInit(block);
		}
	});

	$('body').mouseup(function(e) {
		if ($('#modal-fadeout').css('display') == 'block') {
			if (!$(e.target).closest('#modal-fadeout').length
				&& !$(e.target).closest('.modal-wrapper').length) {
				$('#modal-close').click();
			}			
		}

	}).keyup(function(e) {
		if (!e) e = window.event;
		var key = e.keyCode || e.which;

		if ($('#modal-fadeout').css('display') == 'block') {
			if (key == 27) {
				$('#modal-close').click();
			}
		}
	});

	$element.find('.input-holder input, .input-holder textarea').on('input', function() {
		if ($(this).val()) {
			$(this).parent('.input-holder').addClass('focused');
		} else {
			$(this).parent('.input-holder').removeClass('focused');
		}
	}).focusout(function() {
		if (!$(this).val()) {
			$(this).parent('.input-holder').removeClass('focused');
		}
	}).each(function(i, item) {
		if ($(item).val()) {
			$(item).parent('.input-holder').addClass('focused');
		}
	});

	$element.find('textarea.js-autoheight').each(function(i, textarea) {
		if (!$(textarea).data('autoheight-inited')) {
			$(textarea).attr('rows', 1);
			$(textarea).on('input', function() {
				$(this).css('height', 'auto');
        		if ($(this)[0].scrollHeight > 0) $(this).css('height', $(this)[0].scrollHeight+'px');
			});
			if ($(textarea).css('display') != 'none') $(textarea).trigger('input');
			$(textarea).data('autoheight-inited', true);
		}
	});

	fadeoutInit();
}

var resizeCallbacks = [
];
function onResize() {
	__isMobile = ($(window).width() <= __widthMobile);
	__isMobileDesktopSmall = ($(window).width() <= __widthMobileDesktopSmall);
	__isMobileTablet = ($(window).width() <= __widthMobileTablet);
	__isMobileTabletMiddle = ($(window).width() <= __widthMobileTabletMiddle);
	__isMobileTabletSmall = ($(window).width() <= __widthMobileTabletSmall);
	__isMobileSmall = ($(window).width() <= __widthMobileSmall);

	fadeoutInit();

	$.each(resizeCallbacks, function(i, func) {
		func();
	});
}

var scrollCallbacks = [
];
$(this).data('st', $(window).height());
function onScroll() {
	var st = $(this).scrollTop();
	var ds = st - $(this).data('st');
	$(this).data('st', st);
	$.each(scrollCallbacks, function(i, func) {
		func(st, ds);
	});
}

function parseUrl(url) {
	if (typeof(url) == 'undefined') url=window.location.toString();
	var a = document.createElement('a');
	a.href = url;

	var pathname = a.pathname.match(/^\/?(\w+)/i);	

	var parser = {
		'protocol': a.protocol,
		'hostname': a.hostname,
		'port': a.port,
		'pathname': a.pathname,
		'search': a.search,
		'hash': a.hash,
		'host': a.host,
		'page': pathname?pathname[1]:''
	}		

	return parser;
} 

function changeScale(element, newScale) {
	if (element.style.transform.length == 0) element.style.transform = 'scale(' + newScale + ')';
    else element.style.transform = element.style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(' + newScale + ')');
}

function getVMax() {
	return Math.max($(window).width(), $(window).height());
}

// x - right position
// y - top position
// w - width
// h - height
// s - scale 1 or 0
function posModalFadeout(x, y, w, h, s) {
	var $fadeout = $('#modal-fadeout');
	if (x == 'init' || y == 'init' || w == 'init' || h == 'init') {
		var covered = $fadeout.data('covered');
		var mf_size = covered ? getVMax() * __modalFadeoutSizeCoef : $(window).height() * __modalFadeoutSizeCoef;

		if (x == 'init') x = -mf_size / 2;
		if (y == 'init') y = -mf_size / 2;
		if (w == 'init') w = mf_size;
		if (h == 'init') h = mf_size;
	}

	if (x && y) {
		$fadeout.css({
			'right': x,
			'top': y
		});
	}
	if (w && typeof(w) == 'number') {
		$fadeout.width(w);
	}
	if (h && typeof(h) == 'number') {
		$fadeout.height(h);
	}
	scaleModalFadeout(s);	
}
function scaleModalFadeout(scale) {
	changeScale($('#modal-fadeout').get(0), scale);
}

function syncModalFadeout() {
	var $fadeout = $('#modal-fadeout');
	var opened = $fadeout.data('opened');
	var covered = $fadeout.data('covered');
	var context = $fadeout.data('context');
	var mf_size = covered ? getVMax() * __modalFadeoutSizeCoef : $(window).height() * __modalFadeoutSizeCoef;

	if (context) {
		var contextOffset = context.getBoundingClientRect();

		posModalFadeout(
			($(window).width() - contextOffset.left - $(context).outerWidth() / 2) - mf_size / 2,
			contextOffset.top + $(context).outerHeight() / 2 - mf_size / 2, 
			'init', 
			'init', 
			opened ? 1 : 0);

	} else {
		posModalFadeout('init', 'init', 'init', 'init', opened ? 1 : 0);
	}	
}

function openModalFadeout(covered, context) {
	var $fadeout = $('#modal-fadeout');
	if (covered) $fadeout.data('covered', 1);
	else $fadeout.removeData('covered');
	if (context) $fadeout.data('context', context);
	else $fadeout.removeData('context');
	syncModalFadeout();

	$fadeout.data('opened', 1);
	scaleModalFadeout(1);
}

function closeModalFadeout() {
	var $fadeout = $('#modal-fadeout');
	var covered = $fadeout.data('covered');
	var mf_size = covered ? getVMax() * __modalFadeoutSizeCoef : $(window).height() * __modalFadeoutSizeCoef;

	$fadeout.data('opened', 0);
	scaleModalFadeout(0);
}

function showModal(modal_id, context) {
	var $modal = $('#' + modal_id);

	$('.modal-wrapper:visible').not($modal).attr('data-transparent', true).stop().animate({'opacity': 0}, __animationSpeed, function() {
		$(this).hide().css('opacity', 1);
	});

	var display = __isMobileTablet ? 'block' : 'table';

	openModalFadeout(true, context);
	$('#modal-close').stop().fadeTo(__animationSpeed, 0.65);

	$modal.stop().fadeIn(450).css({
		'display': display,
		'top': $(window).scrollTop()
	});

    var oversize = $(window).height() < $modal.find('.contents').outerHeight(true);

	if ($modal.attr('data-long') || oversize) {
		$('html').addClass('html-modal-long');

		if (oversize) {
			var modalHeight = $modal.outerHeight();
			$('#layout').data('scrollTop', $(window).scrollTop()).addClass('js-modal-overflow').height(modalHeight);
			$modal.css('top', 0);
			$('html,body').scrollTop(0);
		}
	} else {
		$('html').addClass('html-modal');
	}

	$modal.find('.js-scroll').each(function(index, block) {
		scrollInit(block);
	});
}

function hideModal(sender, onlyModal) {
	var $modal = sender ? $(sender).closest('.modal-wrapper') : $('.modal-wrapper:visible');
	if (typeof(onlyModal) == 'undefined' || !onlyModal) {
		closeModalFadeout();
		if ($('#layout').data('scrollTop')) {
			var savedScrollTop =$('#layout').data('scrollTop');
			$('#layout').removeClass('js-modal-overflow').height('auto').removeData('scrollTop');
			$('html,body').scrollTop(savedScrollTop);
		}
		$modal.stop().fadeOut(450, function() {
			$('html').removeClass('html-modal html-modal-long');
		});
	} else {
		$modal.stop().fadeOut(450);
	}
}

/*
function closeModal(sender) {
	if ($('.modal-wrapper:visible').length > 1) {
		$('.modal-wrapper[data-transparent]').stop().animate({'opacity': 1}, __animationSpeed);
		hideModal(sender, true);
	} else {
		hideModal(sender, false);
	}
}
*/

function scrollInit(block) {
	if (!$(block).data('inited')) {
		var maxHeight = $(block).attr('data-max-height');
		if (maxHeight < 0) maxHeight = $(block).parent().height() - Math.abs(maxHeight);
		if (maxHeight && $(block).outerHeight() > maxHeight) {
			$(block).css('max-height', maxHeight + 'px').jScrollPane({
					showArrows: false,
					mouseWheelSpeed: 20,
					autoReinitialise: true,
					verticalGutter: 0,
					verticalDragMinHeight: 36
				}
			);
		}
		$(block).data('inited', true);
	}
}

function fadeoutInit(node) {
	var $node = $(typeof(node) == 'undefined' ? 'body' : node);
	$node.find('.js-fadeout').each(function(i, block) {
		if (!$(block).data('inited')) {
			var $holder = $('<div class="fadeout-holder"></div>').insertAfter($(block));
			$holder.html($(block));
			$(block).data('inited', true);
		}

		if (typeof($(block).attr('data-nowrap')) != 'undefined' && $(block).attr('data-nowrap') != false && $(block).attr('data-nowrap') != 'false') {
			$(block).addClass('nowrap');
		}
		$(block).scrollLeft(0);
		var w_child = 0;
		var range = document.createRange();

		$.each(block.childNodes, function(i, node) {
			if (node.nodeType != 3) {
				w_child += $(node).outerWidth(true);
			} else {
				if (typeof(range) != 'undefined') {
					range.selectNodeContents(node);
					var size = range.getClientRects();
					if (typeof(size) != 'undefined' && typeof(size[0]) != 'undefined' && typeof(size[0]['width'] != 'undefined')) w_child += size[0]['width'];
				}
			}
		});

		var maxWidth = $(block).attr('data-max-width');
		var cloneWidth = $(block).attr('data-clone-width');
		var mobileOnly = $(block).attr('data-mobile-only');

		if (!mobileOnly || (mobileOnly && ($(window).width() <= maxWidth))) {
			if (cloneWidth) {
				$(block).width($(cloneWidth).width());
			}
			var holderWidth = $(block).width();
			if (w_child > holderWidth && (!maxWidth || $(window).width() <= maxWidth)) {
				$(block).addClass('fadeout').removeClass('nowrap').swipe({
					swipeStatus: function(event, phase, direction, distance) {
						var offset = distance;

						if (phase === $.fn.swipe.phases.PHASE_START) {
							var origPos = $(this).scrollLeft();
							$(this).data('origPos', origPos);

						} else if (phase === $.fn.swipe.phases.PHASE_MOVE) {
							var origPos = $(this).data('origPos');

							if (direction == 'left') {
								var scroll_max = $(this).prop('scrollWidth') - $(this).width();
								var scroll_value_new = origPos - 0 + offset;
								$(this).scrollLeft(scroll_value_new);
								if (scroll_value_new >= scroll_max) $(this).addClass('scrolled-full');
								else $(this).removeClass('scrolled-full');

							} else if (direction == 'right') {
								var scroll_value_new = origPos - offset;
								$(this).scrollLeft(scroll_value_new);
								$(this).removeClass('scrolled-full');
							}

						} else if (phase === $.fn.swipe.phases.PHASE_CANCEL) {
							var origPos = $(this).data('origPos');
							$(this).scrollLeft(origPos);

						} else if (phase === $.fn.swipe.phases.PHASE_END) {
							$(this).data('origPos', $(this).scrollLeft());
						}
					},
					threshold: 70,
					preventDefaultEvents: false
				});
			} else {
				$(block).removeClass('fadeout');
			}
		}
	});
}

function editableSelectReinit(select) {
	if (typeof(select) == 'string') var $select = $('#' + select);
	else $select = $(select);

	var id = $select.attr('id');
	$('#' + id + '_es').remove();
	$select.data('editable-select', false);
	$select.editableSelect({ 
		effects: 'fade',
		source: $select.attr('source') ? $select.attr('source') : false
	}).on('change.editable-select', function(e) {
		var $holder = $(e.target).closest('.input-holder');
		if ($holder.find('.es-input').val()) {
			$(e.target).closest('.input-holder').addClass('focused');
		} else {
			$(e.target).closest('.input-holder').removeClass('focused');
		}
	});
	$('#' + id + '_input').show();
	return true;
}

function getOffsetSum(elem) {
	var t = 0, l = 0;
	while (elem) {
		t += t + parseFloat(elem.offsetTop);
		l += l + parseFloat(elem.offsetLeft);
		elem = elem.offsetParent;
	}
	return {top: Math.round(t), left: Math.round(l)};
}
function getOffsetRect(elem) {
	var box = elem.getBoundingClientRect();
	var body = document.body;
	var docElem = document.documentElement;
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	var clientTop = docElem.clientTop || body.clientTop || 0;
	var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	var t  = box.top +  scrollTop - clientTop;
	var l = box.left + scrollLeft - clientLeft;
	return {top: Math.round(t), left: Math.round(l)};
}
function getOffset(elem) {
	if (elem.getBoundingClientRect) {
		return getOffsetRect(elem);
	} else {
		return getOffsetSum(elem);
	}
}

// Animated scroll to target
function _scrollTo(target, offset) {
	var wh = $(window).height();
	if (typeof(offset) == 'undefined') {
		if ($(target).outerHeight() <= wh) {
			offset = ($(target).outerHeight() <= wh ? Math.round($(target).outerHeight() / 2) : 0) - Math.round(wh / 2);			
		} else {
			offset = 0;
		}		
	}
	else if (offset === false) offset = 0;
	$('html,body').animate({
		scrollTop: $(target).offset().top + offset
	}, 1000);
}

$.preloadImages = function () {
    if (typeof arguments[arguments.length - 1] == 'function') {
        var callback = arguments[arguments.length - 1];
    } else {
        var callback = false;
    }
 
    if (typeof arguments[0] == 'object') {
        var images = arguments[0];
        var n = images.length;
    } else {
        var images = arguments;
        var n = images.length - 1;
    }
    var not_loaded = n;
    for (var i = 0; i < n; i++) {
    	var img = new Image();
    	$(img).attr('src', images[i]);
        img.onload = function() {
            if (--not_loaded < 1 && typeof callback == 'function') {
                callback();
            }
        };
    }
}

function redirect(url) {
  window.location = url;
}

function reload(forceGet) {
  window.location.reload(forceGet);
} 

/*
jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 '-o-transform': 'rotate(' + degrees + 'deg)',
                 'transform' : 'rotate('+ degrees +'deg)',
             	 'zoom' : 1});
    return $(this);
};
*/

function inViewport(element) {
	var st = $(this).scrollTop();
	var offset = $(window).height();
	var top = $(element).offset().top;
	var height = $(element).outerHeight();
	return (st >= top - offset) && (st <= top + height);
}

function percentInViewport(element) {
	if (inViewport(element)) {
		var st = $(this).scrollTop();
		var offset = $(window).height();
		var top = $(element).offset().top;
		var height = $(element).outerHeight();

		return (st - top + offset) / (height + offset);
	} else {
		return false;
	}
}

function setTranslate3d(element, x, y, z) {
	var css = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
	return $(element).css({
		'-webkit-transform': css,
		'transform': css
	}).data({
		x: x,
		y: y,
		z: z
	});
}

function randomInteger(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}