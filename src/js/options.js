var router = {
    ""               : "officialContent",
    "officialContent": "officialContent",
    "diyContent"     : "diyContent",
    "importExport"   : "importExport"
};
var opt = {
    init           : function () {
        opt.render();
        window.onhashchange = function () {
            opt.render();
        }
    },
    render         : function () {
        var hash = location.hash.replace("#", "") || "officialContent";
        $(".main").addClass("am-hide");
        $("#" + hash).removeClass("am-hide");
        $(".am-nav>li").removeClass("am-active");
        $(".am-nav a[href='#" + hash + "']").closest("li").addClass("am-active");

        opt[router[hash]]();
    },
    officialContent: function () {
        function render(path){
            $.get(path,function(readList){
                readList=JSON.parse(readList);
                var list = _.reduce(readList,function(memo,l,k){
                    return memo+'<li >' +
                        '<img src="'+ l.icon+'">'+
                        ''+ l.name+'' +
                        '<button data-k="'+ k+'">订阅</button>';
                    '</li>';
                },"")
                $("#officialContent>.catalog-list").html(list);

                $(".catalog-list").off("click","button");
                $(".catalog-list").on("click","button",function(){
                    var currentData = readList[$(this).attr("data-k")];
                    var getDiy = JSON.parse(localStorage.getItem("diyContent"))||[];
                    var hasDingyue = _.find(getDiy,function(f){
                        return f.name == currentData.name;
                    });
                    if(hasDingyue){
                        alert("已订阅，请勿重复订阅")
                    }else{
                        getDiy.push(currentData);
                        localStorage.setItem("diyContent",JSON.stringify(getDiy));
                        alert("订阅成功")
                    }

                });

            })
        }
        $.get("data/catalog.json",function(ret){
            ret=JSON.parse(ret);
            var catalist = _.reduce(ret,function(memo,c){
                return memo+'<li data-slug="'+ c.slug+'"><a>'+ c.name+'</a></li>';
            },"")
            $("#officialContent>.catalogs").html(catalist);
            $("#officialContent>.catalogs>li:first").addClass('am-active');

            var catalogJSONFilePath = "data/"+ret[0].slug+".json";
            render(catalogJSONFilePath)

        });

        $(".catalogs").on("click","li",function(){
            $(".catalogs>.am-active").removeClass('am-active');
            $(this).addClass('am-active');
            var slug = $(this).attr("data-slug");
            var catalogJSONFilePath = "data/"+slug+".json";
            render(catalogJSONFilePath)
        })

    },
    diyContent     : function () {
        console.log("diyContent")
    },
    importExport   : function () {

        $(".export").on("click", function () {
            var data = localStorage.getItem("diyContent");

            var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "hotenBackup.json");
        });

        $(".import").on("change", function (e) {
            // 检查 File API 支持
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var getFile = e.target.files[0],
                    reader = new FileReader();
                reader.onload = function (theFile) {
                    //写入localstorage
                    localStorage.setItem("diyContent", theFile.target.result);
                    alert("导入成功");
                    location.reload();
                };
                reader.readAsText(getFile);

            } else {
                alert('The File APIs are not fully supported in this browser.');
            }


        })
    }
};

opt.init();


var data = JSON.parse(localStorage.getItem("diyContent")) || [];

function renderDiyTable() {
    var html = _.reduce(data, function (memo, d, index) {
        var checkState = d.isShow ? "checked" : "";
        return memo + "<tr data-k='" + index + "'>" +
            '<td><input name="isShow" type="checkbox" ' + checkState + ' ></td>' +
            '<td><img style="width: 16px;" src="' + d.icon + '"> <input name="icon" type="text" value="' + d.icon + '"></td>' +
            '<td><input name="name" type="text" value="' + d.name + '"></td>' +
            '<td><input name="url" type="text" value="' + d.url + '"></td>' +
            '<td><input name="selector" type="text" value="' + d.selector + '"></td>' +
            '<td><button class="am-btn am-btn-danger am-btn-xs del">删</button></td>' +
            "</tr>";
    }, "");
    $(".am-table>tbody").append(html);
}

function addContent() {

}

$("#add").on("click", function () {
    var _tr = $(this).closest("tr");
    var newContent = {
        isShow  : _tr.find("[name=isShow]").is(":checked"),
        icon    : _tr.find("[name=icon]").val(),
        name    : _tr.find("[name=name]").val(),
        url     : _tr.find("[name=url]").val(),
        selector: _tr.find("[name=selector]").val()
    }
    data.push(newContent);
    localStorage.setItem("diyContent", JSON.stringify(data));
    location.reload();
});

$(".am-table").on("click", ".del", function () {
    var _tr = $(this).closest("tr");
    var key = _tr.attr("data-k");
    if (confirm("确认删除？")) {
        data.splice(key, 1);
        localStorage.setItem("diyContent", JSON.stringify(data));
        _tr.remove();
    }
});

$(".am-table").on("change", "input", function () {
    var _tr = $(this).closest("tr");
    var key = _tr.attr("data-k");
    var name = $(this).attr("name");
    var value = $(this).val();
    if ($(this).attr("type") == "checkbox") {
        value = $(this).is(":checked");
    }
    data[key][name] = value;
    localStorage.setItem("diyContent", JSON.stringify(data));

});

renderDiyTable();