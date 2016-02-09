var	_scriptTags = document.querySelectorAll('script')
	_scriptTag = _scriptTags[_scriptTags.length - 1]
	_baseUrl = _scriptTag.getAttribute('src').replace('sys/js/init.js', '')
	count = 0,
	scripts = [
		_baseUrl + 'bower_components/jquery/dist/jquery.min.js',
		_baseUrl + 'bower_components/angular/angular.min.js',
		_baseUrl + 'bower_components/firebase/firebase.js',
		_baseUrl + 'bower_components/nouislider/distribute/nouislider.min.js',
		_baseUrl + 'bower_components/angularfire/dist/angularfire.min.js',
		_baseUrl + 'sys/js/main.js'
	]






	finished = function () {
		
		count++
		var t = scripts.shift()
		if (t) {
			var y = document.createElement('script')
			y.src = t
			y.onload = finished
			document.body.appendChild(y)

		}
		if (count < 4 || t) return
		

		$.get(_baseUrl + 'sys/pages/init.html').then(function (data) {
			$(data).insertAfter(_scriptTag)

			angular.bootstrap($('.acode-survey')[0], ['2015-1858 - acode-benchmark-assessment-tool'])

		})
	}

	finished()