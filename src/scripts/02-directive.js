var app = angular.module('ngCkeditor', []);

app.directive('ckeditor', function () {
        'use strict';

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function (scope, element, attrs, ngModel) {
                var expression = attrs.ngModel;
                var el = $(element);

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
                        /*{ name: 'colors', items : ['bazalt-image'] },*/
                    ],
                    disableNativeSpellChecker: false,
                    uiColor: '#FAFAFA',
                    height: '400px',
                    width: '100%'
                };
                //CKEDITOR.config.spellerPagesServerScript = '/examples/spellcheck/handler.php';
                options = angular.extend(options, scope[attrs.ckeditor]);
                var instance = CKEDITOR.replace(el.get(0), options);

                element.bind('$destroy', function () {
                    instance.destroy(false);
                });
                instance.on('instanceReady', function () {
                    instance.setData(ngModel.$viewValue);
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
                instance.on('key', function() {
                    ngModel.$setViewValue(instance.getData());
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });

                ngModel.$render = function () {
                    instance.setData(ngModel.$viewValue);
                };

                scope.$watch(expression, function () {
                    if (!instance) {
                        return;
                    }
                    if (ngModel.$viewValue == instance.getData()) {
                        return;
                    }
                    instance.setData(ngModel.$viewValue);
                });
                scope.$watch(function () {
                    if (!element) {
                        return null;
                    }
                    return instance.getData();
                }, function (val, oldVal) {
                    if (val === '' && angular.isDefined(oldVal) && oldVal !== '') { // when ckeditor loaded first
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
    });