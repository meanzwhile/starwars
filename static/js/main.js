
function addingBoards(url = "http://swapi.co/api/planets/"){
    $.getJSON(url, function(response){
        for (var i = 0; i < response.results.length; i++) {
            var actual = response.results[i];

            var pop = actual.population;
            if (pop >= 0){ 
                var pop = actual.population/1000000;
                pop = pop.toLocaleString();
            };

            var swp = actual.surface_water
            if (swp >= 0){
                swp = swp.concat("%");
            };

            var arl = actual.residents.length;

            $("#name").append("<div class='data'>"+actual.name+"</div>");
            $("#diameter").append("<div class='data'>"+actual.diameter+" km</div>");
            $("#climate").append("<div class='data'>"+actual.climate+"</div>");
            $("#terrain").append("<div class='data'>"+actual.terrain+"</div>");
            $("#swp").append("<div class='data'>"+swp+"</div>");
            $("#population").append("<div class='data'>"+pop+"</div>");
            if (arl > 0) {
                $("#residents").append("<button id='"+i+"' class='residents-button'>"+arl+" residents</button>");
            } else {
                $("#residents").append("<div class='data'>There's no known residents</div>");
            };
            $("#vote").append("<button id='planet-"+i+"' class='vote-button'>Vote</button>");
        };
    localStorage.actualSite = url;
    showNextButton(response.next);
    showPrevButton(response.previous);
    showResidents();
    vote();
    });
};

function nextPage(){
    $("#next-page").click(function() {
        $(".residents-button").remove();
        $(".data").remove();
        $(".vote-button").remove();
        url = localStorage.actualSite;
        $.getJSON(url, function(response){
            addingBoards(response.next);
            localStorage.actualSite = url;
        });
    });
};

function vote() {
    $(".vote-button").click(function() {
        var id = $(this).attr("id");
        id = (id.slice(-1));
        $.getJSON(localStorage.actualSite, function(response){
            var planetUrl = response.results[id].url;
            var planetId = planetUrl.slice(-2)
            $.post("/vote-planet", {pId: planetId}, function(){
                alert("Successfully voted")
            });
        });
    });
};

function prevPage(){
    $("#prev-page").click(function() {
        $(".residents-button").remove();
        $(".data").remove();
        $(".vote-button").remove();
        url = localStorage.actualSite;
        $.getJSON(url, function(response){
            addingBoards(response.previous);
            localStorage.actualSite = url;
        });
    });
};

function showNextButton(x){
    if (x == null){
        $("#next-page").hide();
    } else {
        $("#next-page").show();
    };
};

function showPrevButton(x){
    if (x == null){
        $("#prev-page").hide();
    } else {
        $("#prev-page").show();
    };
};

function showResidents() {
    $(".residents-button").click(function() {
        $("#myModal").slideDown();
        var id = $(this).attr("id");
        addResidents(id);
    });
    $(".close").click(function() {
        $("#myModal").slideUp();
    });
    var modal = document.getElementById('myModal');
    window.onclick = function(event) {
        if (event.target == modal) {
            $("#myModal").slideUp();
        };
    };
};

function showVotedPlanets() {
    $("#planet-votes").click(function() {
        $("#planet-modal").slideDown();
        $.post("/show-votes", function(data) {
            $(".votes").remove();
            var board = data.data;
            for (var i = 0; i < board.length; i++) {
                $.getJSON("http://swapi.co/api/planets/"+board[i][0]+"/", function(response) {
                    $("#pname").append("<div class='data votes'>"+response.name+"</div")
                });
                $("#pvotes").append("<div class='data votes'>"+board[i][1]+"</div")
            };
        });
    });
    $(".close").click(function() {
        $("#planet-modal").slideUp();
    });
    var modal = document.getElementById('planet-modal');
    window.onclick = function(event) {
        if (event.target == modal) {
            $("#planet-modal").slideUp();
        };
    };
};

function addResidents(id) {
    $(".modal-data").remove();
    $.getJSON(localStorage.actualSite, function(response){
        var residents = response.results[id].residents;
        for (var i = 0; i < residents.length; i++) {
            $.getJSON(residents[i], function(response2){
                $("#rname").append("<div class='modal-data'>"+response2.name+"</div>");
                $("#rheight").append("<div class='modal-data'>"+response2.height+"</div>");
                $("#rmass").append("<div class='modal-data'>"+response2.mass+"</div>");
                $("#rhair").append("<div class='modal-data'>"+response2.hair_color+"</div>");
                $("#rskin").append("<div class='modal-data'>"+response2.skin_color+"</div>");
                $("#reye").append("<div class='modal-data'>"+response2.eye_color+"</div>");
                $("#rbirth").append("<div class='modal-data'>"+response2.birth_year+"</div>");
                $("#rgender").append("<div class='modal-data'>"+response2.gender+"</div>");
            });
        };
    });
};

//Main func.
function main(){
    addingBoards();
    nextPage();
    prevPage();
    showVotedPlanets()
};

$(document).ready(main);