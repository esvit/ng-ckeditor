(function(angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define('ng-ckeditor', ['jquery', 'angular', 'ckeditor'], function($, angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
var app = angular.module('ngCkeditor', []);

app.directive('ckeditor', ['$timeout', function ($timeout) {
    'use strict';

    return {
        restrict: 'AC',
        require: 'ngModel',
        scope: false,
        link: function (scope, element, attrs, ngModel) {
            var isTextarea = element.is('textarea');

            if (!isTextarea) {
                element.attr('contenteditable', true);
            }

            CKEDITOR.disableAutoInline = true;
            if (angular.isUndefined(CKEDITOR) || angular.isUndefined(CKEDITOR.instances)) {
                return;
            }

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
                instance.setData(ngModel.$viewValue || '<p></p>');
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
                $timeout(function() {
                    ngModel.$setViewValue(instance.getData());
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }, 0);
            });

            ngModel.$render = function () {
                instance.setData(ngModel.$viewValue || '<p></p>');
            };

            scope.$watch(function () {
                if (!element) {
                    return null;
                }
                return instance.getData();
            }, function (val, oldVal) {
                if (val === '' && (angular.isUndefined(oldVal) || oldVal === '')) { // when ckeditor loaded first
                    return;
                }
                ngModel.$setViewValue(instance.getData());
            });
            instance.on('blur', function () {
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });
        }
    };
}]);
    return app;
}));