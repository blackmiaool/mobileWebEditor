function get_pure_html() {
    var miao = $("#editor-block-container").clone();
    miao.find(".editor-only").remove();
    var attrs = [
                        "contenteditable",
                        "ng-repeat",
                        "data-index",
                        "draggable",
                        "ng-style",

                        "ng-dblclick",
                        "ng-click",
                        "dnd-draggable",
                        "dnd-effect-allowed",
                        "dnd-selected",
                        "dnd-list",
                        "dnd-moved",

                        "editor-model",
                        "data-title",
                        "ng-model",
                        "ng-src",
                        "strip-br",
                        "select-non-editable",
                        "ng-href",
                    ]
    attrs = attrs.join(" ")
    var classes = [
                        "ng-scope",
                        "ng-pristine",
                        "ng-untouched",
                        "ng-valid",
                        "ng-dirty",
                        "ng-valid-parse",
                    ]
    classes = classes.join(" ")
    var targets = miao.find("*");

    targets.removeAttr(attrs)
    miao.removeAttr(attrs)


    targets.removeClass(classes)
    miao.removeClass(classes)
    var output = miao[0].outerHTML;
    output = output.replace(/<!--[\w\W\r\n]*?-->/gmi, "");
    output = output.replace(/class=""/g, "");
    output = output.replace(/name=""/g, "");
    return output;
}

function preview_load(data, callback) {
    var ifa = document.createElement("iframe");
    ifa.src = "output_tpl2.html";
    ifa.id = "miot-html-editor-output";
    var ifa_pre = document.getElementById("miot-html-editor-output");
    ifa_pre.parentNode.replaceChild(ifa, ifa_pre);
    ifa.onload = function () {

        ifa.contentDocument.title = angular.element("#main-editor").scope().instance.global_prop.top_bar_title;
//   
//            var sh=ifa.contentDocument.createElement("script");
//            var script='(function () \ { \
//    var result = {}; \
//    if (!window.MiComBridge || !window.MiComBridge.onBackPressed || !(Object.prototype.toString.call(window.MiComBridge \
//        .onBackPressed) === "[object Function]")) { \
//        result = { \
//            "event": "onBackPressed", \
//            "body": { \
//                "handled": false \
//            } \
//        } \
//    } else { \
//        result = window.MiComBridge.onBackPressed() \
//    } \
//    var messageUrl = "micomsheme://" + JSON.stringify(result); \
//    var messagingIframe = \ document.getElementById("MiComBridgeIframe"); \
//    if (!messagingIframe) { \
//        messagingIframe = document.createElement("iframe"); \
//        messagingIframe.style.display = "none"; \
//        document.documentElement.appendChild(messagingIframe) \
//    } \
//    messagingIframe.src = messageUrl \
//})();' ;
//            sh.innerHTML=script;
//            ifa.contentDocument.head.appendChild(sh);
      
        ifa.contentDocument.getElementById("wrap").innerHTML = data;
        if (callback) {
            //            console.log($(ifa).contents().find("html")[0].outerHTML);

            callback($(ifa).contents().find("html")[0].outerHTML)
        }

        var scripts = ifa.contentDocument.getElementsByTagName("script");
        var len = scripts.length;

        var to_remove = [];
        for (var i = 0; i < len; i++) {


            if (!scripts[i].src) {
                to_remove.push(i);
                var miaoS = document.createElement("script");
                miaoS.innerHTML = scripts[i].innerHTML;
                ifa.contentDocument.getElementById("wrap").appendChild(miaoS)
            }

        }
        for (var i in to_remove) {
            scripts[i].parentNode.removeChild(scripts[i])
        }
        //                ifa.contentDocument.getElementById("forEdit").parentNode.removeChild(ifa.contentDocument.getElementById("forEdit"))
        //                console.log(scripts)

        function getDocHeight(D) {

            return Math.max(
                Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
                Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
                Math.max(D.body.clientHeight, D.documentElement.clientHeight)
            );
        }

        setTimeout(
            function () {
                var subWeb = ifa.contentDocument;
                if (ifa != null && subWeb != null) {
                    ifa.height = getDocHeight(subWeb) + 20;
                }
            }, 100
        )
    }
}