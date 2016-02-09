'use strict';
let local_port="8088";
if (window.location.href[7] === "1") {
    var url = `http://localhost:${local_port}/common`;
    var url_short = `http://localhost:${local_port}/`;
} else {
    var url = "http://support.io.mi.srv/common";
    var url_short = "http://support.io.mi.srv/"
}
var the_url1 = url + "/if_editor_data";
var the_url2 = url + "/if_editor_addon";
var sys_setting_global;
var saved_data;
var model_data_global_readonly;
angular.module("main", ["dndLists", "contenteditable", "ngAnimate", "ngRoute", "angularFileUpload"])
    .animation('.editor-document-slide', function () {
        var NG_HIDE_CLASS = 'ng-hide';
        return {
            beforeAddClass: function (element, className, done) {
                if (className === NG_HIDE_CLASS) {
                    element.slideUp(done);
                }
            },
            removeClass: function (element, className, done) {
                if (className === NG_HIDE_CLASS) {
                    element.hide().slideDown(done);
                }
            }
        };
    })
    .factory("globalShareData", function () {
        return {
            miao_parse: function (str) {
                try {
//                    eval("var a=" + str);
                    a=JSON.parse(str);
                } catch (e) {
                    console.warn(e);
                    a = false;
                }
                return a;

            }
        };
    })
    .factory("globalPropData", function () {
        return {
            prop: {}

        };
    })
    .factory("editorModels", ["$http", "$rootScope", "globalShareData", "$timeout", function ($http, $rootScope, globalShareData, $timeout) {
        var service = {}
        
        $http({
            method: 'POST',
            url: the_url2,
            data: {
                action: "list",
            }
        }).
        success(function (data, status, headers, config) {
            console.log("server models列表", data)
                //            service.list = data.result.list;
                //            console.log("model列表", data, data.result)
                //            data.result.forEach(
                //                function (d) {
                //                    console.log(d)
                //                }
                //            )
            if (!data.result)
                alert("先打开support，再打开这个。你没登录。")
            console.log(data.result)
            data.result.forEach(
                function (model) {
                    //                    console.log("server", model)
                    try {
                        var json = JSON.parse(model.data)
                        if (!json)
                            return;
                    } catch (e) {
                        console.warn("Parse model failed with error.", model);
                        return;
                    }


                    if (json && json.form) {
                        //                        console.log(json)
                        json.form = globalShareData.miao_parse(json.form);

                        var model_this = {};
                        model_this.editor_model_config = {
                            preview: true,
                            kind: json.kind,
                            model_data: json.form,
                            name: model.name
                        }
                        model_this.editor_general_block_style = clone(general_block_default_style);
                        model_this.editor_model_config.source = "server";
                        if (model_this.editor_model_config.model_data) {

                            model_this.editor_model_config.default_data = get_jsonform_default_value(model_this.editor_model_config.model_data);
                        }
                        model_this.editor_model_tpl = json.model;
                        //                        console.log(model)

                        $rootScope.$emit('softAppendModel', model_this)
                        MIOTEDITOR.models.push(model_this)
                        $timeout(
                            function () {
                                $rootScope.appendModel(model_this);
                            }
                        )

                    } else {
                        console.warn("Parse model failed.", model_this)
                    }

                }
            )
            $rootScope.models_loaded = true;

        }).
        error(function (data, status, headers, config) {
          
        });
        return service;
    }])
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|smarthome):/);
    }])
    .controller("rootController", ["$scope", "$http", "$timeout", "$rootScope", "modelData", "FileUploader", function ($scope, $http, $timeout, $rootScope, modelData, FileUploader) {
        $rootScope.title = "未命名文档";
        $scope.$rootScope = $rootScope;
        $scope.saving = false;
        $scope.export = function (data) {
            if (data) {
                exp(data);
            } else {
                preview_load(get_pure_html(), exp)
            }

            function generate_json() {
                var output = [];

                modelData.models.lists.forEach(function (v, i) {
                    switch (v.editor_model_config.name) {
                    case "img":
                        {
                            output.push({
                                Img: v.src
                            })
                            break;
                        }
                    case "img_nogap":
                        {
                            output.push({
                                Img: v.src
                            })
                            break;
                        }
                    }
                });
                return JSON.stringify(output);
            }

            function exp(data) {

                if ($rootScope.edit_mode == "single-file") {
                    $http({
                        method: 'POST',
                        url: $rootScope.target_url,
                        data: data
                    }).
                    success(function (data, status, headers, config) {}).
                    error(function (data, status, headers, config) {
                        
                    });


                    $http({
                        method: 'POST',
                        url: $rootScope.target_url.replace("tp=html", "tp=json"),
                        data: generate_json()
                    }).
                    success(function (data, status, headers, config) {}).
                    error(function (data, status, headers, config) {
                         
                    });
                } else if ($rootScope.edit_mode == "free") {
                    var id;
                    if (!$scope.document_id) {
                        id = undefined;
                    } else {
                        id = $scope.document_id;
                    }
                    console.log(data);
                    codemirror_editor.setValue(data);
                    $("#editor-generated-json").val(generate_json());
                    $http({
                        method: 'POST',
                        url: the_url1,
                        data: {
                            action: "upload",
                            html: data,
                            id: id,
                        }
                    }).
                    success(function (data, status, headers, config) {
                        console.log(data)
                        $http({
                            method: 'POST',
                            url: the_url1,
                            data: {
                                action: "get",
                                id: id,
                            }
                        }).
                        success(function (data, status, headers, config) {
                            $scope.editor_html_href = data.result.url;
                            $('#editor_html_qrcode').empty();
                            $('#editor_html_qrcode').qrcode($scope.editor_html_href);

                        }).
                        error(function (data, status, headers, config) {
                        


                        });

                    }).
                    error(function (data, status, headers, config) {
                        


                    });
                }

            }

        }

        setInterval(function () {
                $http({
                    method: 'POST',
                    url: url + "/if_mail",
                    data: {
                        receiver: "sunqimin@xiaomi.com",
                        title: "MIOT编辑器自动备份-" + $rootScope.title,
                        content: (escape(JSON.stringify(modelData.models))),

                    }
                }).success(function (data, status, headers, config) {
                    console.log(data)

                })
            }, 1000 * 60 * 10) //10min       

        $scope.save = function () {
            var id;
            if (!$scope.document_id) {
                id = undefined;
            } else {
                id = $scope.document_id;
            }
            console.log(modelData)
            if (!modelData.globalPropData) {
                set_global_prop_data();
            }
            $scope.saving = true;
            saved_data = JSON.stringify(modelData.models);
            model_data_global_readonly = modelData.models;
            $http({
                method: 'POST',
                url: url + "/if_mail",
                data: {
                    receiver: "sunqimin@xiaomi.com",
                    title: "MIOT编辑器保存时备份-" + $rootScope.title,
                    content: escape(saved_data)

                }
            }).success(function (data, status, headers, config) {
                //                console.log(data)

            })
            $http({
                method: 'POST',
                url: the_url1,
                data: {
                    action: "put",
                    title: $rootScope.title,
                    content: saved_data,
                    id: id,
                }
            }).
            success(function (data, status, headers, config) {
                console.log(data)
                $scope.saving = false;
                $scope.document_id = data.result.id;
            }).
            error(function (data, status, headers, config) {
               
                $scope.saving = false;

            });
        }
        var uploader = $scope.uploader = new FileUploader({
            url: url_short + '/image/cdnupload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'imageFilter',
            fn: function (item /*{File|FileLikeObject}*/ , options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/ , filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
            fileItem.upload();
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function (item) {
            //            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            //            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            //            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            //            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            //            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            //            console.info('onCancelItem', fileItem, response, status, headers);
        };
        var upload_mode;
        $rootScope.$on("upload_click", function (e, mode) {
            upload_mode = mode;
        });
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            //            console.info('onCompleteItem', fileItem, response, status, headers);
            fileItem.remote_url = response.result.urls.file;
            console.log(fileItem.target)
            switch (fileItem.target) {
            case "edit":
                {
                    for (var i in MIOTEDITOR.models) {
                        var model = MIOTEDITOR.models[i];
                        if (model.editor_model_config.name == "img") {
                            var pic = clone(model);
                            pic.editor_model_config.initialized = true;
                            pic.src = fileItem.remote_url;
                            $rootScope.$emit("appendModel", pic)
                        }
                    }
                    break;
                }
            }
            //            console.log(response.result.urls);
        };
        uploader.onCompleteAll = function () {
            //            console.info('onCompleteAll');            
            console.log(upload_mode)
            if (upload_mode == "you_pure_upload_pic") {

            } else {
                function add_model(name, params) {
                    for (var i in MIOTEDITOR.models) {
                        var model_src = MIOTEDITOR.models[i];
                        if (model_src.editor_model_config.name == name) {
                            var model = clone(model_src);
                            model.editor_model_config.initialized = true;
                            for (var i in params) {
                                model[i] = params[i];
                            }
                            //                            pic.src = fileItem.remote_url;
                            $rootScope.$emit("appendModel", model)
                        }
                    }
                }
                uploader.queue.sort(function (a, b) {
                    return parseInt(a.file.name) > parseInt(b.file.name)
                })
                uploader.queue.forEach(function (v, i, a) {
                    var params = {};
                    if (upload_mode == "pic_link_half") {
                        if (i % 2 == 1) {
                            params.src1 = a[i - 1].remote_url;
                            params.src2 = a[i].remote_url;
                            add_model(upload_mode, params)
                        }
                    } else {
                        params.src = v.remote_url;
                        add_model(upload_mode, params)
                    }

                })
                uploader.clearQueue();
            }
            //            console.log(uploader.queue)

        };

        //    console.info('uploader', uploader);


        $scope.upload = function () {

        }
    }])
    .filter("toollist", function () {
        return function (model_name) {
            //            console.log(model_name);
        };
    })
    .controller("editorFormController", function ($scope) {
        $scope.submit = function (values1, values2, index) {
            //            console.log(values)
            $scope.$emit("form_submit", values1, values2, index)
        }
        $scope.close = function () {
            $scope.$emit("form_close")
        }
        $scope.change = function () {

        }

    })
    .factory("sysSettingData", function () {
        var model = {
            schema: {
                developer_mode: {
                    type: "boolean",
                    title: "开发者模式（编辑器开发程序员专用，开启高级功能，容易丢失数据。）",
                    default: false,
                },
                use_contextmenu: {
                    type: "boolean",
                    title: "开启右键菜单(取消后方便审查有右键菜单的元素)",
                    default: true,
                },
                clean_mode: {
                    type: "boolean",
                    title: "纯净模式(预览内容去除ng属性,非开发者建议开启)",
                    default: true,
                },
                strict_leave_mode: {
                    type: "boolean",
                    title: "严格防退出模式(非开发者每次退出都提示，不考虑是否保存)",
                    default: true,
                },
                delay_time: {
                    type: "number",
                    title: "预览更新延迟时间(ms)",
                    default: 1000
                },
            }
        }
        var setting = localStorage.getItem("miot_editor_sys_setting");
        if (setting) {
            setting = JSON.parse(setting);
        } else {
            setting = get_jsonform_default_value(model);
            localStorage.setItem("miot_editor_sys_setting", JSON.stringify(setting));

        }
        model.value = setting;
        sys_setting_global = new function () {
            this.model = model;
            this.value = setting;
        };
        return sys_setting_global;
    })
    .factory("local", function () {
        var head = "miot_editor_"
        return {
            get: function (name, default_value) {
                name = head + name;
                var v = localStorage.getItem(name);
                if (!v) {
                    v = default_value;
                    localStorage.setItem(name, v);
                }
                return v;
            },
            save: function (name, value) {
                name = head + name;
                localStorage.setItem(name, value);
            }
        }
    })
    .directive("editorModel", ["$compile", "$rootScope", function ($compile, $rootScope) {

        return {
            priority: 10,
            scope: true,

            link: function ($scope, element, attr) {

                //                $scope.editor_tool_show = false;
                $scope.set_value = function (values1, values2) {
                    for (var i in values1) {
                        $scope[i] = values1[i];
                    }

                    if (typeof (values2) != "undefined") {
                        $scope.editor_general_block_style = clone(values2);
                    }

                }
                $scope.sync_model = function (tpl) {
                    $scope.editor_model_tpl = tpl;
                    var tools = element.find(".editor-block-tool");

                    element.empty();
                    element.append(tools)
                    var template = $compile($scope.editor_model_tpl)($scope);
                    element.append(template);
                }



                var item = $scope.$parent.item;
                if (!item)
                    return;
                //                console.log($rootScope)
                if (item.editor_model_config) {
                    if (!item.editor_model_config.initialized) {
                        item.editor_model_config.initialized = true;
                        angular.forEach(item.editor_model_config.default_data, function (v, k) {
                            item[k] = v;
                        })
                    }
                }




                //                if(item.editor_model_config){
                //                   item.editor_model_config.model_data.value=item; 
                //                }

                if (typeof (item.$$$init) == "undefined" || !typeof (item.$$$init)) {
                    item.$$$init = true;
                    //                    $scope.data = "www"
                }

                for (var i in item) {
                    if (i[0] != "$" && i != "item" && i != "constructor" && typeof ($scope.$parent[i]) == "undefined") {
                        //                            console.log(i);
                        //                        console.log($scope)
                        $scope[i] = item[i];
                    }
                }

                var template = $compile(item.editor_model_tpl)($scope);
                //                console.log(template)

                element.bind("mouseover", function (e) {

                    //                    console.log("enter");
                    $scope.set_current_model($scope.$index);


                })
                element.bind("dblclick", function (e) {
                    console.log("dbclick")
                })


                element.append(template);

                $scope.$watch(function (value) {
                    //                console.log($scope)

                    for (var i in $scope) {

                        if (i[0] != "$" && i != "item" && i != "constructor" && typeof ($scope.$parent[i]) == "undefined") {
                            //                            if(i=="src"){
                            //                                console.log(i,item[i],$scope[i],"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            //                            }

                            item[i] = clone($scope[i]);

                        }
                    }
                });
            },
        }
    }])
    .controller("mainEditorController", ["$scope", "modelData", "globalPropData", "sysSettingData", "$rootScope", "globalShareData", "$timeout", function ($scope, modelData, globalPropData, sysSettingData, $rootScope, globalShareData, $timeout) {

        var instance = this;
        instance.hide_dialog = hide_dialog;
        instance.show_dialog = show_dialog;
        instance.sys_setting = sysSettingData;
        $rootScope.sys_setting = sysSettingData;
        $scope.instance = instance;
        this.global_prop = globalPropData.prop;
        instance.globalShareData = globalShareData;
        //        instance.globalShareData.editing = "模板编辑";
        instance.hide_dialog();
        $rootScope.$on("appendModel", function (e, model) {
            //            console.log(model);
            //            console.log(typeof(model))
            delete model.$$hashKey;
            //            .push(clone(model));
            var last_index = $scope.models.lists.length;
            $scope.models.lists.forEach(function (v, i) {
                if (v.editor_selected)
                    last_index = i + 1;
            })
            $scope.models.lists.splice(last_index, 0, clone(model));
            $timeout(
                function () {
                    console.log($scope.models);
                    console.log(escape(JSON.stringify($scope.models)));
                    $("#editor-model-put-target")[0].scrollTop = $("#editor-model-put-target")[0].scrollHeight;
                }, 200
            )

        })
        $rootScope.$on("syncModel", function (e, model) {
            //            console.log(model);
            //            console.log(typeof(model))
            $scope.models.lists.forEach(
                function (m, index) {

                    if (m.editor_model_config.name == model.editor_model_config.name) {

                        angular.element(".editor-block[data-index=" + index + "]").scope().sync_model(model.editor_model_tpl)


                    }

                }
            )

        })

        $scope.models = {
            selected: null,
            lists: [],
            globalPropData: globalPropData.prop,
        };
        modelData.models = $scope.models;
        $scope.$on("form_close", function (event) {
            instance.hide_dialog();
        })
        $scope.$on("form_submit", function (event, values1, values2, index) {

            angular.forEach(values1, function (v, k) {
                list[instance.editing_index][k] = v;
            })
            list[instance.editing_index].editor_general_block_style = clone(values2);




            angular.element(".editor-block[data-index=" + index + "]").scope().set_value(values1, values2);

            instance.hide_dialog();

            $rootScope.$digest();


        })
        instance.form_change = function () {
            console.log("change");
            var focusing = $("#editor-data-dialog input:focus,#editor-data-dialog textarea:focus");
            $rootScope.common_dialog_focusing = focusing;
        }

        function tool_set(state) {

            if (state) {
                this.style.color = "steelblue";
            } else {
                this.style.color = "grey";
            }
        }
        var list = $scope.models.lists;

        function show_dialog(name) {
            instance.dialog_name = name;
            instance.show_mask = false;
            instance.show_mask_dialog = true;
            var editor = $("#editor-data-dialog")
            editor.css("left", (parseInt($("body").css("width")) - parseInt(editor.css("width"))) / 2 + "px")
        }

        function hide_dialog() {
            instance.show_mask = false;
            instance.show_mask_dialog = false;
        }
        var shift_key = false;
        var ctrl_key = false;
        $("body").on("blur", function () {
            shift_key = false;
            ctrl_key = false;
        })
        var pre_selected;
        $("body").on("click", ".editor-block", function (e) {
            var dom=this;
            setTimeout(function(){
                var index=dom.getAttribute("data-index");
            console.log(dom)
            console.log(index);
            var edit = $(e.target).attr("contenteditable");
//                .set_value(values1, values2);
            var scopes=[];
            for(var i=0;i<list.length;i++)    {
                scopes[i]=angular.element(".editor-block[data-index=" + i + "]").scope();
            }
            if (typeof edit === typeof undefined || edit === false) {
                $scope.$apply(function () {
                    function set_value(index,value){
                        list[index].editor_selected=value;
                        scopes[index].set_value({
                            editor_selected:value
                        })
                    }
                    function select_current(value) {
//                        list[index].editor_selected = !list[index].editor_selected;  
                        if(value!=undefined){
                            set_value(index,value)
                        }else{
                        set_value(index,!list[index].editor_selected)    
                        }
                        
                    }

                    function empty() {                  
                        for(var i in list){
//                            list[i].editor_selected = false;
                            set_value(i,false)
                        }
                        
                    }
                    console.log(ctrl_key,shift_key)
                    if (ctrl_key) {
                        select_current();
                    } else if (shift_key) {
                        empty();

                        if (pre_selected != undefined) {
                            if (pre_selected != index) {
                                for (var i = Math.min(pre_selected, index); i <= Math.max(pre_selected, index); i++) {

//                                    list[i].editor_selected = true;
                                    set_value(i,true)
                                }

                            }
                        } else {
                            select_current();
                        }
                        var first_index;
                        list.forEach(function (v, i) {})
                    } else {
                        var state=list[index].editor_selected;
                        empty();
                        select_current(!state);
                    }
                    pre_selected = index;
                    console.log(list);
                })
            }
            },100)
//            var index = $(this).data("index");
            

        })



        window.document.onkeydown = key_handle;
        window.document.onkeyup = key_handle;

        function key_handle(evt) {
            evt = (evt) ? evt : window.event
            shift_key = evt.shiftKey;
            ctrl_key = evt.ctrlKey;

        }




        instance.call_tool = function (name, index) {
            for (var i in instance.editor_tools) {
                if (name == instance.editor_tools[i].name) {
                    return instance.editor_tools[i].callback_wrap(index);
                }
            }
        }
        instance.editor_tools = [
            {
                name: "move_up",
                icon: "glyphicon-chevron-up",
                callback: function (index) {


                    var temp = list[index];
                    list[index] = list[index - 1];
                    list[index - 1] = temp;

                },
                check: function (index) {
                    if (index > 0)
                        return true;
                    else {
                        return false;
                    }
                }
            }
            , {
                name: "data",
                icon: "glyphicon-th-list",
                callback: function (index) {

                    instance.editing_index = index;
                    var editing_model = angular.element(".editor-block[data-index=" + index + "]").scope();
                    var model_data = list[index].editor_model_config.model_data;
                    //                model_data["onSubmitValid"] =
                    //
                    //                    console.log(model_data)
                    var form_body_special = $("#editor-data-dialog").find(".panel-body.editor-form-special-prop");
                    var form_body_general = $("#editor-data-dialog").find(".panel-body.editor-form-general-prop");
                    form_body_special.empty();
                    form_body_general.empty();
                    model_data.value = list[index];
                    form_body_special.jsonForm(model_data);
                    model_data.value = undefined;
                    general_block_form.value = clone(list[index].editor_general_block_style);
                    form_body_general.jsonForm(general_block_form);


                    instance.show_dialog(list[index].editor_model_config.name);
                    //                    console.log(JSONForm.getFormValue(form_body_special));
                    $("#editor-data-dialog").find(".jsonform-submit").click(function () {
                        var values1 = JSONForm.getFormValue(form_body_special);
                        var values2 = JSONForm.getFormValue(form_body_general)

                        angular.element("#editor-data-dialog").scope().submit(values1, values2, index);

                    })
                },
            }, {
                name: "move_dowm",
                icon: "glyphicon-chevron-down",
                callback: function (index) {
                    var temp = list[index];
                    list[index] = list[index + 1];
                    list[index + 1] = temp;
                },
                check: function (index) {
                    if (index < list.length - 1)
                        return true;
                    else {
                        return false;
                    }
                }
}, {
                name: "setting",
                icon: "glyphicon-cog",
                callback: function (index) {
                    //                    console.log("cog", index);
                    //                    list[index].editor_selected = !list[index].editor_selected;
                }
}, {
                name: "delete",
                icon: "glyphicon-trash",
                callback: function (index) {
                    if (list[index].editor_model_config) {
                        if (confirm("是否确认删除 类型：" + list[index].editor_model_config.name + " 内容：" + list[index].editor_model_tpl)) {
                            list.splice(index, 1);

                        }
                    }

                    tool_set.call(this, false);

                },

}, ]

        angular.forEach(this.editor_tools, function (tool, index) {
            tool.callback_wrap = function (index) {
                if ((!this.check || this.check(index)) && this.callback)
                    return this.callback.apply(this, arguments)
            }
            tool.check_wrap = function (index) {
                if (index === false) {
                    tool_set.call(this, false);
                } else {

                    if (this.check) {
                        tool_set.call(this, this.check(index));
                    } else {
                        tool_set.call(this, true);
                    }

                }

            }
            tool.style = {
                top: parseInt(index / 2) * 16 + "px",
            };
            //            console.log(tool.style, tool);
            if (index % 2) {
                tool.style.left = "-21px";
            } else {
                tool.style.right = "-21px";
            }
            //            console.log(tool.style);
        })

        this.tool_callback = function (name, index) {

        }
        $scope.mouse_leave = function () {
            //            $scope.editor_tool_show = -1;
            //            console.log("leave")
        }
        $scope.editor_tool_show = -1;
        $scope.set_current_model = function (index) {

            $scope.$apply(
                function () {
                    $scope.editor_tool_show = index;
                    //                    console.log("index", index);
                }
            )

        }

        // Model to JSON for demo purpose
        var preview_timeout = "none";

        function update_preview() {
            //            console.log("update")
            var model = $scope.models;
            list = $scope.models.lists;
            $scope.modelAsJson = angular.toJson(model, true);
            //            console.log("mmwwmm")
            if (preview_timeout != "none")
                clearTimeout(preview_timeout);
            preview_timeout = setTimeout(
                function () {
                    preview_timeout = "none";

                    if (sysSettingData.value.clean_mode) {
                        preview_load(get_pure_html())
                    } else {
                        var contariner = $("#editor-block-container");
                        if (contariner.length)
                            preview_load(contariner[0].outerHTML)
                    }

                }, sysSettingData.value.delay_time
            )
        }
        $rootScope.$on("update_preview", function () {
            update_preview();
        })
        $scope.$watch('models', update_preview, true);
        $rootScope.$watch('title', update_preview, true);
    }])
    .factory('modelData', function () {

        return new function () {

        };
    })
    .controller("modelEditController", ["$scope", "$rootScope", "$timeout", function ($scope, $rootScope, $timeout) {


        var form = $("textarea#editor-model-form-code")
            //        console.log(form)
        let codemirror_editor_modelform = CodeMirror.fromTextArea(form[0], {
            matchBrackets: true,
            theme: "neat",
            lineNumbers: true,
            mode: "javascript",
        });

        function blockIndent(editor, from, to) {
            editor.operation(function () {
                for (var i = from; i < to; ++i)
                    editor.indentLine(i, "smart");
            });
        }
        var formvalue = `{
    "schema": {
 "data": {
            "type": "string",
            "title": "内容",
            "default": "美腻的标题",
        },
        "source": {
            "type": "string",
            "title": "来源",
            "default": "小米社区",
        },
        "date": {
            "type": "string",
            "title": "日期",
            "default": "2015.8.10",
        },
        style: {
            type: "object",
            title: "样式",
            properties: {
                color: {
                    "type": "string",
                    "title": "颜色",
                    "format": "color"
                },
            }
        },


    },

}`;
        console.log(formvalue)
        formvalue = js_beautify(formvalue);
        codemirror_editor_modelform.setValue(formvalue)
        setTimeout(
            function () {

            }, 1000
        )

        var model = $("textarea#editor-model-code")
        let codemirror_editor_model = CodeMirror.fromTextArea(model[0], {
            matchBrackets: true,
            theme: "neat",
            lineNumbers: true,
            mode: "htmlmixed",
        });

        codemirror_editor_model.setValue("<label ng-style='style' contenteditable ng-model='data'>无有依稀挖来喂</label>")

        var test_scope = angular.element("#editor-model-test-div").scope()
        $scope.implement = function () {
            var form_test = $("#editor-model-form-test");
            form_test.empty();
            try {
                eval("var json=" + codemirror_editor_modelform.getValue())
            } catch (e) {
                var err_text = "表格语法错误<br/>";
                err_text += e.message;
                err_text += "<br/>";
                err_text += e.stack;

                form_test.html(err_text)
            }
            var form_err = false;
            try {
                if (typeof (json) != "undefined") {
                    console.log(json);
                    form_test.jsonForm(json)
                }
            } catch (e) {
                form_err = true;
                var err_text = "JsonForm 语法错误<br/>";
                err_text += e.message;
                err_text += "<br/>";
                err_text += e.stack;

                form_test.html(err_text)
            }
            if (!form_err) {
                $("#editor-model-form-test .jsonform-submit").click(
                    function () {
                        console.log("www");
                        test_scope.$apply(
                            function (scope) {
                                scope.set_value(JSONForm.getFormValue(form_test))
                                $timeout(
                                    function () {
                                        preview_load($rootScope.pure_tpl + window["editor-model-test-div"].outerHTML)
                                    }
                                )
                            }
                        )
                    }
                )
            }

            test_scope.set_model(codemirror_editor_model.getValue())
            if (typeof (json) != undefined) {
                test_scope.set_value(get_jsonform_default_value(json))
            }
        }
    }])


var global_prop_form = {
    "schema": {
        "top_bar_title": {
            type: "string",
            title: "文章标题栏内容",
            default: "玩家智能圈",
        },
        style: {
            type: "object",
            title: "全局样式",
            properties: {
                color: {
                    "type": "string",
                    "title": "文字颜色",
                    format: "color",
                    default: "#000000",
                },
                "background-color": {
                    "type": "string",
                    "title": "背景颜色",
                    format: "color",
                    default: "#fff",
                },
                "padding-top": {
                    "type": "string",
                    "title": "上边距",
                    default: "0px",
                },
                "padding-bottom": {
                    "type": "string",
                    "title": "下边距",
                    default: "20px",

                },
                "padding-left": {
                    "type": "string",
                    "title": "左边距",
                    default: "10px",

                },
                "padding-right": {
                    "type": "string",
                    "title": "右边距",
                    default: "10px",
                },
            }
        }

    }
}
var general_block_form = {
    schema: {
        color: {
            type: "string",
            title: "文字颜色",
            format: "color",
            default: "#000000",
        },
        "font-size": {
            type: "string",
            title: "字号",
        },
        "background-color": {
            "type": "string",
            "title": "背景颜色",
            format: "color",
            default: "white",
        },
        "padding-top": {
            "type": "string",
            "title": "上边距",
            default: "0px",
        },
        "padding-bottom": {
            "type": "string",
            "title": "下边距",
            default: "0px",

        },
        "padding-left": {
            "type": "string",
            "title": "左边距",
            default: "0px",

        },
        "padding-right": {
            "type": "string",
            "title": "右边距",
            default: "0px",

        },
    }
}

function get_jsonform_default_value(model) {
    var test_div;
    test_div = $("#editor-just-used-to-cal-jsonform");    
    test_div.empty();
    test_div.jsonForm(model);
    return JSONForm.getFormValue(test_div);
}
$(function () {
    setTimeout(function () {
        $("#model-tab").on("click", "a", function (e) {
            e.preventDefault();
        })
    }, 500)

})

function clone(myObj) {
    if (typeof (myObj) != 'object') return myObj;
    if (myObj == null) return myObj;
    if (myObj.concat) {
        var myNewObj = [];
    } else {
        var myNewObj = {};
    }

    for (var i in myObj)
        myNewObj[i] = clone(myObj[i]);
    return myNewObj;
}
$(function () {

    function ass_panel_product_create(dom) {
        var panel = {};
        var product_table;
        panel.icon_class = "glyphicon-th-list";
        panel.title = "商品链接或ID";
        var container = $('<div class="ass-menu-panel" style="display:none;width:500px;height:300px;background-color:white;"><div class="search"><label>查询</label><input type="text" class="input" /></div></div>')

        container.find(".search input").keyup(
            function () {
                var keys = ["gid", "name"]
                var search_word = container.find(".search input").val();
                //                var data=clone(product_table)
                //                console.log(data);
                if (search_word.length == 0) {
                    set_table(product_table);
                    return;
                }
                var data = []
                    //                console.log(product_table);
                for (var i in product_table) {
                    var has = false;
                    for (var j in keys) {
                        if (product_table[i][keys[j]].indexOf(search_word) > -1) {
                            has = true;
                        }
                    }
                    if (has == true) {
                        data[i] = product_table[i];
                    }
                }
                set_table(data);
            }
        )


        panel.set_element = function (j) {
            j.after(container);

        }

        function set_table(data) {
            function table_create(data) {
                var table = $('<table class="table"><thead><tr><th>gid</th><th>商品名</th><th>商品链接</th><th>商品图片</th></tr></thead><tbody></tbody></table>')
                for (var i in data) {
                    var d = data[i];
                    var out = $("<tr></tr>")

                    var content = [
                    "gid", false,
                    "name", false,
                    "gid",
                        function (data) {
                            return "smarthome://smarthome.app/detail?gid=" + data.gid;
                    },
                    function (data) {
                            var img = $("<img></img>")
                            img.attr("src", data.pic_url)
                            return img;
                    },
                    function (data) {
                            return data.pic_url;
                    }
                    ]

                    for (var j = 0; j < content.length; j += 2) {
                        var td = $("<td></td>")
                        var span = $("<span></span>")
                        td.append(span);
                        switch (typeof (content[j])) {
                        case "string":
                            span.html(d[content[j]]);
                            break;
                        case "object":
                            span.append(content[j]);
                            break;
                        case "function":
                            span.append(content[j](d));
                            break;

                        }

                        if (content[j + 1]) {
                            span.attr("data-toshow", content[j + 1](d));
                        } else {
                            span.attr("data-toshow", d[content[j]]);
                        }
                        out.append(td);
                    }
                    table.delegate('td>span', 'click', function () {
                        dom.val($(this).attr("data-toshow"))
                    });
                    table.append(out);
                }
                return table;
            }
            container.find("table").remove();
            container.append(table_create(data));
        }

        panel.enter = function () {
            //            console.log("enter");
            container.slideToggle();
            $.get(
                "http://support.io.mi.srv/shop/pipe", {
                    k: "test",
                    m: "Shopv2",
                    a: "getHotList",
                },
                function (data) {
                    if (typeof (data) == "string") {
                        data = JSON.parse(data)
                    }
                    product_table = data.result.test.data;
                    set_table(product_table);

                }
            )
        }
        panel.exit = function () {
            console.log("exit");
            container.slideToggle();
        }
        return panel;
    }

    function ass_panel_artical_create(dom) {
        var panel = {};
        var artical_table;
        panel.icon_class = "glyphicon-align-center";
        panel.title = "无设备引导页文章";
        var container = $('<div class="ass-menu-panel" style="display:none;width:500px;height:300px;background-color:white;"><div class="search"><label>查询</label><input type="text" class="input" /></div></div>');
        panel.set_element = function (j) {
            j.after(container);

        }

        function set_table(data) {
            function table_create(data) {
                var table = $('<table class="table"><thead><tr><th>id</th><th>标题</th><th>url</th></tr></thead><tbody></tbody></table>')
                for (var i in data) {
                    var d = data[i];
                    var out = $("<tr></tr>")

                    var content = [
                    "id", false,
                    "title", false,
                    "url", false, ]

                    for (var j = 0; j < content.length; j += 2) {
                        var td = $("<td></td>")
                        var span = $("<span></span>")
                        td.append(span);
                        switch (typeof (content[j])) {
                        case "string":
                            span.html(d[content[j]]);
                            break;
                        case "object":
                            span.append(content[j]);
                            break;
                        case "function":
                            span.append(content[j](d));
                            break;

                        }

                        if (content[j + 1]) {
                            span.attr("data-toshow", content[j + 1](d));
                        } else {
                            span.attr("data-toshow", d[content[j]]);
                        }
                        out.append(td);
                    }
                    table.delegate('td>span', 'click', function () {
                        dom.val($(this).attr("data-toshow"))
                    });
                    table.append(out);
                }
                return table;
            }
            container.find("table").remove();
            container.append(table_create(data));
        }
        panel.enter = function () {
            //            console.log("enter");
            container.slideToggle();

            $.post("http://support.io.mi.srv/common/if_editor_data", {
                action: "list",
            }, function (data) {
                data = JSON.parse(data);
                console.log(data);
                artical_table = data.result.list;
                console.log(artical_table);
                set_table(artical_table);
            })
        }
        panel.exit = function () {
            console.log("exit");
            container.slideToggle();
        }
        return panel;
    }

    function showAssMenu(dom) {
        //        if(dom.css("position")=="static")
        //        {
        //            dom.css("position","relative");
        //        }

        //        console.log("sss");
        if (dom.next().hasClass("ass-menu")) {
            var menu = $(".ass-menu");
            $(".ass-menu").slideToggle("fast", function () {
                menu.remove();
            });
            return;
        } else {
            $(".ass-menu").remove();
        }

        var menu_out = $('<div class="ass-menu"></div>');

        //        product_list
        var close_btn = $("<span class='glyphicon glyphicon-chevron-up' title='收起'></span>");
        var panels = [ass_panel_product_create, ass_panel_artical_create];
        menu_out.append(close_btn);
        panels.forEach(function (v, i) {
            var panel_j = $("<span class='glyphicon'></span>");
            var panel = v(dom);
            //smarthome://smarthome.app/detail?gid=49


            menu_out.append(panel_j);
            panel.set_element(panel_j);
            panel_j.addClass(panel.icon_class);

            panel_j.attr("title", panel.title);
            panel_j.click(panel.enter);
        })
        close_btn.click(
            function () {
                menu_out.slideToggle("fast", function () {
                    menu_out.remove();
                });
            }
        )

        //        menu_out.append(close_btn);
        dom.after(menu_out);
        menu_out.slideDown("fast");
        if (typeof (CKEDITOR) != "undefined") //in ckeditor page
        {
            menu_out.addClass("cking");
        }
        if (typeof (MockData) != "undefined") {
            menu_out.parent().css("position", "relative");
        }
    }
    $("body").keydown(
        function (e) {
            if (e.keyCode == 112) {
                if ($(":focus").length)
                    showAssMenu($(":focus"))
                return false;
            }

        }
    )






})