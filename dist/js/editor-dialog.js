$(function () {
    setTimeout(function () {
        var diffx, diffy;
        var draging = false;
        $("#editor-data-dialog>.panel-heading").mousedown(function (e) {

            draging = true;
            diffx = e.pageX - parseInt($(this).parent().css("left"));
            diffy = e.pageY - parseInt($(this).parent().css("top"));
        });

        function editor_drag(e) {
            if (draging) {
                var dialog = $("#editor-data-dialog");
                var left = e.pageX - diffx;
                var top = e.pageY - diffy;
                var width = parseInt(dialog.css("width"));
                var height = parseInt(dialog.css("height"));

                if (left < 0) left = 0;else if (left >= parseInt(document.body.clientWidth) - width) left = parseInt(document.body.clientWidth) - width - 1;

                if (top < 0) top = 0;else if (top >= parseInt(document.documentElement.clientHeight) - height) top = parseInt(document.documentElement.clientHeight) - height - 1;

                //                            console.log(document.body, height)
                $("#editor-data-dialog").css("left", left + "px");
                $("#editor-data-dialog").css("top", top + "px");
            }
        }
        $("body").mousemove(editor_drag);
        $("#editor-data-dialog").mouseleave(editor_drag);
        $("#editor-data-dialog").mouseup(function (e) {
            draging = false;
        });
    }, 200);
});