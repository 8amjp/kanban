<?php
class Kanban {

    const KANBAN_PATH     = "/mnt/array1/share/kanban/";
    const MEMO_FILE_NAME  = "memo";
    const STYLE_FILE_NAME = "style";

    function Kanban() {
        $this->patterns = array(
            "todo"    => "*/#ToDo/[^#]*"  ,
            "doing"   => "*/#Doing/[^#]*" ,
            "someday" => "*/#ToDo/#Someday/[^#]*" ,
            "waiting" => "*/#Doing/#Waiting/[^#]*" ,
            "done"    => "*/#Done/[^#]*"
        );
    }

    // ディレクトリ一覧を取得しJSONP形式で出力
    public function get() {
        $tasks = array();
        foreach($this->patterns as $status => $pattern) {
            $tasks[$status] = array();
            $glob = glob( self::KANBAN_PATH.$pattern, GLOB_ONLYDIR );
            foreach($glob as $path) {
                $relativepath = str_replace( self::KANBAN_PATH, "", $path );
                $level = substr_count( $relativepath, "/" );
                switch ( $level ) {
                    case 2:
                        list( $worker, $statusdir, $title ) = explode( "/", $relativepath );
                        break;
                    case 3:
                        list( $worker, $parentstatusdir, $statusdir, $title ) = explode( "/", $relativepath );
                        break;
                }
                $style = false;
                $target = $path;
                for ($i = $level; $i >= 0; $i--){
                    $style = @file_get_contents( $target."/".self::STYLE_FILE_NAME );
                    if ($style) break;
                    $target = dirname($target);
                }
                $memo = trim( mb_convert_encoding( @file_get_contents( $path."/".self::MEMO_FILE_NAME ), "UTF-8", "ASCII,JIS,UTF-8,SJIS-win,SJIS,EUC-JP") );
                $tasks[$status][$worker][] = array(
                    "title"    => $title,
                    "modified" => date( DATE_W3C, filemtime($path) ),
                    "memo"     => ($memo  !== false) ? $memo  : null,
                    "style"    => ($style !== false) ? $style : null
                );
            }
        }
        echo sprintf( "callback(%s);", json_encode( $tasks ) );
    }
}
?>
