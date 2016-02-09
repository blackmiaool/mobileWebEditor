angular.module("main").directive('cellHighlight', function () {
        return {
            restrict: 'C',
            link: function postLink(scope, iElement, iAttrs) {
                iElement.find('td')
                    .mouseover(function () {
                        $(this).parent('tr').css('opacity', '0.7');
                    }).mouseout(function () {
                        $(this).parent('tr').css('opacity', '1.0');
                    });
            }
        };
    }).directive('context', ["sysSettingData",function (sysSettingData) {
        return {
            restrict: 'A',
            scope: '@&',
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        var ul = $('#' + iAttrs.context),
                            last = null;

                        ul.css({
                            'display': 'none'
                        });
                        $(iElement).bind('contextmenu', function (event) {
                           if(!sysSettingData.value.use_contextmenu){
                               return;
                           } scope.$parent.$parent.current_div = scope.model;
                            event.preventDefault();
                            ul.css({
                                position: "fixed",
                                display: "block",
                                left: event.clientX + 'px',
                                top: event.clientY + 'px'
                            });
                            last = event.timeStamp;
                        });

                        $(document).click(function (event) {
                            var target = $(event.target);
                            if (!target.is(".popover") && !target.parents().is(".popover")) {
                                if (last === event.timeStamp)
                                    return;
                                ul.css({
                                    'display': 'none'
                                });
                            }
                        });
                    }
                };
            }
        };
    }]);