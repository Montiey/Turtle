$(document).delegate("#input", "keydown", function(e){	//Get tabs into the textarea
  var code = e.keyCode || e.which;
  if (code == 9) {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    $(this).val(
		$(this).val().substring(0, start) + "\t" + $(this).val().substring(end)
	);

    this.selectionStart = this.selectionEnd = start + 1;
  }
});

$("#input").val(localStorage.getItem("script"));
$("#input").change(function(){
	console.log("Saved!");
	localStorage.setItem("script", $("#input").val());
});

$("#turtle").width(_nodeSize);
$("#turtle").height(_nodeSize);

$("#map").width(_nodeSize * _gridSize);
$("#map").height(_nodeSize * _gridSize);

$("#dPad1").click(function(){
	_rot(-1, _selectedTurtle);
});
$("#dPad2").click(function(){
	_mv(1, _selectedTurtle);
});
$("#dPad3").click(function(){
	_rot(1, _selectedTurtle);
});
$("#dPad4").click(function(){
	// _rot(-1, turtle);
});
$("#dPad5").click(function(){

});
$("#dPad6").click(function(){
	// _rot(-1, turtle);
});
$("#dPad8").click(function(){
	_mv(-1, _selectedTurtle);
});
