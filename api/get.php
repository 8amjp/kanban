<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: application/javascript; charset=utf-8");
require_once "../lib/kanban.class.php";
$kanban = new Kanban();
$kanban->get();
?>