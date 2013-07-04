angular
    .module('ngCkeditor', [])
    .directive('ckeditor', function() {
    var index = 0;
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            var expression = attrs.ngModel;
            var el = $(element);

            if (angular.isUndefined(CKEDITOR) || angular.isUndefined(CKEDITOR.instances)) {
                return;
            }

            var instance = CKEDITOR.replace(el.get(0),
            {
                toolbar_full:
                    [
                        { name: 'document', items : [] },
                        { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                        { name: 'editing', items : [ 'Find','Replace','-','SpellChecker', 'Scayt' ] },
                        { name: 'forms', items : [] },
                        { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript' ] },
                        { name: 'paragraph', items : [
                            'NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
                        { name: 'links', items : [] },
                        { name: 'insert', items : [ 'SpecialChar' ] },
                        '/',
                        { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                        { name: 'colors', items : [] },
                        { name: 'tools', items : [ 'Maximize', 'bazalt-image' ] }
                    ]
                ,
                uiColor: '#FAFAFA',
                height: '400px',
                width: '100%',
                //extraPlugins: "bazalt-cms"
            });
            
            var editor = instance;
//		// Test:
//		editor.on( 'change', function(e) { console.log( e ) });

		var timer,
			theMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
			observer;
// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
// http://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/

		// Kill the timer on editor destroy
		editor.on( 'destroy', function() { if ( timer ) clearTimeout( timer ); timer = null; });

		// in theory this block should be enabled only for browsers that don't support MutationObservers,
		// but it doesn't seem to fire correctly in all the situations. Maybe in the future...
		{
			// Set several listeners to watch for changes to the content
			editor.on( 'saveSnapshot', function( evt )
			{
				if ( !evt.data || !evt.data.contentOnly )
					somethingChanged();
			});

			var undoCmd = editor.getCommand('undo');
			undoCmd && undoCmd.on( 'afterUndo', somethingChanged);
			var redoCmd = editor.getCommand('redo');
			redoCmd && redoCmd.on( 'afterRedo', somethingChanged);

			editor.on( 'afterCommandExec', function( event )
			{
				if ( event.data.name == 'source' )
					return;

				if ( event.data.command.canUndo !== false )
					somethingChanged();
			} );
		}

		if ( theMutationObserver )
		{
			observer = new theMutationObserver( function( mutations ) {
				somethingChanged();
			} );

			// To check that we are using a cool browser.
			if (window.console && window.console.log)
				console.log("Detecting changes using MutationObservers");
		}

		// Changes in WYSIWYG mode
		editor.on( 'contentDom', function()
			{
				if ( observer )
				{
					// A notification is fired right now, but we don't want it so soon
					var interval = setInterval( function() {
						if ( typeof editor.document === 'object' ) {
							observer.observe( editor.document.getBody().$, {
								attributes: true,
								childList: true,
								characterData: true
							});
							clearInterval(interval);
						}
					}, 100);
				}

				editor.document.on( 'keydown', function( event )
					{
						// Do not capture CTRL hotkeys.
						if ( event.data.$.ctrlKey ||event.data.$.metaKey )
							return;

						var keyCode = event.data.$.keyCode;
						// Filter movement keys and related
						if (keyCode==8 || keyCode == 13 || keyCode == 32 || ( keyCode >= 46 && keyCode <= 90) || ( keyCode >= 96 && keyCode <= 111) || ( keyCode >= 186 && keyCode <= 222) || keyCode == 229)
							somethingChanged();
					});

					// Firefox OK
				editor.document.on( 'drop', somethingChanged);
					// IE OK
				editor.document.getBody().on( 'drop', somethingChanged);
			});

		// Detect changes in source mode
		editor.on( 'mode', function( e )
			{
				if ( editor.mode != 'source' )
					return;

				var textarea = (editor.textarea || editor._.editable);
				textarea.on( 'keydown', function( event )
					{
						// Do not capture CTRL hotkeys.
						if ( !event.data.$.ctrlKey && !event.data.$.metaKey )
							somethingChanged();
					});

				textarea.on( 'drop', somethingChanged);
				textarea.on( 'input', somethingChanged);
				if (CKEDITOR.env.ie)
				{
					textarea.on( 'cut', somethingChanged);
					textarea.on( 'paste', somethingChanged);
				}
			});

		// Avoid firing the event too often
		function somethingChanged()
		{
			// don't fire events if the editor is readOnly as they are false detections
			if (editor.readOnly)
				return;

			if (timer)
				return;

			timer = setTimeout( function() {
				timer = 0;
                ngModel.$setViewValue(instance.getData());
                if (!scope.$$phase) {
                    scope.$apply();
                }
			}, editor.config.minimumChangeMilliseconds || 100);
		}

            element.bind('$destroy', function() {
                instance.destroy(false);
            });
            instance.on('instanceReady', function() {
                instance.setData(ngModel.$viewValue);
            });
            instance.on('pasteState', function() {
                //scope.$apply(function() {
                ngModel.$setViewValue(instance.getData());
                //});
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