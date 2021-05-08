var button = document.querySelector("#theme");
button.addEventListener("click", function(){
	document.body.classList.toggle("black");
});
var jumbo = document.querySelector(".jumbotron");
jumbo.addEventListener("click", function(){
	document.body.classList.toggle("header");
});