

angular.module('2015-1858 - acode-benchmark-assessment-tool', ['tonen'])


/*The controllers*/
.controller('master', function master ($scope, $sce, $firebaseObject, $firebaseArray) {
	m = $scope

	m.baseUrl = _baseUrl

	m.setPage = function (page) {
		m.pageUrl = $sce.trustAsResourceUrl(m.baseUrl + 'sys/pages/' + (page || 'home.html'))
		m.$applyAsync()
	}

	m.setPage()


  	m.institutions = $firebaseObject(new Firebase("https://acode-benchmark-tool.firebaseio.com/institution-list"))

  	m.init = function (institution) {
  		if (!institution) return
  			
  		m.setPage('survey.html')
  		m.survey = $firebaseObject(new Firebase("https://acode-benchmark-tool.firebaseio.com/survey/" + institution))
		m.survey.$bindTo(m, "survey")
  	}

	/*
		m.institutions.$bindTo(m, "institutions")

		m.addInstitution = function (institution) {
		
			for (var i in m.institutions) {
				if (institution === m.institutions[i]) return false
			}

			m.institutions.list.push(institution)
			m.institutions.list.sort()
			m.$applyAsync()
		}
	*/

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
    'https://acode-benchmark-tool.firebaseapp.com/**'
  ])

})


