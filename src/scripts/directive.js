angular
    .module('ngCkeditor', [])
    .directive('ckeditor', function () {
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

                /*var basePath = CKEDITOR.basePath;
                 basePath = basePath.substr(0, basePath.indexOf("ckeditor/"));
                 (function() {
                 CKEDITOR.plugins.addExternal('aspell',basePath+'../src/plugins/aspell/', 'plugin.js');
                 CKEDITOR.plugins.addExternal('aspell',basePath+'../src/plugins/youtube/', 'plugin.js');
                 })();
                 */
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
                    width: '100%'//,
                    //extraPlugins: "youtube,aspell" //"backup,onchange"
                };
                CKEDITOR.config.spellerPagesServerScript = '/examples/spellcheck/handler.php';
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

                ngModel.$render = function () {
                    instance.setData(ngModel.$viewValue);
                };

                scope.$watch(expression, function () {
                    if (!instance) {
                        return;
                    }
                    if (scope[expression] == instance.getData()) {
                        return;
                    }
                    //instance.setData(ngModel.$viewValue);
                });
                scope.$watch(function () {
                    if (!element) {
                        return null;
                    }
                    return instance.getData();
                }, function () {
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