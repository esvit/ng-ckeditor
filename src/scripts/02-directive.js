var app = angular.module('ngCkeditor', []);
var $defer, loaded = false;

app.run(['$q', function($q) {
    $defer = $q.defer();

    if (angular.isUndefined(CKEDITOR)) {
        throw new Error('CKEDITOR not found');
    }
    CKEDITOR.disableAutoInline = true;
    CKEDITOR.on('loaded', function () {
        loaded = true;
        $defer.resolve();
    });
}])

app.directive('ckeditor', ['$timeout', '$q', function ($timeout, $q) {
    'use strict';

    return {
        restrict: 'AC',
        require: 'ngModel',
        scope: false,
        link: function (scope, element, attrs, ngModel) {
            var EMPTY_HTML = '<p></p>',
                isTextarea = element.is('textarea');

            if (!isTextarea) {
                element.attr('contenteditable', true);
            }

            var onLoad = function () {
                var options = {
                    toolbar: 'full',
                    toolbar_full: [
                        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', 'Underline' ] },
                        { name: 'paragraph', items: [ 'BulletedList', 'NumberedList', 'Blockquote' ] },
                        { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
                        { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                        { name: 'tools', items: [ 'SpellChecker', 'Maximize' ] },
                        '/',
                        { name: 'styles', items: [ 'Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat' ] },
                        { name: 'insert', items: [ 'Image', 'Table', 'SpecialChar' ] },
                        { name: 'forms', items: [ 'Outdent', 'Indent' ] },
                        { name: 'clipboard', items: [ 'Undo', 'Redo' ] },
                        { name: 'document', items: [ 'PageBreak', 'Source' ] }
                    ],
                    disableNativeSpellChecker: false,
                    uiColor: '#FAFAFA',
                    height: '400px',
                    width: '100%'
                };
                options = angular.extend(options, scope[attrs.ckeditor]);

                var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options);

                element.bind('$destroy', function () {
                    instance.destroy(false);
                });
                instance.on('instanceReady', function () {
                    instance.setData(ngModel.$viewValue || EMPTY_HTML);
                });
                instance.on('pasteState', function () {
                    ngModel.$setViewValue(instance.getData());
                });
                instance.on('change', function () {
                    ngModel.$setViewValue(instance.getData());
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });

                // for source view
                instance.on('key', function () {
                    $timeout(function () {
                        ngModel.$setViewValue(instance.getData());
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }, 0);
                });

                ngModel.$render = function () {
                    instance.setData(ngModel.$viewValue || EMPTY_HTML);
                };

                scope.$watch(function () {
                    if (!element) {
                        return null;
                    }
                    return instance.getData();
                }, function (val, oldVal) {
                    if (val === EMPTY_HTML && (angular.isUndefined(oldVal) || oldVal === EMPTY_HTML)) { // when ckeditor loaded first
                        return;
                    }
                    ngModel.$setViewValue(instance.getData());
                });
                instance.on('blur', function () {
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });
            };

            if (loaded) {
                onLoad();
            } else {
                $defer.promise.then(onLoad);
            }
        }
    };
}]);