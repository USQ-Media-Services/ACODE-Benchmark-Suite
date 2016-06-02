var m = {}

$.ajaxSetup({
    cache: false
})



angular.module('2015-1858 - acode-benchmark-assessment-tool', ['ui.bootstrap', 'ui.tinymce'])


/*The controllers*/
.controller('master', function master ($scope, $sce) {
	m = $scope

	m.$root.hasChanged = false

    m._baseUrl = _baseUrl

	m.standalone = typeof standalone === 'boolean' && !!standalone

	m.querystring = function querystring () {
	    var vars = [],
	    	hash,
	    	hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')

	    for (var i = 0; i < hashes.length; i++) {
	        hash = hashes[i].split('=')
	        vars.push(hash[0])
	        vars[hash[0]] = hash[1]
	    }

	    return vars
	}

	m.hash = function hash (data, skipSave) {
		var j = Qs.parse(decodeURIComponent(location.hash.replace('#/', '').replace('#', '')))
		if (j.user) j.user = (parseInt(j.user, 0) !== NaN ? parseInt(j.user, 0) : null)
		if (j.readOnlyUser) j.readOnlyUser = (parseInt(j.readOnlyUser, 0) !== NaN ? parseInt(j.readOnlyUser, 0) : j.readOnlyUser)
		if (j.readOnlyProfiles) j.readOnlyProfiles = JSON.parse(j.readOnlyProfiles)

        if (j.benchmark) j.benchmark = (parseInt(j.benchmark, 0) !== NaN ? parseInt(j.benchmark, 0) : j.benchmark)
        else j.benchmark = 0

		if (j.report) j.report = (parseInt(j.report, 0) !== NaN ? parseInt(j.report, 0) : j.report)

		if (typeof data === 'string' || typeof data === 'number') {
			return j[data] || ""
		}
		else if (typeof data === 'undefined') {
			return j
		}
		else if (typeof data === 'object' && JSON.stringify(data) !== JSON.stringify(j)) {
			var t = j
			for (var i in data) {
				t[i] = data[i]

				if (data[i] === null) delete t[i]
			}

			setTimeout(function () {
				location.hash = '/' + Qs.stringify(t)
			}, 32)
		}				
	}

	m.$root.view = {}

	m.$root.meta = {}

	m.baseUrl = _baseUrl
	
	m._baseUrl = _baseUrl

	m.$root.pageData = m.hash()

	m.confirmLeavePage = function () {
		!confirm('This page has not been saved, are you sure you want to navigate away?')
	}

	m.setPage = function (page) {
		if (!!m.loaded && !!m.$root.hasChanged && !confirm('This page has not been saved, are you sure you want to navigate away?')) return false
		else if (!!page) {
  			m.$root.hasChanged = false
			m.$root.pageData.page = page.replace('.html', '')
			$('body').scrollTop(0)
			if (page === 'home') {
				m.$root.pageData = {
					"benchmark": 0,
					"institution": false,
					"page": 'home',
					"user": false,
					"readOnlyProfiles": false
				}
				m.hash(m.$root.pageData)
				m.$root.view.institution = false
			}
		}
		m.$applyAsync()
		return true
	}

	m.asArray = function (a) {
		if (!!a) return [0]
		else return []
	}

	m.saveProfile = function (skipMessage) {
		m.loading = true;
		m.$applyAsync()
		m.api.profiles.save(m.$root.view.profiles[m.$root.view.institution._id] || {}, m.$root.view.institution, function () {
			if (!skipMessage) {
				toastr["success"]('Institution Profile saved')
			}
			m.loading = false;
			m.$root.hasChanged = false
			setTimeout(function () {
				m.$root.hasChanged = false
				m.$applyAsync()
			}, 250)
			m.$applyAsync()
		})
	}


	m.saveSnapshot = function () {
		m.loading = true;
		m.$applyAsync()
		m.api.profiles.save(m.$root.view.profiles[m.$root.view.institution._id] || {}, m.$root.view.institution, function () {
			toastr["success"]('Institution Snapshot saved')
			m.loading = false;
			m.$root.hasChanged = false
			setTimeout(function () {
				m.$root.hasChanged = false
				m.$applyAsync()
			}, 250)
			m.$applyAsync()
		})
	}

	m.api = {
		institutions: {
			all: function () {
				return $.get(m.baseUrl + 'api/institutions/all', null, 'json')
			},
			single: function (id) {
				return $.get(m.baseUrl + 'api/institutions/single?id=' + id, null, 'json')
			},
			save: function (data) {
				return $.post(m.baseUrl + 'api/institutions/save', {data: data}, null, 'json')
			}
		},
		profiles: {
			all: function () {
				return $.get(m.baseUrl + 'api/profiles/all', null, 'json')
			},
			single: function (id) {
				return $.get(m.baseUrl + 'api/profiles/single?id=' + id, null, 'json')
			},
			save: function (data, institution, callback) {
				data.institution = institution._id
				data.year = new Date().getFullYear()
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/profiles/save',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				    contentType : 'application/json',
				    success: callback,
				    error: callback,
				    then: callback
				})
			},
			meta: function (data) {
				return $.get(m.baseUrl + 'api/profiles/meta', null, 'json')
			},
			allFromId: function (id, callback) {
				return $.get(m.baseUrl + 'api/profiles/all-from-institution?id=' + id, callback, 'json').error(callback)
			},
			saveMeta: function (data) {
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/profiles/meta',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				})				
			}
		},
		snapshots: {
			all: function () {
				return $.get(m.baseUrl + 'api/snapshots/all', null, 'json')
			},
			single: function (id) {
				return $.get(m.baseUrl + 'api/snapshots/single?id=' + id, null, 'json')
			},
			save: function (data, institution) {
				data.institution = institution._id
				data.year = new Date().getFullYear()
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/snapshots/save',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				    contentType : 'application/json'
				})					
			},
			meta: function (data) {
				return $.get(m.baseUrl + 'api/snapshots/meta', null, 'json')
			},
			saveMeta: function (data) {
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/snapshots/meta',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				})				
			}
		},
		benchmarks: {
			all: function () {
				return $.get(m.baseUrl + 'api/benchmarks/all', null, 'json')
			},
			single: function (id) {
				return $.get(m.baseUrl + 'api/benchmarks/single?id=' + id, null, 'json')
			},
			save: function (data, callback) {
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/benchmarks/save',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				    contentType : 'application/json',
				    success: callback,
				    error: callback,
				    then: callback
				})
			},
			meta: function (data) {
				return $.get(m.baseUrl + 'api/benchmarks/meta', null, 'json')
			},
			saveMeta: function (data) {
				return $.post(m.baseUrl + 'api/benchmarks/meta', {data: data}, null, 'json')
			}
		}
	}

  	m.initBenchmark = function (institution, page, readonly) {
  		if (!institution) return
  		
	  	m.$root.view.institution = institution
		
		if (readonly) m.$root.pageData.readOnlyProfiles = true
		m.$root.pageData.institution = institution._id

		m.api.profiles.allFromId(institution._id, function (a) {
			m.$root.meta.institutionProfiles = a
			m.$applyAsync()
		})

	  	if (!!m.$root.view && !!m.$root.view.profiles[institution._id] && m.$root.view.profiles[institution._id].year === new Date().getFullYear()) {
  			m.$root.view.profiles[institution._id].users = m.$root.view.profiles[institution._id].users || []
  			if (typeof m.$root.pageData.user === 'number') {
  				m.setPage(page || 'benchmarks')
  			}
  			else {
  				m.setPage(page || 'profile')
  			}
  		}
  		else {
  			m.$root.view.profiles[institution._id] = m.$root.view.profiles[institution._id] || {}
  			m.$root.view.profiles[institution._id].users = m.$root.view.profiles[institution._id].users || []
  			m.$root.view.profiles[institution._id]['56e23d002761400d3e2716b7'] = m.$root.view.profiles[institution._id]['56e23d002761400d3e2716b7'] || institution.title
  			if (typeof m.$root.pageData.user === 'number') {
				m.setPage(page || 'benchmarks')
  			}
  			else {
  				m.setPage('profile')
  			}		
  		}
  	}

  	m.initApp = function () {
  		m.api.institutions.all().then(function (institutions) {
	  		m.api.profiles.meta().then(function (profileMeta) {
		  		m.api.snapshots.meta().then(function (snapshotMeta) {
			  		m.api.profiles.all().then(function (profiles) {
				  		m.api.benchmarks.meta().then(function (benchmarksMeta) {

				  			
				  			m.$root.meta.institutions = institutions
				  			m.$root.meta.snapshot = snapshotMeta
				  			m.$root.meta.profile = profileMeta
				  			m.$root.meta.benchmarks = benchmarksMeta
				  			m.$root.view.profiles = {}
				  			
				  			for (var i in profiles) {
			  					m.$root.view.profiles[profiles[i].institution] = profiles[i]
					  		}

							if (!!m.hash('page') && !!m.hash('institution')) {
								var institution
								for (var i in institutions) {
									if (institutions[i]._id === m.hash('institution')) institution = institutions[i]
								}
								m.initBenchmark(institution, m.hash('page'))
							}
							else {
								m.setPage()
							}
				  			m.$applyAsync()
				  		})
			  		})
		  		})
	  		})
  		})
  	}

  	m.saveBenchmark = function (test, consolidation) {
  		if (!m.$root.view.profiles || !m.$root.view.profiles[m.$root.view.institution._id] || !m.$root.view.profiles[m.$root.view.institution._id].users[m.$root.pageData.user]) return false
  		if (test) return true
  		m.loading = true;
	  	m.$applyAsync()
        var data = {
            user: m.$root.pageData.user,
            institution: m.$root.pageData.institution,
            benchmarkData: (m.$root.view.profiles[m.$root.view.institution._id].users[m.$root.pageData.user].benchmarks || {})[m.$root.meta.benchmarks[m.$root.pageData.benchmark]._id],
            benchmarkID: m.$root.meta.benchmarks[m.$root.pageData.benchmark]._id
        }
        if (consolidation) {
            m.saveProfile(true)
            setTimeout(function () {
				m.$root.hasChanged = false
			}, 100)
        }
  		m.api.benchmarks.save(data, function () {
			toastr["success"](m.$root.meta.benchmarks[m.$root.pageData.benchmark].title + ' saved')
  			m.loading = false
  			m.$root.hasChanged = false
			setTimeout(function () {
				m.$root.hasChanged = false
			}, 100)  			
	  		m.$applyAsync()
  		})
  	}

  	m.test = function (a) {
  		console.log('Test!')
  	}

  	m.openLinksInNewWindow = function (html) {
  		var j = $('<p>' + html + '</p>')

  		j.find('a').each(function (i, el) {
  			el.target = '_blank'
  		})



  		return j.html() !== 'undefined' ? j.html()  : 'Comments...'
  	}

  	m.isReadonly = function () {
  		return m.$root.pageData.readOnly || m.$root.pageData.readOnlyProfiles
  	}

  	m.showEditor = function (scope, title, a) {
  		if (m.isReadonly()) return false
  		swal({
  			title: title,
  			text: "<textarea id=\"text-editor\">"+ (scope.$eval(a) || '') + "</textarea>",
  			html: true,
  			},
  			function (inputValue) {
				if (inputValue === false) return false
				if ((scope.$eval(a) || "") != (tinyMCE.activeEditor.getContent() || '')) {
					m.$root.hasChanged = true
				}
				scope.$eval(a + ' = _temp', {_temp: tinyMCE.activeEditor.getContent() || ''})
				tinymce.execCommand('mceRemoveControl', true, '#text-editor');
				$('input#hiddenInput').focus()
				$('input#hiddenInput').click()
				
				m.$applyAsync()

			}
  		)

  		tinymce.init({
  			selector:'#text-editor',
			plugins: 'link image code',
			toolbar: 'bold italic underline fontsizeselect outdent indent |  alignleft aligncenter alignright  image link  bullist numlist',
			menubar: 'edit insert format ',
			height: '250px',
			statusbar: false,  			
  		}).then(function (a, b) {
  			text = a
  			
  		})
  	}

  	m.addUser = function () {
  		swal({
			title: "Add new team member",
			text: "Please enter the name of the new team member:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "slide-from-top",
			inputPlaceholder: "Name of team member"
		}, function(inputValue) {
			if (inputValue === false) return false;
			if (inputValue === "") {
				swal.showInputError("You need to write something!");
				return false
			}
			var puid = new Date().getTime() + '-' + (Math.random() * 10000000000).toFixed(0)
			m.$root.view.profiles[m.$root.view.institution._id].users.push({id: puid, name: inputValue})
			m.$root.pageData.user = puid

			m.api.profiles.save(m.$root.view.profiles[m.$root.view.institution._id] || {}, m.$root.view.institution, function () {
				m.initBenchmark(m.$root.view.institution)
			})

			m.$applyAsync()
		});
  	}

  	m.fixLabels = function fixLabels () {
  		$('.mce-label').each(function (i, el) {
			var el = $(el)
			if (el.html().trim() === 'Url') el.html(el.html().replace('Url', 'URL'))
		})
  	}



	m.$root.pageData = m.hash()

    m.trust = m.trustAsHtml = $sce.trustAsHtml

	m.loading = false

	if (m.$root.pageData.page === 'home' || !m.$root.pageData.page) {
		m.$root.view.institution = null
		m.tab = m.$root.pageData
	}

  	m.initApp()

  	m.$watch('$root.pageData', function (a, b) {
		if (a.page === 'benchmarks' && typeof a.user !== 'number') {
			a.page = 'select-user'
		}
  		m.hash(a)
  		if (a.page !== b.page || !m.pageUrl) m.pageUrl = $sce.trustAsResourceUrl(m.baseUrl + 'sys/pages/' + (a.page || 'home') + '.html')
  	}, true)

  	m.loaded = 0
  	m.$watch('$root.view.profiles["' + m.$root.pageData.institution + '"].users[' + m.$root.pageData.user + ']', function () {
  		if (m.loaded < 2) m.loaded++
  		else {
  			m.$root.hasChanged = true
  		}
  		
  	}, true)



	document.addEventListener('click', m.fixLabels)
	document.addEventListener('mouseup', m.fixLabels)
	document.addEventListener('pointerup', m.fixLabels)
	document.addEventListener('touchend', m.fixLabels)

	


})


