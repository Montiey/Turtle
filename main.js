var _gridSize = 8;

var _nodeSize = 50;

var _actionTime = 500;

var _selectedTurtle;

$("#run").click(function(){
	$("#map").empty();
	eval($("#input").val());
});
