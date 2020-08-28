// PAGE OPENING AND PRELOADING
function Preloader(fullPreload) {
	var self = this;
	
	this.$preloader = $('#page-preloader');
	this.$loader = this.$preloader.children('.loader');
	this.fload = false;
	this.fanim = false;
	this.preloadTimeLimit = 3500;
	this.shown = false;
	this.fullPreloadStarted = false;

	this.openingSpeed = 500;
	this.fadeoutSpeed = 150;
	this.simpleOpeningDelay = 250;
	this.logoAnimationStartingDelay = 700;
	this.logoAnimationProcessDelay = 3200;
	this.logoAnimationEndingDelay = 700;

	this.pageOpen = function() {
		clearTimeout(self.preloadTimeLimitTid);
		
		self.$preloader.addClass('release')
			.delay(self.openingSpeed - self.fadeoutSpeed)
			.fadeOut(self.fadeoutSpeed, function() {
				self.$preloader.addClass('top');
			});
		$(window).trigger('opening');
		self.shown = true;
	}

	this.pageClose = function(callback) {
		self.$preloader.show()
			.removeClass('release');
		setTimeout(function() {
			callback();
		}, self.openingSpeed);
		$(window).trigger('closing');
	}

	// animation event
	if (typeof(fullPreload) == 'undefined' || !fullPreload) {
		setTimeout(function() {
			self.fanim = true;

			if (self.fload) {
				self.pageOpen();
			}
		}, self.simpleOpeningDelay);

	} else {
		setTimeout(function() {
			self.$preloader.addClass('animate');
			self.fullPreloadStarted = true;

			setTimeout(function() {
				self.$preloader.addClass('released');

				setTimeout(function() {
					self.fanim = true;

					//if (self.fload && !self.shown) {
						if (!self.shown) {
						self.pageOpen();
					}

				}, self.logoAnimationEndingDelay);
			}, self.logoAnimationProcessDelay);
		}, self.logoAnimationStartingDelay);
	}

	// load event
	$(window).on('load', function() {
		self.fload = true;

		if (self.fanim && !self.shown) {
			self.pageOpen();
		}
	});

	/*
	$(window).on('unload', function() {
		self.$preloader.addClass('release');
	});
	*/

	self.preloadTimeLimitTid = setTimeout(function() {
		if (!self.fullPreloadStarted) {
			$(window).data('slow-connection', true);
			$(window).trigger('load');
		}
	}, self.preloadTimeLimit);
}
if (!window.localStorage.getItem('preloaderIsShown')) {
	window.localStorage.setItem('preloaderIsShown', true);
	window.pagePreloader = new Preloader(true);
} else {
	window.pagePreloader = new Preloader(false);
}