// ON DOCUMENT READY
(function ($) {
	$.fn.lightTabs = function() {
		var showTab = function(tab, saveHash) {
			if (!$(tab).hasClass('tab-act')) {
				var tabs = $(tab).closest('.tabs');

				var target_id = $(tab).attr('href');
		        var old_target_id = $(tabs).find('.tab-act').attr('href');
		        $(target_id).show();
		        $(old_target_id).hide();
		        $(tabs).find('.tab-act').removeClass('tab-act');
		        $(tab).addClass('tab-act');

		        if (typeof(saveHash) != 'undefined' && saveHash) history.pushState(null, null, target_id);
			}
		}

		var initTabs = function() {
            var tabs = this;
            var hasAct = $(tabs).find('.tab-act').length;
            
            $(tabs).find('a').each(function(i, tab){
                $(tab).click(function(e) {
                	e.preventDefault();

                	showTab(this, true);
                	fadeoutInit();

                	return false;
                });
                if ((!hasAct && i == 0) || (hasAct && $(tab).hasClass('tab-act'))) showTab(tab);             
                else $($(tab).attr('href')).hide();
            });	

            $(tabs).swipe({
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
				threshold: 70
			});	
        };

        return this.each(initTabs);
    };

	$(function () {
		initElements();

		// LINKS
		$('a[href]').click(function(e) {
			if (window.pagePreloader) {
				var href = $(this).attr('href');
				if (href.charAt(0) != '#' 
					&& $(this).attr('href').substr(0, 7) != 'mailto:'
					&& $(this).attr('href').substr(0, 4) != 'tel:'
					&& $(this).attr('target') != '_blank' 
					&& !$(this).hasClass('js-lightbox')) {
					e.preventDefault();

					var href = $(this).attr('href');
					if (href.charAt(0) == '#') {
						_scrollTo(href);
					} else {
						window.pagePreloader.pageClose(function() {
							redirect(href);
							setTimeout(function() {
								window.pagePreloader.pageOpen();
							}, 500);
						});
					}
				}
			}
		});

		// BARBA
		/*
		$('document').ready(function(){
		     Barba.Pjax.start();
		});
		*/

		// FIXING HEADER
		scrollCallbacks.push(function(st, ds) {
			if (!__isMobile) {
				var offset = 100;
				if (st > offset) {
					$('header, #modal-close').addClass('sticky');
				} else {
					$('header, #modal-close').removeClass('sticky sticky-mobile');
				}

			} else {
				var offset = 20;
				var delta = 5;
				if (st > offset) {
					$('header, #modal-close').addClass('sticky');

					if (ds < -delta) {
						$('header').addClass('sticky-mobile');
					} else if (ds > delta) {
						$('header').removeClass('sticky-mobile');
					}
				} else {
					$('header, #modal-close').removeClass('sticky sticky-mobile');
				}
			}
		});

		// HEADER IMAGES TO INLINE SVG
		$('#logo img').each(function(){
            var $img = $(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            $.get(imgURL, function(data) {
                var $svg = $(data).find('svg');
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
                $svg = $svg.removeAttr('xmlns:a');

                $img.replaceWith($svg);
            }, 'xml');
        });

		// BACKGROUND COLOR CHANGING ON SCROLL
		var bgCheckpoints = $('body [data-bg-color]')
			.get()
			.reverse();
		scrollCallbacks.push(function(st) {
			var offset = $(window).height() / 2;

			$(bgCheckpoints).each(function(i, node) {
				var color = $(node).attr('data-bg-color');
			    if (st > $(node).offset().top - offset) {
			    	$('body')
			    	.removeClass()
			    	.addClass('cs-' + color);	
			    	
			        return false;
			    }
			});
		});

		// INVERSION BLOCKS CHANGING ON SCROLL
		var inversionCheckpoints = $('body [data-bg-inversion]')
			.get()
			.reverse();
		if (inversionCheckpoints.length) {
			scrollCallbacks.push(function(st) {
				var offset2 = $('#logo').height() + parseFloat($('#logo').css('top'));
				var inversed = false;

				$(inversionCheckpoints).each(function(i, node) {
					var wavesHeight = $(node).prev('.section').find('.waves').height() / 2;
					var s = $(node).offset().top - offset2 - wavesHeight;
					var e = $(node).offset().top + $(node).outerHeight() - offset2 - wavesHeight;
				    if (st > s && st < e) {
				    	inversed = true;
				        return false;
				    }
				});
				$('body').toggleClass('cs-inversed', inversed);
			});
		}		

		// VERTICAL MENU
		if ($('#v-menu').length) {
			$('#v-menu>ul>li').click(function(e) {
				e.preventDefault();
				e.stopPropagation();

				_scrollTo($(this).children('a').attr('href'));
				$(this).addClass('active').siblings().removeClass('active');
			});

			var menuCheckpoints = new Array();
			$('#v-menu>ul>li>a').each(function(i, a) {
				menuCheckpoints.push($(a).attr('href'));
				$(a).click(function(e) {
					e.preventDefault();
				});
			});

			scrollCallbacks.push(function(st) {
				var offset = $(window).height() / 2;

				$(menuCheckpoints).each(function(i, node) {
				    if (st > $(node).offset().top - offset) {
				    	$('#v-menu>ul>li').eq(i).addClass('active').siblings().removeClass('active');
				        return false;
				    }
				});
			});
		}

		// ANIMATE NUMBERS
		$(window).on('opening', function() {
			$('.js-num-animated').each(function() {
		      	var num = parseInt($(this).text().replace(/[^\d]/g, ''));
		      	var delay = $(this).attr('data-delay') ? $(this).attr('data-delay') - 0 : 0;

		      	$(this).html($(this).text().replace(num, '<span>' + num + '</span>'));

		      	$(this).children('span').animateNumber({
		        	number: num
		      	},
		      	{
		        	easing: 'swing',
		        	duration: __animationSpeed*2 + delay
		      	});
		    });
		});

		// WOW ANIMATION
		$(window).on('opening', function() {
			if (typeof(WOW) != 'undefined') {
				new WOW().init();
			}
		});

		// ANCHOR LINKS
		$('a.js-anchor').click(function(e) {
			e.preventDefault();

			_scrollTo($(this).attr('href'));
		});

		// MODAL LINKS
		$('.js-modal-link').click(function(e) {
			e.preventDefault();
			showModal($(this).attr('href') ? $(this).attr('href').substring(1) : $(this).attr('data-target').substring(1));
		});

		// MODAL FADEOUT
		resizeCallbacks.push(function() {
			syncModalFadeout();
		});
		if (!$('#modal-close').length) {
			$('#modal-fadeout').before('<div id="modal-close"></div>');
			$('#modal-close').click(function() {
				closeModalFadeout();
				$(this).stop().fadeOut(__animationSpeed);

				if ($('#mn-main').css('display') == 'block') $('#mn-main').hide();
				if ($('.modal-wrapper:visible').length) hideModal();
			});
		}

		// BURGER
		$('#btn-burger').click(function() {
			$('#modal-close').stop().fadeTo(__animationSpeed, 0.65);
			openModalFadeout();
			$('#mn-main').show();
		});

		// PROFILE
		$('#btn-profile').click(function() {
			var profileLink = 'https://cs.febotele.com';
			redirect(profileLink);
		});

		// WAVES
		// Вариант со ScrollMagic и snap
		function initWaves() {
			var wh = $(window).height();

			$('.waves').each(function(i, wave) {
				var eh = $(wave).outerHeight();
				var offset = eh / 2 - wh / 2;

				var path = Snap($(wave).find('path').get(0));
				var pathTo = Snap($(wave).find('path').get(1));
				var animation = path.animate({
					d: pathTo.attr('d')
				}, 500);

				var controller = new ScrollMagic.Controller();
				var animationCtrl = animation.anims[Object.keys(animation.anims)[0]];
				animationCtrl.pause();
				var tweener = {progress: 0};
				var timeline = new TimelineMax().to(tweener, 0.5, {
				    progress: 1,
				  	ease: Power2.easeIn,
				    onUpdate: function() {
					    animationCtrl.status(tweener.progress);
					    animationCtrl.update();
				    }
				});
				var scene = new ScrollMagic.Scene({
						triggerElement: $(wave).get(0),
						offset: offset,
						duration: wh, 
						tweenChanges: true
					})
					.setTween(timeline)
					//.addIndicators() // add indicators (requires plugin)
					.addTo(controller);

				$(wave).data('scene', scene);
			});

			resizeCallbacks.push(function() {
				var wh = $(window).height();	

				$('.waves').each(function(i, wave) {
					var eh = $(wave).outerHeight();
					var offset = eh / 2 - wh / 2;

					var scene = $(wave).data('scene');
					scene.offset(offset);
					scene.duration(wh);
				});			
			});	
		}
		if ($('.waves').length) {
			initWaves();			
		}
		

		/*
		// Вариант со статическим уменьшением высоты волны
		scrollCallbacks.push(function(st) {
			var offset = $(window).height();

			$('.waves').each(function(i, wave) {
				var top = $(wave).offset().top;

				if (inViewport(wave)) {
					var coef = 1 - percentInViewport(wave) / 1.2;
					wave.style.transform = 'scale(1, ' + coef + ')';
				}
			});			
		});
		*/
		/*
		// Вариант с «живыми» волнами
		resizeCallbacks.push(function() {
			$('.waves').each(function(i, wave) {
				$(wave).children('svg').children('path').wavify({
				  height: Math.round($(window).height() * 0.12),
				  bones: 3 + Math.round(Math.random()),
				  amplitude: Math.round($(window).height() * 0.1),
				  color: '#06378B',
				  speed: .15
				});
			});
		});
		*/

		// FIRST SCREEN VIDEO
		if ($('#bl-first').length) {
			var video = [
				'assets/images/waves.mp4'
			];

			var i = 0;
			$('#video_src').attr('src', video[i]);
			$('#video').get(0).load();
			$('#video').get(0).play();

			$('#layout').mousemove(function(e) {
				var halfX = Math.round($(window).width() / 2);
				var coefX = 0.06;
				var deltaX = e.clientX - halfX;
				var halfY = Math.round($(window).height() / 2);
				var coefY = 0.04;
				var deltaY = e.clientY - halfY;

				$('#video').get(0).style.transform = 'translate(' + (deltaX * coefX) + 'px, ' + (deltaY * coefY) + 'px)';
			});
		}

		// SERVICES SCREEN
		if ($('#bl-services').length) {
			var servicesTimers = new Array();

			var progressServiceStep = function (slider) {
				var $progress = $(slider).children('.progress');
				var counter = parseInt($progress.attr('data-value')) + 1;
					
				if (counter <= 100) {
					$progress.attr('data-value', counter);
				} else {
					if ($(slider).data('tid')) {
						clearInterval($(slider).data('tid'));
						$(slider).removeData('tid');
					}
				}
			}

			var progressServiceStart = function (slider) {
				var $progress = $(slider).children('.progress');
				var autochangeStep = $(slider).attr('data-autochange-time') * 1000;
				var step = Math.round(autochangeStep / 100);

				$progress.attr('data-value', 1);

				if (!$(slider).data('tid')) {
					$(slider).data('tid', setInterval(progressServiceStep, step, slider));
				}
			}

			var stepServicesSlider = function (slider) {				
				var $progress = $(slider).children('.progress');
				var $lis = $(slider).children('ol').children('li');

				var current = parseInt($(slider).data('current'));
				var total = parseInt($(slider).data('total'));
				var next = (current < total - 1) ? current + 1 : 0;

				$lis.eq(current).hide();
				$lis.eq(next).show();
				if (!$lis.eq(next).children('h3').hasClass('animated')) {
					$lis.eq(next).children('h3, p').addClass('animated wow');
				}
				$progress.children('.label').text('0' + (next + 1));
				progressServiceStart(slider);
				
				$(slider).data('current', next);
			}

			var stepServicesSizes = function () {
				$('#bl-services .services').each(function(index, services) {
					var hmax = 0;
					$(services).children('ol').children('li').each(function(index, li) {
						var h = $(li).clone().appendTo($(services).children('ol')).addClass('out-of-bound').show().height();
						if (h > hmax) hmax = h;
					});
					$(services).children('ol').height(hmax).children('li').height(hmax);
					$(services).children('ol').children('.out-of-bound').remove();
				});
			}

			var initServicesSlider = function (slider) {
				$(slider).data({
					'current': 0,
					'total': $(slider).children('ol').children('li').length
				});
				var autochangeStep = $(slider).attr('data-autochange-time') * 1000;

				stepServicesSizes();

				servicesTimers[slider] = setInterval(stepServicesSlider, autochangeStep, slider);
				progressServiceStart(slider);

				$(slider).children('.nav').click(function(e) {
					e.preventDefault();
					e.stopPropagation();

					clearInterval(servicesTimers[slider]);
					servicesTimers[slider] = setInterval(stepServicesSlider, autochangeStep, slider);
					stepServicesSlider(slider);
				});
			}

			var servicesCheckpoints = $('#bl-services .services');
			scrollCallbacks.push(function() {
				var st = $(this).scrollTop();
				var offset = $(window).height();

				$(servicesCheckpoints).each(function(i, node) {
				    if (st > $(node).offset().top - offset) {
				    	if (!$(node).data('inited')) {
				    		initServicesSlider(node);
				    		$(node).data('inited', true);
				    	}
				    }
				});
			});

			var rotation = 0;
			var rotationLock = false;
			var rotationTid;
			setInterval(function() {
				if (!rotationLock || !__isMobile) {
					rotation += 0.5;
					$('#figure1').rotate(rotation);
					$('#figure2').rotate(rotation);
				}
			}, 50);

			/*
			$(window).addEventListener('touchmove', function(e) {
				//e.preventDefault();
				//e.stopPropagation();

			}, false);
			*/
			//$(window).addEventListener('gesturechange', function(e) {e.preventDefault()});

			scrollCallbacks.push(function() {
				rotation += 1;
				$('#figure1').rotate(rotation);
				$('#figure2').rotate(rotation);
				rotationLock = true;
				clearTimeout(rotationTid);
				rotationTid = setTimeout(function() {
					rotationLock = false;
				}, 100);
			});
		}

		// PROJECTS
		if ($('#bl-projects').length) {
			resizeCallbacks.push(function() {
				if (__isMobile) {
					$('#bl-projects table .link .website-link').each(function(i, a) {
						$(a).appendTo($(a).closest('td').prev('td'));
					});
				} else {
					$('#bl-projects table .desc .website-link').each(function(i, a) {
						$(a).appendTo($(a).closest('td').next('td'));
					});
				}
			});
		}

		// EVENTS
		if ($('#bl-events').length) {
			resizeCallbacks.push(function() {
				if (!__isMobileSmall) {
					var $ul = $('#bl-events ul');
					var eventsWidth = $ul.outerWidth();
					var eventsCountVisible = Math.floor(eventsWidth / $ul.children('li:eq(1)').outerWidth());
					var eventsPosition = parseInt($ul.data('position'));					

					blockEventsSwipe(eventsPosition);

					if ($ul.children('li').length <= eventsCountVisible) {
						$ul.children('li').addClass('visible');

					} else {
						$ul.data('countVisible', eventsCountVisible);
						$ul.children('li').each(function(index, li) {
							if (index >= eventsPosition && index <= $ul.children('li').length - 1 + eventsPosition - eventsCountVisible) $(li).addClass('visible');
							else $(li).removeClass('visible');
						});
					}
				}
			});

			function blockEventsSwipe(p) {
				var $ul = $('#bl-events ul');
				var offset = Math.round($ul.children('li:eq(1)').outerWidth(true));
				if (typeof(p) == 'string' && p.charAt(0) == '+') var position = $ul.data('position') - 1;
				else if (typeof(p) == 'string' && p.charAt(0) == '-') var position = $ul.data('position') + 1;
				else var position = parseInt(p);

				var x = position * offset * -1;
				setTranslate3d($ul, x, 0, 0);
				$ul.data('locked', true);
				setTimeout(function() {
					$ul.data('locked', false);
				}, 100);
			}

			$('#bl-events ul')
				.data('position', 0)
				.on('mousewheel DOMMouseScroll', function(e) {
					if (!__isMobileSmall) {
						var $ul = $(this);
						var countVisible = $ul.data('countVisible');
						var direction = (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) ? 1 : -1;
						var position = parseInt($ul.data('position')) - direction;

						if (position >= 0 && position <= $ul.children('li').length - countVisible) {
							e.preventDefault();
							e.stopPropagation();

							if (!$ul.data('locked')) {
								blockEventsSwipe(direction > 0 ? '+1' : '-1');
								$ul.children('li').each(function(index, li) {
									if (index >= position && index <= $ul.children('li').length - 1 + position - countVisible) $(li).addClass('visible');
									else $(li).removeClass('visible');
								});
								$ul.data('position', position);
							}
						}
					}					
				});
			setTimeout(function() {
				$('#bl-events ul>li')
					.removeClass('animated fadeInUpSmall wow')
					.css('animation-name', 'none');
			}, 1000);
		}

		// FEEDBACK
		$('#bl-feedback form').submit(function(e) {
			e.preventDefault();

			$(this).find('[required]').addClass('attempted');

			if ($('#feedback-agreement').prop('checked')) {
				// FIXME DO SOMETHING
			}
		});

		// MODAL FEEDBACK
		$('#modal-feedback form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-feedback-agreement').prop('checked')) {
				// FIXME
				showModal('modal-done');
				setTimeout(function() {
					$('#modal-feedback form').get(0).reset();
					if ($('#modal-feedback:visible').length) showModal('modal-feedback');
				}, $('#modal-feedback form').attr('data-done-timeout') * 1000);
			}
		});

		// ENQUIRY
		$('#bl-enquiry form').submit(function(e) {
			e.preventDefault();

			if ($('#enquiry-agreement').prop('checked')) {
				// FIXME DO SOMETHING
			}
		});
		$('#bl-enquiry form').find('button, input:submit').click(function(e) {
			e.preventDefault();
			$(this).closest('form').find('[required]').addClass('attempted');
		});

		// MAP
	    if ($('#map').length) {
	    	$(window).on('opening', function() {
	    		var coords = $('#map').attr('data-coords').split(',');
	    		coords[0] = parseFloat(coords[0]);
	    		coords[1] = parseFloat(coords[1]);

	    		var placeholderSrc = 'https://febotele.com/assets/images/ico_map_placeholder.png';
		      	var placeholderCoords = coords;
		      	ymaps.ready(function () {
		        	var map = new ymaps.Map('map', {
			          center: placeholderCoords,
			          zoom: 16,
			          controls: []
			        });
			        map.behaviors.disable('scrollZoom');
			        var mark = new ymaps.Placemark(placeholderCoords, {}, {
				        iconLayout: 'default#image',
				        iconImageHref: placeholderSrc,
			            iconImageSize: !__isMobile ? [61, 82] : (!__isMobileSmall ? [37.55, 50.47] : [31.93, 42.92]),
			            iconImageOffset: !__isMobile ? [-30, -82] : (!__isMobileSmall ? [-18.775, -50.47] : [-15.965, -42.92])
			        });

		        	map.geoObjects.add(mark);
		      	});
	    	});    	
	    }

	    // SOCIALS
		$('#social-shares ul>li>a').click(function(e) {
			e.preventDefault();
			var $shares = $('#social-shares');
			var url = $shares.attr('data-share-url');
			var title = $shares.attr('data-share-title');
			var image = $shares.attr('data-share-image');
			var description = $shares.attr('data-share-description');
			var source = window.location.toString();
			var api_url = $(this).attr('data-api-url');
			
			api_url = api_url.split('%url%').join(url).split('%title%').join(title).split('%image%').join(image).split('%description%').join(description).split('%source%').join(source);
			window.open(api_url, title, 'width=640,height=480,status=no,toolbar=no,menubar=no');
		});

		// FEBO MOBI
		if ($('#febo-mobi').length) {
			var id = $('#febo-mobi .bl-how-works .tabs>ul>li>a.tab-act').attr('href');
			$(id).find('.fadeInUpSmall').addClass('animated wow');

			$('#febo-mobi .bl-how-works .tabs>ul>li>a').click(function() {
				var id = $(this).attr('href');
				$(id).find('.fadeInUpSmall').addClass('animated wow');
			});
		}

		$(window).scroll();
		$(window).resize();

	})
})(jQuery)