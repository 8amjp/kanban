$(function(){

    var container = {
        todo    : $("#todo-list"),
        doing   : $("#doing-list"),
        done    : $("#done-list"),
        someday : $("#someday-list"),
        waiting : $("#waiting-list")
    };
    var $emptykanban = 
        $("<div/>")
        .addClass("kanban")
        .attr("data-toggle", "modal")
        .attr("data-target", "#propertyModal");
    var $nameplate = 
        $("<div/>")
        .addClass("nameplate")
        .attr("role", "nameplate")
    var $workerlist = $("#worker-list");

    $('[data-toggle="tooltip"]').tooltip();
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

        $.each(data, function(status, items) {
            // カンバン描画
            var $list = $("<div/>").addClass("col-md-12");
            $.each(items, function(name, worker) {
                var $assignedlist =
                    $("<div/>")
                    .addClass("assigned-list")
                    .attr("data-worker", name);
                $assignedlist.append( $nameplate.clone().text(name) );
                $.each(worker, function(i, task) {
                    var $kanban =
                        $emptykanban
                        .clone()
                        .attr("data-status", status)
                        .attr("data-title",  task.title)
                        .attr("data-memo",   task.memo)
                        .attr("data-worker", name)
                        .text(task.title);
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
                            $('<a/>')
                            .attr('href', '#' + name )
                            .text( name )
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
    }

    // 描画
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

    // 詳細ダイアログを表示する時のイベント
    $('#propertyModal').on('show.bs.modal', function (e) {
        var sticky = $(e.relatedTarget);
        $("#task-title").text( sticky.data('title') );
        $("#task-status").val( sticky.data('status') );
        $("#task-worker").val( sticky.data('worker') );
        $("#task-memo").val( sticky.data('memo') );
    })

});
