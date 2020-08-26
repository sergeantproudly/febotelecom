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

    function initPage() {

		initElements();

		// TABS
		if ($('.tabs[data-on-mobile="select"]').length) {
			resizeCallbacks.push(function() {				
				$('.tabs[data-on-mobile="select"]').each(function(index, tabs) {
					if (__isMobileSmall) {
						$(tabs).addClass('mobile-select');
						if (!$(tabs).children('.tabs-ms-dropdown').length) {
							$(tabs).append('<div class="tabs-ms-dropdown"></div>');
							$dropdown = $(tabs).children('.tabs-ms-dropdown');
							$(tabs).find('ul>li>a').each(function(index2, a) {
								$dropdown.append('<a href="' + $(a).attr('href') + '">' + $(a).text() + '</a>');
								$dropdown.children('a:last').data('origin', $(a)).click(function(e) {
									e.preventDefault();
									e.stopPropagation();
									$(this).data('origin').click();
									$(this).closest('.tabs').removeClass('opened');
								});
							});
							$(tabs).find('a').click(function() {
								if (__isMobileSmall) {
									if ($(this).hasClass('tab-act')) {
										$(this).closest('.tabs').toggleClass('opened');
									}									
								}
							});
						}
					} else {
						$(tabs).removeClass('mobile-select');
					}
				});					
			});			
		}

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

				if ($('#v-menu').length) {
					$(menuCheckpoints).each(function(i, node) {
					    if (st > $(node).offset().top - offset) {
					    	$('#v-menu>ul>li').eq(i).addClass('active').siblings().removeClass('active');
					        return false;
					    }
					});
				}				
			});
		}		

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
		/*
		var servicesFiguresAnimationDurationMin = 20;
		var servicesFiguresAnimationDurationMax = 10;
		var servicesDurationOffset = 0.1;
		if ($('#bl-services').length) {
			scrollCallbacks.push(function() {
				if (typeof($('#figure1').data('tid')) != 'undefined') {
					clearTimeout($('#figure1').data('tid');
				}

				var currDuration = parseFloat($('#figure1').css('animation-duration'));
				var newDuration = currDuration - servicesDurationOffset >= servicesFiguresAnimationDurationMax ? currDuration - servicesDurationOffset : currDuration;
				$('#figure1').css('animation-duration', newDuration + 's');
				console.log($('#figure1').css('animation-duration'));
				$('#figure1').data('tid', setTimeout(function() {
					var currDuration = parseFloat($('#figure1').css('animation-duration'));
					var newDuration = currDuration + servicesDurationOffset <= servicesFiguresAnimationDurationMin ? currDuration + servicesDurationOffset : currDuration;
					$('#figure1').css('animation-duration', newDuration + 's');
				}, 400));
			});
		}
		*/
		if ($('#bl-services').length) {
			var $services = $('#bl-services');
			$services.data('currRot', 0);
			var rotationV1 = 20;
			var rotationV2 = 100;
			var rotationTid = false;

			function servicesRotationCycle() {
				var currTs = Date.now();
				var dt = (currTs - $services.data('startTs')) / 1000;
				var rot = $services.data('startRot') + $services.data('speed') * dt;

				// debug
				//console.log('speed:', $services.data('speed'), 'rotation:', $services.data('startRot'), rot);

				$services.data('currRot', rot);

				$('#figure1').rotate({animateTo: Math.round(rot)});
				$('#figure2').rotate({animateTo: Math.round(rot)});
				$('#figure4').rotate({animateTo: Math.round(rot)});
				requestAnimationFrame(servicesRotationCycle);
			}

			function servicesRotationRegisterPoint(speed) {
				$services.data({
					'startTs': Date.now(),
					'startRot': $services.data('currRot'),
					'speed': speed,
				});
			}

			scrollCallbacks.push(function() {
				if (rotationTid) {
					clearTimeout(rotationTid);
				} else {
					servicesRotationRegisterPoint(rotationV2);
				}
				rotationTid = setTimeout(function() {
					servicesRotationRegisterPoint(rotationV1);
					rotationTid = false;
				}, 50);
			});

			//setTimeout(function() {
			servicesRotationRegisterPoint(rotationV1);
			requestAnimationFrame(servicesRotationCycle);
			//}, 100);
		}

		/*
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
		*/

		// PROJECTS
		if ($('#bl-projects').length) {
			var mouse = {
			    _x: 0,
			    _y: 0,
			    x: 0,
			    y: 0,
			    updatePosition: function(event) {
			    	var e = event || window.event;
			        this.x = e.clientX - this._x;
			        this.y = (e.clientY - this._y) * -1;
			    },
			    setOrigin: function(element) {
			        this._x = element.getBoundingClientRect().left + Math.floor($(element).outerWidth() / 2);
			        this._y = element.getBoundingClientRect().top + Math.floor($(element).outerHeight() / 2);
			    },
			    show: function() {
			        return '(' + this.x + ', ' + this.y + ')';
			    }
			};

			var projectUpdate = function(e, element) {
				mouse.setOrigin(element);
				mouse.updatePosition(e);
				projectUpdateTransformStyle(
			    	(mouse.y / $(element).find('img').get(0).offsetHeight / 2).toFixed(2),
			    	(mouse.x / $(element).find('img').get(0).offsetWidth / 2).toFixed(2),
			    	element
			    );
			}

			var projectUpdateTransformStyle = function(x, y, element) {
			    var style = 'rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
			    $(element).find('img').get(0).style.transform = style;
			    $(element).find('img').get(0).style.webkitTransform = style;
			    $(element).find('img').get(0).style.mozTranform = style;
			    $(element).find('img').get(0).style.msTransform = style;
			    $(element).find('img').get(0).style.oTransform = style;
			};

			var projectsCounter = 0;
  			var projectsRefreshRate = 10;
  			var projectsIsTimeToUpdate = function() {
			    return projectsCounter++ % projectsRefreshRate === 0;
			};

			$('#projects-list>ul>li>.illustration').each(function(index, illustration) {
				var controller = new ScrollMagic.Controller();
				var projectScene = new ScrollMagic.Scene({
					triggerElement: illustration,
					duration: Math.round($(window).height() / 2)
				})
				.setTween(illustration, 0.5, {scale: 1.1})
				.addTo(controller);

				$(illustration).closest('li').mouseenter(function(e) {
					projectUpdate(e, this);
				}).mousemove(function(e) {
					if (projectsIsTimeToUpdate()) {
				    	projectUpdate(e, this);
				    }
				}).mouseleave(function(e) {
					$(this).find('img').removeAttr('style');
				});
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
				HubspotAPI.postForm('contacts-us', this, function() {
					showModal('modal-done');
					$('#bl-feedback form').get(0).reset();
					$('#bl-feedback form .attempted').removeClass('attempted');
					$('#bl-feedback form').find('input, textarea').trigger('focusout');
					setTimeout(function() {
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#bl-feedback form').attr('data-done-timeout') * 1000);
				});		
			}
		});

		// MODAL FEEDBACK
		$('#modal-feedback form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-feedback-agreement').prop('checked')) {
				HubspotAPI.postForm('contacts-us', this, function() {
					showModal('modal-done');
					$('#modal-feedback form').get(0).reset();
					$('#modal-feedback form .attempted').removeClass('attempted');
					$('#modal-feedback form').find('input, textarea').trigger('focusout');
					setTimeout(function() {						
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#modal-feedback form').attr('data-done-timeout') * 1000);
				});	
			}
		});

		// MODAL REQUEST PRICING
		$('#modal-request-pricing form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-request-pricing-agreement').prop('checked')) {
				HubspotAPI.postForm('request-pricing', this, function() {
					showModal('modal-done');
					$('#modal-request-pricing form').get(0).reset();
					$('#modal-request-pricing form .attempted').removeClass('attempted');
					$('#modal-request-pricing form').find('input, textarea').trigger('focusout');
					setTimeout(function() {						
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#modal-request-pricing form').attr('data-done-timeout') * 1000);
				});	
			}
		});
		$('#modal-request-pricing2 form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-request-pricing-agreement2').prop('checked')) {
				HubspotAPI.postForm('request-pricing', this, function() {
					showModal('modal-done');
					$('#modal-request-pricing2 form').get(0).reset();
					$('#modal-request-pricing2 form .attempted').removeClass('attempted');
					$('#modal-request-pricing2 form').find('input, textarea').trigger('focusout');
					setTimeout(function() {						
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#modal-request-pricing2 form').attr('data-done-timeout') * 1000);
				});	
			}
		});

		// ENQUIRY
		$('#bl-enquiry form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#enquiry-agreement').prop('checked')) {				
				var enquiryServices = [];
				$('#bl-enquiry form .services-lines input:checkbox:checked').each(function(index, checkbox) {
					enquiryServices.push($(checkbox).attr('data-hubspot-name'));
				});
				var enquiryFields = [
					{
						'name': $('#bl-enquiry form input[name="name"]').attr('data-hubspot-name'),
						'value': $('#bl-enquiry form input[name="name"]').val()
					},
					{
						'name': $('#bl-enquiry form input[name="email"]').attr('data-hubspot-name'),
						'value': $('#bl-enquiry form input[name="email"]').val()
					},
					{
						'name': $('#bl-enquiry form input[name="company"]').attr('data-hubspot-name'),
						'value': $('#bl-enquiry form input[name="company"]').val()
					},
					{
						'name': 'services',
						'value': enquiryServices.join(';')
					}
				];

				HubspotAPI.setFormCode('leave-enquiry');
				HubspotAPI.setFields(enquiryFields);
				HubspotAPI.post(function() {
					showModal('modal-done');
					$('#bl-enquiry form').get(0).reset();
					$('#bl-enquiry form').find('input, textarea').trigger('focusout');
					$('#bl-enquiry form .attempted').removeClass('attempted');
					setTimeout(function() {
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#bl-enquiry form').attr('data-done-timeout') * 1000);
				});
			}
		});	  

		// MODAL BECOME A PARTNER
		$('#modal-become-partner1 form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-become-partner1-agreement').prop('checked')) {
				HubspotAPI.postForm('become-a-partner', this, function() {
					showModal('modal-done');
					$('#modal-become-partner1 form').get(0).reset();
					$('#modal-become-partner1 form .attempted').removeClass('attempted');
					$('#modal-become-partner1 form').find('input, textarea').trigger('focusout');
					setTimeout(function() {						
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#modal-become-partner1 form').attr('data-done-timeout') * 1000);
				});	
			}
		}); 
		$('#modal-become-partner2 form').submit(function(e) {
			e.preventDefault();
			$(this).find('[required]').addClass('attempted');

			if ($('#modal-become-partner2-agreement').prop('checked')) {
				HubspotAPI.postForm('become-a-partner', this, function() {
					showModal('modal-done');
					$('#modal-become-partner2 form').get(0).reset();
					$('#modal-become-partner2 form .attempted').removeClass('attempted');
					$('#modal-become-partner2 form').find('input, textarea').trigger('focusout');
					setTimeout(function() {				
						if ($('#modal-done:visible').length) $('#modal-close').click();
					}, $('#modal-become-partner2 form').attr('data-done-timeout') * 1000);
				});	
			}
		}); 	

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

		// PARALLAX
		if ($('.parallax').length) {
			var parallaxPosAndInit = function(figure, position) {
				var pos = position.split(' ');
				if (pos[0] == 'left') {
					var x = randomFloat(0, 40);
				} else if (pos[0] == 'left1/3') {
					var x = randomFloat(0, 15);
				} else if (pos[0] == 'left2/3') {
					if (!__isMobile) {
						var x = randomFloat(15, 40);						
					} else {
						var x = randomFloat(0, 30);
					}					
				} else {
					var x = randomFloat(50, 80);
				}
				if (typeof(pos[1]) != 'undefined') {
					if (pos[1] == 'top') {
						var y = randomFloat(0, 30);
					} else {
						var y = randomFloat(50, 80);
					}
				} else {
					if (!__isMobile) {
						var y = randomFloat(5, 50);
					} else {
						var y = randomFloat(40, 70);
					}					
				}
				var coef = randomFloat(0, 30) / 100;

				$(figure).data('coef', coef)
				 .css({
				 	'left': x + 'vw',
				 	'top': y + 'vh'
				 });
			}

			$('.parallax').each(function(i, parallax) {
				$(parallax).append('<div class="parallax-figure image1"></div><div class="parallax-figure image2"></div><div class="parallax-figure image3"></div>');				
			});

			resizeCallbacks.push(function() {
				$('.parallax').each(function(i, parallax) {
					var $pfigure1 = $(parallax).children('.image1');
					var $pfigure2 = $(parallax).children('.image2');
					var $pfigure3 = $(parallax).children('.image3');

					parallaxPosAndInit($pfigure1, 'right');
					parallaxPosAndInit($pfigure2, 'left2/3 top');
					parallaxPosAndInit($pfigure3, 'left1/3 bottom');
				});
			});

			setTimeout(function() {
				$('.parallax .parallax-figure').addClass('visible');
			}, 550);

			scrollCallbacks.push(function(st) {
				$('.parallax').each(function(i, parallax) {
					if ($(parallax).children('.parallax-figure').length) {
						var $pfigure1 = $(parallax).children('.image1');
						var $pfigure2 = $(parallax).children('.image2');
						var $pfigure3 = $(parallax).children('.image3');

						$pfigure1.get(0).style.transform = 'translate(0, ' + (0 - st * $pfigure1.data('coef')) + 'px)';
						$pfigure2.get(0).style.transform = 'translate(0, ' + (0 - st * $pfigure2.data('coef')) + 'px)';
						$pfigure3.get(0).style.transform = 'translate(0, ' + (0 - st * $pfigure3.data('coef')) + 'px)';
					}
				});
			});
		}

		$(window).scroll();
		$(window).resize();	
    }

	$(function () {
		Hubspot();

		initPage();

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
			if (typeof(WOW) != 'undefined' && !$('body').data('wow')) {
				var wow = new WOW({
					'mobile': false
				});
				wow.init();
				$('body').data('wow', wow);
			} else {
				$('body').data('wow').sync();
			}

			// wow fix for hidden elements
			if ($('header').hasClass('sticky')) {
				var fixSelectors = new Array();
				fixSelectors.push('header .wow');
				fixSelectors.push('#mn-main .wow');
				setTimeout(function() {
					$(fixSelectors.join(',')).css({
						'animation-name': '',
						'visibility': ''
					});
				}, 100);
			}
		});

		// MAP
		$(window).on('opening', function() {
	    	if ($('#map').length) {	    	
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
	    	}
	    });

		// BARBA
		$('document').ready(function() {
			var barbaTransEffect = Barba.BaseTransition.extend({
                start: function() {
                	var _this = this;
                  	this.newContainerLoading.then(function() {
                  		_this.fadeInNewcontent($(_this.newContainer));
                  	});
                },
                fadeInNewcontent: function(nc) {
	                nc.hide();
	                $(window).trigger('closing');
	                var _this = this;
	                $(this.oldContainer).fadeOut(__animationSpeed).promise().done(function() {
	                    nc.css('visibility', 'visible');
	                    $('html,body').scrollTop(0);
	                    nc.fadeIn(__animationSpeed, function() {
	                    	$(window).trigger('opening');
	                    	_this.done();	                    	
	                    	initPage();
	                    });
	                });
                }
            });
            Barba.Pjax.getTransition = function() {
            	return barbaTransEffect;
            }
		    Barba.Pjax.start();
		});
	})
})(jQuery)