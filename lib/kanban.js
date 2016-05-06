$(function(){

    init();

    // 初期化
    function init() {
        $.ajax(
            "./api/get.php",
            {
                dataType: "jsonp",
                jsonpCallback: "callback"
            }
        )
        .done(function( data ) {
            put( data );
        })
    }

    // 描画
    function put( data ) {
        // 担当者リストのコンテナ
        var $workerlist = $("#worker-list");
        // 担当者リスト追加
        $workerlist.append(
            $('<li/>').append(
                $('<a/>')
                .attr('href', '#' )
                .text( "全員" )
                // 担当者変更時イベント
                .on('click', function () {
                    filtering( $(this).attr('href') );
                })
            )
        );

        // 名札のテンプレート
        var $nameplate = $("<div/>").addClass("nameplate");
        // カンバンのテンプレート
        var $emptykanban = $("<div/>").addClass("kanban").attr("data-toggle", "tooltip").attr("data-placement", "bottom");
        // カンバンのコンテナ
        var container = {
            todo    : $("#todo-list"),
            doing   : $("#doing-list"),
            done    : $("#done-list"),
            someday : $("#someday-list"),
            waiting : $("#waiting-list")
        };

        $.each(data, function(status, items) {
            // カンバン描画
            var $list = $("<div/>").addClass("col-md-12");
            $.each(items, function(name, worker) {
                // 担当者毎に割り当てられたカンバンのコンテナ
                var $assignedlist = $("<div/>").addClass("assigned-list").attr("data-worker", name).append( $nameplate.clone().text(name) );
                $.each(worker, function(i, task) {
                    var $kanban = $emptykanban.clone()
                        .attr("data-status", status)
                        .attr("data-title",  task.title)
                        .attr("data-memo",   task.memo)
                        .attr("data-worker", name)
                        .attr("title",       task.memo)
                        .text(task.title);
                    // カンバンにスタイルを適用
                    if (task.style) {
                        $.each( JSON.parse( task.style ), function( propertyName, value ) {
                             $kanban.css(propertyName, value);
                        })
                    }
                    $assignedlist.append( $kanban );
                })
                $list.append( $assignedlist );

                // 担当者リスト追加
                if ( $("a[href='#" + name + "']").length == 0 ) {
                    $workerlist.append(
                        $('<li/>').append(
                            $('<a/>').attr('href', '#' + name ).text( name )
                            // 担当者変更時イベント
                            .on('click', function () {
                                filtering( $(this).attr('href') );
                            })
                        )
                    );
                }
            })
            container[status].append($list);
        });
        filtering( location.hash );
        $('[data-toggle="tooltip"]').tooltip();
    }

    // 特定の担当者のカンバンのみ表示する
    function filtering(hash) {
        var name = hash.replace("#", "");
        if ( name ) {
            $(".assigned-list").hide();
            $('.assigned-list[data-worker="' + name + '"]').show();
            $("#current-worker").text(name);
        } else {
            $(".assigned-list").show();
            $("#current-worker").text("全員");
        }
    }
});
