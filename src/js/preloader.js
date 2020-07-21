// PAGE OPENING AND PRELOADING
function Preloader(fullPreload) {
	var self = this;
	
	this.$preloader = $('#page-preloader');
	this.$loader = this.$preloader.children('.loader');
	this.fload = false;
	this.fanim = false;

	this.openingSpeed = 500;
	this.fadeoutSpeed = 150;
	this.simpleOpeningDelay = 250;
	this.logoAnimationStartingDelay = 700;
	this.logoAnimationProcessDelay = 3200;
	this.logoAnimationEndingDelay = 700;

	this.pageOpen = function() {
		self.$preloader.addClass('release')
			.delay(self.openingSpeed - self.fadeoutSpeed)
			.fadeOut(self.fadeoutSpeed, function() {
				self.$preloader.addClass('top');
			});
		$(window).trigger('opening');
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

			setTimeout(function() {
				self.$preloader.addClass('released');

				setTimeout(function() {
					self.fanim = true;

					if (self.fload) {
						self.pageOpen();
					}

				}, self.logoAnimationEndingDelay);
			}, self.logoAnimationProcessDelay);
		}, self.logoAnimationStartingDelay);
	}

	// load event
	$(window).on('load', function() {
		self.fload = true;

		if (self.fanim) {
			self.pageOpen();
		}
	});

	$(window).on('unload', function() {
		self.$preloader.addClass('release');
	});
}
if (!window.localStorage.getItem('preloaderIsShown')) {
	window.localStorage.setItem('preloaderIsShown', true);
	window.pagePreloader = new Preloader(true);
} else {
	window.pagePreloader = new Preloader(false);
}