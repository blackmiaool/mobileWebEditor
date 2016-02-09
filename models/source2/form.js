
MIOTEDITOR.models.push({
    preview: true,
    kind: "h",
    model_data: {
        "schema": {
            "data": {
                "type": "string",
                "title": "内容",
                "default": "点击了解小米路由器",
            },
            "href": {
                "type": "string",
                "title": "链接",
                "default": "http://www.baidu.com",
            },
            style: {
                type: "object",
                title: "样式",
                properties: {
                    color: {
                        "type": "string",
                        "title": "颜色",
                        "format": "color",
                        "default":"#3d3d3de",
                    },
                }
            }

        }
    },
})