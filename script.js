var _gridSize = 8;

var _nodeSize = 50;

var _actionTime = 500;

$("#nameInput").val(localStorage.getItem("turtleName") || "Le Turtle");
function _updateName(){
	$("#turtleName").text(($("#nameInput").val()));
	localStorage.setItem("turtleName", $("#nameInput").val());
}
_updateName();
$("#nameInput").change(_updateName);

$("#input").val(localStorage.getItem("script"));
$("#input").change(function(){
	console.log("Saved!");
	localStorage.setItem("script", $("#input").val());
});

var grid = [];
for(var i = 0; i < _gridSize; i++){
	grid[i] = [];
	for(var j = 0; j < _gridSize; j++){
		grid[i][j] = 0;
	}
}

$("#turtle").width(_nodeSize);
$("#turtle").height(_nodeSize);

$("#map").width(_nodeSize * _gridSize);
$("#map").height(_nodeSize * _gridSize);

$("#dPad1").click(function(){
	_rot(-1, turtle);
});
$("#dPad2").click(function(){
	_mv(1, turtle);
});
$("#dPad3").click(function(){
	_rot(1, turtle);
});
$("#dPad4").click(function(){
	// _rot(-1, turtle);
});
$("#dPad5").click(function(){
	turtle.pos = {x: 0, y: 0, d: 0};
	turtle.obj.css("transform", "");
	_updateTurtle(turtle);
});
$("#dPad6").click(function(){
	// _rot(-1, turtle);
});
$("#dPad8").click(function(){
	_mv(-1, turtle);
});

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

var turtle = {
	obj: $("#turtle"),
	pos: {
		x: 0,
		y: 0,
		d: 0,
	},
	rgb: function(){
		var color = "hsl(" + Math.floor(Math.random()*360) + ", 100%, 50%)";
		this.obj.css("background-color", color);
	},
	r: function(){
		_rot(1, this);
	},
	l: function(){
		_rot(-1, this);
	},
	rev: function(){
		this.r();
		this.r();
	},
	f: function(){
		return _mv(1, this);
	},
	b: function(){
		return _mv(-1, this);
	}
}

$("#run").click(function(){
	eval($("#input").val());
});

function _updateTurtle(obj){
	// console.log("Updating position for: " + obj);
	obj.obj.css("left", _nodeSize * obj.pos.x);
	obj.obj.css("top", _nodeSize * obj.pos.y);
}

function _rot(direction, obj){
	obj.pos.d += direction;
	if(obj.pos.d > 3) obj.pos.d = 0;
	else if(obj.pos.d < 0) obj.pos.d = 3;
	var got = /-?[0-9]{1,3}/.exec(obj.obj.get(0).style.transform || "0");
	var r = (parseInt(got[0]) + (90*direction)) % 360;
	obj.obj.get(0).style.transform = "rotate(" + r + "deg)";
}

function _mv(direction, obj){
	switch(obj.pos.d){
		case 0:
			obj.pos.y -= direction;
			break;
		case 1:
			obj.pos.x += direction;
			break;
		case 2:
			obj.pos.y += direction;
			break;
		case 3:
			obj.pos.x -= direction;
			break;
		default:
			break;
	}
	if(!_bound(obj.pos, 0, _gridSize-1)){
		return false;
	}
	_updateTurtle(obj);
	return true;
}

function _bound(obj, low, high){
	var valid = true;
	if(obj.x > high){
		obj.x = high;
		valid = false;
	} else if(obj.x < low){
		obj.x = low;
		valid = false;
	} else if(obj.y > high){
		obj.y = high;
		valid = false;
	} else if(obj.y < low){
		obj.y = low;
		valid = false;
	}
	return valid;
}
