$(document).ready(function() {
	var noticed = $.cookie('cookie_notice');
	if (typeof(noticed) == 'undefined' || noticed != 1) {
		$('body').append('<div id="cookies-notice" style="display:none;"><div class="wrapper"><p>This site uses cookies to give you a better experience. Read more about <a href="terms-conditions.html" target="_blank">cookies policy</a></p><button class="btn js-ok"><span>Accept and close</span></button></div></div>');
		setTimeout(function() {
			$('#cookies-notice').stop().fadeIn(700);
			$('#cookies-notice .js-ok').click(function() {
				$.cookie('cookie_notice', 1);
				$('#cookies-notice').stop().fadeOut(700, function() {
					$('#cookies-notice').remove();
				});
			});
		}, 5000);			
	}
});