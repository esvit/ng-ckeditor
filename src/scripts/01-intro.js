(function(angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define('ng-ckeditor', ['jquery', 'angular', 'ckeditor'], function($, angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {