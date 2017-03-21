var	_scriptTags = document.querySelectorAll('script')
	_scriptTag = _scriptTags[_scriptTags.length - 1]
	_baseUrl = _scriptTag.getAttribute('src').replace('sys/js/init.js', '')
	____Debug = _baseUrl.indexOf(':6871') > -1 || !_baseUrl,
	count = 0,
	scripts = [
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/angular/angular.min.js',
		'bower_components/nouislider/distribute/nouislider.min.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
		'bower_components/markdown/lib/markdown.js',
		'bower_components/tinymce-dist/tinymce.js',
		'bower_components/angular-ui-tinymce/src/tinymce.js',
		'bower_components/toastr/toastr.min.js',
		'bower_components/pen/src/pen.js',
		'bower_components/querystring/dist/querystring.min.js',
		'bower_components/sweetalert/dist/sweetalert.min.js',
		'sys/js/tipped.js',
		'sys/js/main.js'
	],
	styles = [
		/*'bower_components/nouislider/distribute/nouislider.min.css',*/
		'sys/css/tipped.css',
		'bower_components/pen/src/pen.css',
		'bower_components/open-sans/css/open-sans.min.css',
		'bower_components/font-awesome/css/font-awesome.min.css',
		'bower_components/bootstrap/dist/css/bootstrap.min.css',
		'bower_components/sweetalert/dist/sweetalert.css',
		'bower_components/toastr/toastr.min.css',
		'sys/css/moodle-adjustments.css',
		'sys/css/styles.css'
	]



	finished = function () {
		
		var t = scripts.shift()

		if (t) {
			if(1 || ____Debug) {

				if (typeof jQuery === 'function' && t.indexOf('jquery.min.js') > -1) {
					return finished()
				}
				
				var y = document.createElement('script')
				y.src = _baseUrl + t
				y.onload = finished
				document.head.appendChild(y)
			}
			else {
				if (typeof jQuery !== 'function') scripts.unshift(t)
				var y = document.createElement('script')
				y.src = _baseUrl + 'concatScripts/' + encodeURIComponent(scripts.join('---'))
				scripts = []
				y.onload = finished
				document.head.insertBefore(y, document.head.firstChild)
			}
			return
		}

	

		if(1 || ____Debug) {
			for (var i in styles) {
				var y = document.createElement('link')
				y.rel = 'stylesheet'
				y.href = _baseUrl + styles[i]
				document.head.appendChild(y)
			}
		}
		else {
			var y = document.createElement('link')
			y.rel = 'stylesheet'
			y.href = _baseUrl + 'concatStyles/' + encodeURIComponent(styles.join('---'))
			document.head.insertBefore(y, document.head.firstChild)
		}

		$.get(_baseUrl + 'sys/pages/init.html').then(function (data) {
			$(data).insertAfter(_scriptTag)
			var bootstrap = $('[id="page"]')[0] || $('.acode-survey')[0]
			$(bootstrap).attr('ng-controller', 'master').prop('ng-controller', 'master')
			angular.bootstrap(bootstrap, ['2015-1858 - acode-benchmark-assessment-tool'])

		})
	}

	finished()