.directive('markdown', function () {
	return function (scope, element, attrs) {
		scope.$watch(attrs.markdown, function (a) {
			element.html(markdown.toHTML(a || String(' ')))
		})
	}
})

.directive('multiline', function () {
	return function (scope, element, attrs) {

		element.html(scope.$eval(attrs.ngModel) || scope.$eval(attrs.placeholder) || '')

		var options = {
			editor: element[0], // {DOM Element} [required]
			class: 'pen', // {String} class of the editor,
			debug: false, // {Boolean} false by default
			textarea: '<textarea name="content"></textarea>', // fallback for old browsers
			stay: false,
  			list: ['bold', 'italic', 'underline', 'createlink', 'insertorderedlist', 'insertunorderedlist'] // editor menu list
		},

		editor = new Pen(options),

		changed = function () {
			scope.$eval(attrs.ngModel + ' = _data', {_data: editor._prevContent })
  			m.$root.hasChanged = true
  			m.$applyAsync()
		}

		editor.on('input', changed)
		editor.on('change', changed)


	}
})

.config(['$compileProvider', function ($compileProvider) {
	$compileProvider.debugInfoEnabled(false);
}])


/*Directives*/
.directive('touch', function () {
	return function (scope, element, attrs) {
		element.bind('pointerdown', function () {
			try {
				scope.$apply(attrs.touch)
			} catch (e) {}
		});
	};
})

