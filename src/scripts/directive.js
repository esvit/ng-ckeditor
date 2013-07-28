angular
    .module('ngCkeditor', [])
    .directive('ckeditor', function() {
    var index = 0;
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function(scope, element, attrs, ngModel) {
            var expression = attrs.ngModel;
            var el = $(element);

            if (angular.isUndefined(CKEDITOR) || angular.isUndefined(CKEDITOR.instances)) {
                return;
            }

            var basePath = CKEDITOR.basePath;
            basePath = basePath.substr(0, basePath.indexOf("ckeditor/"));
            (function() {
                CKEDITOR.plugins.addExternal('aspell',basePath+'../src/plugins/aspell/', 'plugin.js');
            })();

            var options = {
                toolbar: 'full',
                toolbar_full:
                [
                    { name: 'document', items : [] },
                    { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                    { name: 'editing', items : [ 'Find','Replace','-'/*,'SpellCheck' */] },
                    { name: 'forms', items : [] },
                    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript' ] },
                    { name: 'paragraph', items : [
                        'NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
                    { name: 'links', items : ['Source'] },
                    { name: 'insert', items : [ 'SpecialChar' ] },
                    '/',
                    { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                    { name: 'colors', items : [] },
                    { name: 'tools', items : [ 'Maximize', 'Youtube' ] }
                ],
                disableNativeSpellChecker: false,
                uiColor: '#FAFAFA',
                height: '400px',
                width: '100%',
                extraPlugins: "youtube,aspell" //"backup,onchange"
            };
            CKEDITOR.config.spellerPagesServerScript = '/examples/spellcheck/handler.php';
            options = angular.extend(options, scope[attrs.ckeditor]);
            var instance = CKEDITOR.replace(el.get(0), options);

            element.bind('$destroy', function() {
                instance.destroy(false);
            });
            instance.on('instanceReady', function() {
                instance.setData(ngModel.$viewValue);
            });
            instance.on('pasteState', function() {
                ngModel.$setViewValue(instance.getData());
            });
            instance.on('change', function() {
                ngModel.$setViewValue(instance.getData());
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });

            ngModel.$render = function(value) {
                instance.setData(ngModel.$viewValue);
            };

            scope.$watch(expression, function (val) {
                if (!instance) return;
                if (scope[expression] == instance.getData()) return;
                instance.setData(ngModel.$viewValue);
            });
            scope.$watch(function() {
                if (!element) {
                    return null;
                }
                return instance.getData();
            }, function (val) {
                ngModel.$setViewValue(instance.getData());
            });
            instance.on('blur', function(e) {
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });
        }
    };
});