var turtle = {
	obj: $("#turtle"),
	red: function(){
		this.obj.css("background-color", "#f00");
	},
	right: function(){
		rot(1, this.obj)
	},
	left: function(){
		rot(-1, this.obj)
	},
	reverse: function(){
		this.right();
		this.right();
	}
}

$("#run").click(function(){
	doTurtle(turtle);
});

function updateName(){
	$("#turtleName").text(($("#nameInput").val()));
}
$("#nameInput").change(updateName);
updateName();

function doTurtle(){
	eval("turtle ->" + $("#input").val());
}

function rot(direction, obj){
	var got = /-?[0-9]{1,3}/.exec(obj.get(0).style.transform || "0");
	console.log("parsed: " + got[0]);
	var r = (parseInt(got[0]) + (90*direction)) % 360;
	console.log("new: " + r + typeof(r));
	obj.get(0).style.transform = "rotate(" + r + "deg)";
	console.log("set: " + obj.get(0).style.transform);
}
