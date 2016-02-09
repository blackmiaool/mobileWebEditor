angular.module("main").controller("leftBarController", ["$scope", "sysSettingData", "$rootScope", "local", "globalShareData", "$timeout", function ($scope, sysSettingData, $rootScope, local, globalShareData, $timeout) {
    $scope.sys_setting = sysSettingData;
    //        console.log($scope.sys_setting)
    $scope.select = function (tabname) {
        //            console.log("www")
        $rootScope.current_tab = tabname;
        if ($scope.tabs[tabname].callback) {
            $scope.tabs[tabname].callback();
        }
    };
    $rootScope.current_tab = local.get("left_bar_current_tab", "插入模板");
    $rootScope.$on("selectTab", function (event, para) {
        //            console.log(para)
        $scope.select(para);
    });
    $scope.tabs = {
        插入模板: {
            graph: 'glyphicon-film',
            callback: function () {

                globalShareData.editing = "编辑区";
                $rootScope.$emit("update_preview");
            }
        },
        全局属性: {
            graph: 'glyphicon-list-alt'

        },
        你的图库: {
            graph: 'glyphicon-picture'

        },
        文档列表: {
            graph: 'glyphicon-folder-open'

        },
        输出结果: {
            graph: 'glyphicon-piggy-bank'

        },
        系统设置: {
            graph: 'glyphicon-cog'

        },
        数据导入: {
            graph: 'glyphicon-phone-alt',
            developer: true
        },
        方块管理: {
            graph: 'glyphicon-king',
            developer: true,
            callback: function () {

                globalShareData.editing = "模板编辑";
                $timeout(function () {
                    $rootScope.pure_tpl = get_pure_html();

                    //                            console.log($scope.pure_tpl);
                });
            }
        }

    };
    if ($scope.tabs[$rootScope.current_tab].callback) $scope.tabs[$rootScope.current_tab].callback();
    $rootScope.$watch("current_tab", function (v) {
        local.save("left_bar_current_tab", v);
    });
}]).controller("editorTabModel", ["$scope", "$rootScope", function ($scope, $rootScope) {
    $scope.edit = function () {
        $rootScope.$emit("selectTab", "方块管理");
        $rootScope.$emit("setCurrentEditingModel", $scope.current_div);
        //            console.log($scope.current_div)
    };

    general_block_default_style = get_jsonform_default_value(general_block_form);

    for (var i in MIOTEDITOR.models) {
        var model = {
            editor_model_config: MIOTEDITOR.models[i]
        };
        model.editor_model_config.name = MIOTEDITOR.config.models[i];
        model.editor_general_block_style = general_block_default_style;
        model.editor_model_config.source = "localfs";
        MIOTEDITOR.models[i] = model;
        if (model.editor_model_config.model_data) {

            model.editor_model_config.default_data = get_jsonform_default_value(model.editor_model_config.model_data);
        }
    }

    $rootScope.appendModel = function (model) {
        //            console.log(model)
        //            return;
        var model_config = model.editor_model_config;
        if (model_config.preview) {
            function after_load() {
                //                    console.log($("#model-tab>div[data-kind=" + model_config.kind + "]  [data-name=" + model_config.name + "] "))  
                model_config.name = model_config.name.replace(/\s+/g, "");
                $("#model-tab>div[data-kind=" + model_config.kind + "]  [data-name=" + model_config.name + "] ").append(container);
                model.editor_model_tpl = container.html();
                container.find("*").removeAttr("contenteditable");
                switch (model.editor_model_config.source) {
                    case "localfs":
                        {
                            var header = $("<div class='editor-block-header localfs'><label>内置</label></div>");
                            break;
                        }
                    case "server":
                        {
                            var header = $("<div class='editor-block-header server'><label>云端</label></div>");
                            break;
                        }
                    case "browser":
                        {
                            var header = $("<div class='editor-block-header browser'><label>云端</label></div>");
                            break;
                        }
                }
                container.before(header);
            }
            var container = $("<div class='model-preview-wrap'></div>");
            if (model.editor_model_config.source == "localfs") container.load("models/" + model_config.name + "/model.html", after_load);else {
                container.html(model.editor_model_tpl);
                after_load();
            }
        }
    };
    MIOTEDITOR.models.forEach($rootScope.appendModel);
    console.log(MIOTEDITOR.models);
    $scope.sync_model = function () {
        console.log($scope.current_div);
        $rootScope.$emit("syncModel", $scope.current_div);
    };
    $scope.append = function (model) {
        $rootScope.$emit("appendModel", model);
    };
    $scope.tabs = [{
        kind: "h",
        name: "标题"
    }, {
        kind: "p",
        name: "段落"
    }, {
        kind: "img",
        name: "图片"
    }, {
        kind: "btn",
        name: "按钮"
    }, {
        kind: "other",
        name: "其他"
    }];
    $rootScope.model_tabs = $scope.tabs;
    $rootScope.model_tabs_to_name = function (kind) {
        for (var i in $scope.tabs) {
            if ($scope.tabs[i].kind == kind) return $scope.tabs[i].name;
        }
    };
    $rootScope.model_tabs_to_kind = function (name) {
        for (var i in $scope.tabs) {
            if ($scope.tabs[i].name == name) return $scope.tabs[i].kind;
        }
    };
    $scope.current_tab = "h";
    $scope.select = function (kind) {
        $scope.current_tab = kind;
    };

    $scope.models = {
        selected: null,
        lists: MIOTEDITOR.models
    };
}]).directive("editorModelTest", ["$compile", function ($compile) {
    return {
        priority: 10,
        scope: true,

        link: function ($scope, element, attr) {
            $scope.set_model = function (model) {
                var template = $compile(model)($scope);
                element.empty();
                element.append(template);
            };
            $scope.set_value = function (value) {
                for (var i in value) {
                    $scope[i] = value[i];
                }
            };
        }
    };
}]).controller("globalPropController", ["$scope", "globalPropData", "$rootScope", function ($scope, globalPropData, $rootScope) {
    var prop = $("#global_prop_tab>div");

    $rootScope.$on("set_global_prop_data", function (event, value) {
        set_global_form(value);
    });

    function set_global_form(value) {
        prop.empty();

        if (value) global_prop_form.value = value;
        console.log(globalPropData);
        prop.jsonForm(global_prop_form);
        set_global_prop_data = function () {
            var setp = function () {
                var values = JSONForm.getFormValue(prop);
                globalPropData.prop.style = values.style;
                globalPropData.prop.top_bar_title = values.top_bar_title;
                console.log(values.style);
            };
            if ($scope.$$phase) {
                setp();
            } else {
                $scope.$apply(setp);
            }
        };
        prop.find(".jsonform-submit").click(set_global_prop_data);
    }
    set_global_form();
}]).controller("yourPictureLibController", ["$scope", "globalPropData", "FileUploader", "$rootScope", function ($scope, globalPropData, FileUploader, $rootScope) {
    $scope.get_url = function (item) {
        console.log(item);
        $scope.current_remote_url = item.remote_url;
        if ($rootScope.common_dialog_focusing) $rootScope.common_dialog_focusing.val(item.remote_url);
    };
    $scope.upload_click = function () {
        $rootScope.$emit("upload_click", $scope.upload_mode);
    };
}]).controller("documentListController", ["$scope", "$http", "modelData", "$timeout", "$rootScope", function ($scope, $http, modelData, $timeout, $rootScope) {
    var data;
    $scope.search_obj_title = {};
    $scope.search_obj_id = {};
    $scope.$watch("search_obj_id.id+search_obj_title.title", function () {
        if (data) {
            $scope.list = data.result.list;
        }
    });
    $scope.judge_id = function (v1, v2) {

        return v1 == v2 || !v2;
    };
    $scope.set_search_items = function (arr) {

        $scope.search_items = arr;
    };
    $scope.update_list = function () {
        var hot_search_id = 121;
        $http({
            method: 'POST',
            url: the_url1,
            data: {
                action: "list",
                ps: 10000,
                p: 1
            }
        }).success(function (d, status, headers, config) {
            //                console.log("文档列表", data)
            data = d;
            $scope.list = data.result.list.slice(0, 20);
            data.result.list.every(function (v, i) {
                if (v.id == hot_search_id) {
                    $scope.set_search_items(v.title.split("+"));
                    v.title = "搜索常驻专用";
                    return false;
                }
                return true;
            });
            //            modelData.models=$scope.models;
            //            console.log(data);
        }).error(function (data, status, headers, config) {});
    };
    $scope.update_list();
    $scope.select = function ($index) {};

    $scope.edit = function (id) {
        $http({
            method: 'POST',
            url: the_url1,
            data: {
                action: "get",
                id: id
            }
        }).success(function (data, status, headers, config) {
            //                    console.log(data)
            modelData.models.lists = {};
            var content = JSON.parse(data.result.content);
            console.log(content);
            content.lists.forEach(function (m) {
                if (!m.editor_model_tpl) {
                    //backward compatibility
                    m.editor_model_tpl = m.label;
                    m.label = undefined;
                }
                m.$$hashKey = undefined;
            });
            modelData.models.lists = content.lists;
            var globalPropData = content.globalPropData;
            for (var i in globalPropData) {
                modelData.models.globalPropData[i] = globalPropData[i];
            }
            angular.element("#editor-root").scope().document_id = data.result.id;
            $rootScope.title = data.result.title;
            $rootScope.$emit("set_global_prop_data", content.globalPropData);
            //                global_prop_form.value = content.globalPropData;
            //                var prop=$("#global_prop_tab>div")
            //                prop.empty();
            //                prop.jsonForm(global_prop_form);
            //                prop.find(".jsonform-submit").click(set_global_prop_data)
            //                //                            $rootScope.$digest()
            //                console.log($rootScope)
            //                    console.log($rootScope.$parent)
        }).error(function (data, status, headers, config) {});
    };
}]).controller("outputController", ["$scope", "globalPropData", function ($scope, globalPropData) {}]).controller("sysSettingController", ["$scope", "sysSettingData", "$timeout", function ($scope, sysSettingData, $timeout) {
    $scope.form_change = form_change;
    var form_body = $("#sys_setting_tab>.panel-group");

    function form_change() {
        get_value();
    }

    form_body.jsonForm(sysSettingData.model);
    form_body.find("input").change(get_value);
    get_value();

    function get_value() {
        var value = JSONForm.getFormValue(form_body);
        localStorage.setItem("miot_editor_sys_setting", JSON.stringify(value));

        if (!$scope.$$phase) {
            $scope.$apply(function () {
                angular.copy(value, sysSettingData.value);
            });
        } else {
            angular.copy(value, sysSettingData.value);
        }
    }
}]).controller("dataRecoveryController", ["$rootScope", "$scope", "globalPropData", "modelData", function ($rootScope, $scope, globalPropData, modelData) {
    $rootScope.generate_page = function (data, models) {
        var models_map = {};
        models.forEach(function (v, i) {
            models_map[v.editor_model_config.name] = clone(v);
        });
        var output = [];
        data.forEach(function (v, j) {
            output[j] = {};

            var model = models_map[v.name];
            if (!model) {
                console.log("model" + v.name + " not found.");
            }

            for (var i in model) {
                if (i[0] != "$") {
                    output[j][i] = model[i];
                }
            }
            for (var i in v.data) {

                output[j][i] = v.data[i];
            }
        });

        return output;
    };
    $scope.import_iframe_json = function (d) {

        if (!d) var data = JSON.parse($scope.model_data);else var data = typeof d == "object" ? d : JSON.parse(d);

        var output = {
            selected: null,
            globalPropData: {}
        };
        data = data.map(function (v, i) {
            return {
                data: {
                    src: v.Img
                },
                name: "img_nogap"
            };
        });

        data = $rootScope.generate_page(data, MIOTEDITOR.models);

        output.lists = data;

        from_json(output, false);
    };
    $scope.import_escape = function () {
        $scope.model_data = $scope.model_data.replace(/↵/g, "");
        $scope.model_data = $scope.model_data.replace(/\s/g, "");
        var models = $scope.model_data;
        console.log(unescape(models));
        from_json(unescape(models), true);
    };

    function from_json(data, is_json) {
        if (is_json) {
            data = JSON.parse(data);
        }

        modelData.models.lists.length = 0;
        //            var content = JSON.parse(data.result.content)
        //            console.log(content);
        console.log(data);
        data.lists.forEach(function (m) {
            if (!m.editor_model_tpl) {
                //backward compatibility
                m.editor_model_tpl = m.label;
                m.label = undefined;
            }
            m.editor_model_config.initialized = true;
            delete m.$$hashKey;
        });
        console.log(clone(data));

        var globalPropData = {};
        for (var i in globalPropData) {
            modelData.models.globalPropData[i] = globalPropData[i];
        }
        console.log(data.lists);

        modelData.models.lists = clone(data.lists);

        console.log(clone(modelData.models));
        setTimeout(function () {
            console.log(clone(modelData.models));
        }, 1);
        console.log(data.lists);
    }
    $scope.import_list = function () {

        $scope.model_data = $scope.model_data.replace(/↵/g, "");

        var models = $scope.model_data;

        from_json(models, true);
    };
    $scope.import_url = function (data) {
        if (!data) {
            data = $scope.model_data;
        }
        $.ajax({

            type: "GET",
            url: data,
            dataType: "text",
            crossOrigin: true,
            timeout: 3000,
            success: function (response) {
                var output = [];
                console.log(response);
                $(response).find("img").each(function () {
                    output.push({
                        Img: $(this).attr("src")
                    });
                });
                $scope.$apply(function () {
                    $scope.import_iframe_json(output);
                });
            },
            error: function () {}
        });
    };
    $scope.output_html = function () {
        angular.element("#editor-root").scope().export($scope.model_data);
    };

    function getArguments(target) {
        if (target == undefined) target = window.location.href;

        target = target.split("?")[1] || "";
        var arg = target.split("&");
        var res = {};
        var tem = [];
        for (var i = arg.length - 1; i >= 0; i--) {
            if (arg[i]) {
                tem = arg[i].split("=");
                res[tem[0]] = tem[1];
            }
        }
        var path = location.pathname;
        var page = path.slice(path.lastIndexOf("/") + 1);
        if (page) {
            res.page = page.toLowerCase();
        }
        return res;
    }
    var args = getArguments();

    if (args.url) {
        //edit url     

        var check_models = setInterval(function () {
            if ($rootScope.models_loaded) {
                clearInterval(check_models);
                args.url = decodeURIComponent(args.url);
                setTimeout(function () {
                    $("#editor-left-bar-tabs li[data-name='文档列表']").hide();
                    $(".editor-head-id").hide();
                }, 0);
                var sub_args = getArguments(args.url);
                $rootScope.title = "单文件编辑模式 id:" + sub_args.id;
                $rootScope.edit_mode = "single-file";
                $rootScope.target_url = args.url;
                $scope.import_url(args.url);
            }
        }, 200);
    } else {
        $rootScope.edit_mode = "free";
    }
}]).controller("modelsManageController", ["$scope", "$http", "editorModels", "$rootScope", "globalShareData", "$timeout", function ($scope, $http, editorModels, $rootScope, globalShareData, $timeout) {
    $rootScope.$on("setCurrentEditingModel", function (event, model) {
        console.log(event, model);
        $timeout(function () {
            var form_value = angular.toJson(model.editor_model_config.model_data);
            form_value = js_beautify(form_value);
            codemirror_editor_modelform.setValue(form_value);

            codemirror_editor_model.setValue(model.editor_model_tpl);
            form_model.value = {
                name: model.editor_model_config.name,
                kind: $rootScope.model_tabs_to_name(model.editor_model_config.kind)
            };
            console.log(model.editor_model_config.kind);
            form_div.empty();
            console.log(form_model);
            form_div.jsonForm(form_model);
        });
    });
    var form_model = {
        schema: {
            name: {
                type: "string",
                title: "唯一ID"

            },
            kind: {
                "type": "string",
                "title": "种类",
                "enum": function () {
                    var kinds = [];
                    $rootScope.model_tabs.forEach(function (tab) {
                        kinds.push(tab.name);
                    });
                    return kinds;
                }()
            }

        },
        "form": [{
            "key": "name",
            placeholder: "my_big_title"
        }, "kind"]
    };

    $("#models_manage_tab .form .control-group").hide();
    var form_div = $("#models_manage_tab .form");
    form_div.jsonForm(form_model);
    $scope.upload = function (target) {
        var info = JSONForm.getFormValue(form_div);
        console.log(MIOTEDITOR.models);
        for (var i in MIOTEDITOR.models) {
            var model = MIOTEDITOR.models[i];
            if (model.editor_model_config.name == info.name) {
                if (!confirm("是否覆盖 " + info.name + " ?")) {
                    return;
                } else {
                    break;
                }
            }
        }

        console.log(info);
        if (!info.name) {
            alert("必须填写唯一ID");
            return;
        }
        //            return;

        switch (target) {
            case "server":
                {
                    $http({
                        method: 'POST',
                        url: the_url2,
                        data: {
                            action: "put",
                            name: info.name,
                            data: JSON.stringify({
                                kind: $rootScope.model_tabs_to_kind(info.kind),
                                form: codemirror_editor_modelform.getValue(),
                                model: codemirror_editor_model.getValue()
                            })
                        }
                    }).success(function (data, status, headers, config) {

                        //            modelData.models=$scope.models;
                        //            console.log(data);
                    }).error(function (data, status, headers, config) {});

                    break;
                }
            case "browser":
                {
                    break;
                }
        }
    };
    $scope.set_editing = function (name) {
        globalShareData.editing = name;
    };
}]);
var saved_data;
var model_data_global_readonly;
window.onbeforeunload = function (event) {
    if (sys_setting_global.value.developer_mode || saved_data == JSON.stringify(model_data_global_readonly) && !sys_setting_global.value.strict_leave_mode) {
        return undefined;
    }
    return "保存了没就退出？！";
};