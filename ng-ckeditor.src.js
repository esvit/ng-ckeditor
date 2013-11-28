(function(angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['angular', 'ckeditor'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
var app = angular.module('ngCkeditor', []);
var $defer, loaded = false;

app.run(['$q', '$timeout', function($q, $timeout) {
    $defer = $q.defer();

    if (angular.isUndefined(CKEDITOR)) {
        throw new Error('CKEDITOR not found');
    }
    CKEDITOR.disableAutoInline = true;
    function checkLoaded() {
        if (CKEDITOR.status == 'loaded') {
            loaded = true;
            $defer.resolve();
        } else {
            checkLoaded();
        }
    }
    CKEDITOR.on('loaded', checkLoaded);
    $timeout(checkLoaded, 100);
}])

app.directive('ckeditor', ['$timeout', '$q', function ($timeout, $q) {
    'use strict';

    return {
        restrict: 'AC',
        require: 'ngModel',
        scope: false,
        link: function (scope, element, attrs, ngModel) {
            var EMPTY_HTML = '<p></p>',
                isTextarea = element[0].tagName.toLowerCase() == 'textarea';

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

                var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
                    configLoaderDef = $q.defer();

                element.bind('$destroy', function () {
                    instance.destroy(
                        false //If the instance is replacing a DOM element, this parameter indicates whether or not to update the element with the instance contents.
                    );
                });
                var setModelData = function() {
                    $timeout(function () { // for key up event
                        ngModel.$setViewValue(instance.getData());
                    }, 0);
                }, onUpdateModelData = function() {
                    scope.$apply(function() {
                        instance.setData(ngModel.$viewValue || EMPTY_HTML);
                    });
                }

                instance.on('pasteState',   setModelData);
                instance.on('change',       setModelData);
                instance.on('blur',         setModelData);
                instance.on('key',          setModelData); // for source view

                instance.on('instanceReady', onUpdateModelData);
                instance.on('customConfigLoaded', function() {
                    configLoaderDef.resolve();
                });

                ngModel.$render = function() {
                    instance.setData(ngModel.$viewValue || EMPTY_HTML);
                };

                scope.$watch(function () {
                    if (!element) {
                        return null;
                    }
                    return instance.getData();
                }, function (val, oldVal) {
                    /*if (val === EMPTY_HTML && (angular.isUndefined(oldVal) || oldVal === EMPTY_HTML)) { // when ckeditor loaded first
                        return;
                    }*/
                    setModelData();
                });
            };

            if (CKEDITOR.status == 'loaded') {
                loaded = true;
            }
            if (loaded) {
                onLoad();
            } else {
                $defer.promise.then(onLoad);
            }
        }
    };
}]);
    return app;
}));