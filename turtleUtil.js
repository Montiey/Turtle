function _rot(direction, obj){
	obj.pos.d += direction;
	if(obj.pos.d > 3) obj.pos.d = 0;
	else if(obj.pos.d < 0) obj.pos.d = 3;

	var got = /-?[0-9]{1,3}/.exec(obj.elem.get(0).style.transform || "0");
	var r = (parseInt(got[0]) + (90*direction)) % 360;
	obj.elem.get(0).style.transform = "rotate(" + r + "deg)";
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

	var success = true;
	if(obj.pos.x >  _gridSize-1){
		obj.pos.x =  _gridSize-1;
		valid = false;
	} else if(obj.pos.x < 0){
		obj.pos.x = 0;
		valid = false;
	} else if(obj.pos.y >  _gridSize-1){
		obj.pos.y =  _gridSize-1;
		valid = false;
	} else if(obj.pos.y < 0){
		obj.pos.y = 0;
		valid = false;
	}

	obj.elem.css("left", _nodeSize * obj.pos.x);
	obj.elem.css("top", _nodeSize * obj.pos.y);

	return success;
}

function Turtle(name){
	theRealThis = this;
	this.elem = $(document.createElement("div"));

	this.elem.addClass("turtle");

	$("#map").append(this.elem);

	this.pos = {
		x: 0,
		y: 0,
		d: 0,
	};
	this.rgb = function(){
		var color = "hsl(" + Math.floor(Math.random()*360) + ", 100%, 50%)";
		theRealThis.elem.css("background-color", color);
	};
	this.r = function(){
		_rotateTurtle(1, this);
	};
	this.l = function(){
		_rotateTurtle(-1, this);
	};
	this.rev = function(){
		theRealThis.r();
		theRealThis.r();
	};
	this.f = function(){
		return _moveTurtle(1, this);
	};
	this.b = function(){
		return _moveTurtle(-1, this);
	};
	this.elem.click(function(){
		_selectedTurtle = theRealThis;
		console.log("selected turtle: " + _selectedTurtle);
	});
	this.select = function(){
		_selectedTurtle = theRealThis;
	}
	console.log("returning: " + this);
	return this;
}