.directive('usqClick', function () {
	return function (scope, element, attrs) {
		element.bind('click', function () {
			if (!!element.attr('disabled') || !!element.hasClass('disabled') || (!!element.attr('readonly') || !!element.hasClass('readonly'))) return
			try {
				scope.$applyAsync(attrs.usqClick)
			} catch (e) {}
		});
	};
})

.directive('tipped', function () {
	return function (scope, element, attrs) {
		Tipped.create(element, attrs.tipped);
	};
})


.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    '*',
    '**',
    'https://acode-benchmark-tool.herokuapp.com/*',
    'https://acode-benchmark-tool.herokuapp.com/**',
    'http://acode-benchmark-tool.herokuapp.com/*',
    'http://acode-benchmark-tool.herokuapp.com/**'
  ])

})



/*keyboard shortcuts*/
key = {}
document.addEventListener('keydown', function (e) {
	key[e.keyCode] = true
	var ctrl = (key[17] || key[91] || key[93] || key[224])
	

	/*CTRL S*/
	if (ctrl && key[83]) {
		document.body.blur()
		setTimeout(function () {
			m.saveBenchmark(false, false)
			m.saveProfile()
		}, 200)
		e.preventDefault()
		e.stopPropagation()
	}
})

document.addEventListener('keyup', function (e) {
	key[e.keyCode] = false
})
