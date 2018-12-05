var gridSize = 8;

var nodeSize = 50;

var grid = [];
for(var i = 0; i < gridSize; i++){
	grid[i] = [];
	for(var j = 0; j < gridSize; j++){
		grid[i][j] = 0;
	}
}

$("#turtle").width(nodeSize);
$("#turtle").height(nodeSize);

$("#map").width(nodeSize * gridSize);
$("#map").height(nodeSize * gridSize);

var turtle = {
	obj: $("#turtle"),
	pos: {
		x: 0,
		y: 0,
		d: 0,
	},
	red: function(){
		var color = "hsl(" + Math.floor(Math.random()*360) + ", 100%, 50%)";
		this.obj.css("background-color", color);
	},
	r: function(){
		this.pos.d++;
		if(this.pos.d > 3) this.pos.d = 0;
		_rot(1, this.obj);
	},
	l: function(){
		this.pos.d--;
		if(this.pos.d < 0) this.pos.d = 3;
		_rot(-1, this.obj);
	},
	reverse: function(){
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
	obj.obj.css("left", nodeSize * obj.pos.x);
	obj.obj.css("top", nodeSize * obj.pos.y);
}

function _updateName(){
	$("#turtleName").text(($("#nameInput").val()));
}
$("#nameInput").change(_updateName);
_updateName();

function _rot(direction, obj){
	var got = /-?[0-9]{1,3}/.exec(obj.get(0).style.transform || "0");
	var r = (parseInt(got[0]) + (90*direction)) % 360;
	obj.get(0).style.transform = "_rotate(" + r + "deg)";
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
	if(!_bound(this.pos, 0, gridSize)){
		return false;
	}
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
