

angular.module('2015-1858 - acode-benchmark-assessment-tool', ['ui.bootstrap'])


/*The controllers*/
.controller('master', function master ($scope, $sce) {
	m = $scope

	m.$root.view = {}

	m.$root.meta = {}

	m.baseUrl = _baseUrl

	m.setPage = function (page) {
		m.pageUrl = $sce.trustAsResourceUrl(m.baseUrl + 'sys/pages/' + (page || 'home.html'))
		m.$applyAsync()
	}

	m.setPage()

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
			save: function (data, institution) {
				data.institution = institution._id
				data.year = new Date().getFullYear()
				return $.ajax({
					type: "POST",
					url: m.baseUrl + 'api/profiles/save',
					dataType: 'json',
					data: JSON.stringify({data: data}),
				    contentType : 'application/json'
				})					
			},
			meta: function (data) {
				return $.get(m.baseUrl + 'api/profiles/meta', null, 'json')
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
		benchmarks: {
			all: function () {
				return $.get(m.baseUrl + 'api/benchmarks/all', null, 'json')
			},
			single: function (id) {
				return $.get(m.baseUrl + 'api/benchmarks/single?id=' + id, null, 'json')
			},
			save: function (data) {
				return $.post(m.baseUrl + 'api/benchmarks/save', {data: data}, null, 'json')
			},
			meta: function (data) {
				return $.get(m.baseUrl + 'api/benchmarks/meta', null, 'json')
			},
			saveMeta: function (data) {
				return $.post(m.baseUrl + 'api/benchmarks/meta', {data: data}, null, 'json')
			}
		}
	}

  	m.initBenchmark = function (institution) {
  		if (!institution) return
  		
	  	m.$root.view.institution = institution

	  	if (!!m.$root.view.profiles[institution._id] && m.$root.view.profiles[institution._id].year === new Date().getFullYear()) {
  			m.setPage('benchmarks.html')
  		}
  		else {
  			m.$root.view.profiles[institution._id] = m.$root.view.profiles[institution._id] || {}
  			m.$root.view.profiles[institution._id]['56e23d002761400d3e2716b7'] = m.$root.view.profiles[institution._id]['56e23d002761400d3e2716b7'] || institution.title
			m.setPage('profile.html')
  		}
  	}

  	m.initApp = function () {
  		m.api.institutions.all().then(function (institutions) {
	  		m.api.profiles.meta().then(function (profileMeta) {
		  		m.api.profiles.all().then(function (profiles) {
		  			
		  			m.$root.meta.institutions = institutions
		  			m.$root.meta.profile = profileMeta
		  			m.$root.view.profiles = {}
		  			
		  			for (var i in profiles) {
	  					m.$root.view.profiles[profiles[i].institution] = profiles[i]
			  		}
		  			m.$applyAsync()
		  		})
	  		})
  		})
  	}

  	m.initApp()


})


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

.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    '*',
    '**',
    'https://acode-benchmark-tool.herokuapp.com/*',
    'https://acode-benchmark-tool.herokuapp.com/**'
  ])

})


