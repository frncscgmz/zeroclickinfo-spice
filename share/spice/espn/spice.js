var items = new Array();
items[0] = new Array();
items[0]['a'] = '';
items[0]['h'] = '';
items[0]['s'] = 'ESPN';
items[0]['u'] = 'http://espn.com';
items[0]['force_big_header'] = 1;
items[0]['f'] = 1;

var tabs = '';
var news = '';
var team = '';
var stats = '';
var gamelog = '';
var headshot = '';
var teamID = 0;

var callsMade = 0;
var numberOfCalls = 3;

function ddg_spice_espn(response) {

    var player = response.sports[0].leagues[0].athletes[0];
    var playerTeam = player.competitors[0].team;
    headshot = player.headshots.gamecast;
    teamID = playerTeam.id;

    nrj("/js/spice/espn/basketball/nba/athletes/"
            + player.id + "/news/foo/ddg_spice_espn_news");
    nrj("/js/spice/espn/basketball/nba/teams/"
            + teamID + "/foo/bar/ddg_spice_espn_team");
    nrj("/js/spice/espn/basketball/nba/teams/"
            + teamID + "/events/dates/ddg_spice_espn_events");

    stats = player.stats;
    items[0]['u'] = items[0]['u'] + "/nba/player/_/id/" + player.id;
    items[0]['h'] = player.displayName + " - "
                  + playerTeam.location + " "
                  + playerTeam.name
                  + " (ESPN)";

    console.log(player);

    tabs = [ 'news', 'stats', 'team', 'gamelog' ];
    tabs = tabs.map(function(s, index, array) {
        return '<span id="espn_zci_' + s + '_link">'
            +  s.charAt(0).toUpperCase() + s.slice(1)
            +  '</span>' + (index == array.length - 1 ? "" : " | ");
    }).join("");

    team = '<div id="espn_zci_team">'
           + 'pretty pictures'
           + '</div>';

    playerStats = [ 'assists',
                    'athleteStatus',
                    'height',
                    'weight',
                    'dateOfBirth',
                    'blocks',
                    'defensiveRebounds',
                    'doubleDouble',
                    'ejections',
                    'fieldGoalsMade',
                    'fieldGoalsAttempted',
                    'fieldGoalPercentage',
                    'fouls',
                    'freeThrowsMade',
                    'freeThrowsAttempted',
                    'freeThrowPercentage',
                    'gamesStarted',
                    'minutes',
                    'offensiveRebounds',
                    'points',
                    'rebounds',
                    'steals',
                    'threePointersMade',
                    'threePointersAttempted',
                    'threePointPercentage',
                    'tripleDouble',
                    'turnovers',
                  ];

    function prepareStat(s, index, array) {
        display = s.replace(/([a-z\d](?=[A-Z])|[a-zA-Z](?=\d))/g, "$1 ");
        display = display.toLowerCase();
        display = '<tr><td>'
                + display.charAt(0).toUpperCase() + display.slice(1)
                + ':</td><td>'
                + (player[s] ? player[s] : stats[s])
                + '</td></tr>';
        return display;
    }

    playerStats = playerStats.map(prepareStat);
    var nestedStats = [ 'Birthplace', 'Position' ];
    [ player.birthPlace.city + ', ' + player.birthPlace.state,
      player.positions[0].name,
    ].map(function(s) {
        playerStats.unshift('<tr><td>' + nestedStats.shift()
                          + ':</td><td>' + s + '</td></tr>');
    });

    stats  = '<table id="espn_zci_stats">'
           + playerStats.join("")
           + '</table>';
}

function ddg_spice_espn_events(response) {
    var events = response.sports[0].leagues[0].events;
    console.log(events[85]);
    gamelog = '<div id="espn_zci_gamelog"><table><tr>'
            + '<th></th><th>Home</th><th></th><th>Away</th>'
            + '<th></th><th></th></tr>';
    for (var i = events.length - 1; i > (events.length - 6); i--) {
        var competitors = events[i].competitions[0].competitors;
        var date = new Date(events[i].date);
        var outcome = '';
        gamelog += '<td>' + date.getMonth() + '/' + date.getDay() + '</td>';
        competitors.map(function(competitor, index, array) {
            teamDisplayName = competitor.team.location
                            + " " + competitor.team.name
            gamelog += '<td><a href="/?q='
                    +  encodeURIComponent(teamDisplayName)
                    +  '">' + teamDisplayName + '</a></td><td>'
                    +  (index == 0 ? ' vs ' : '</td>');
            if (index == 1) {
                outcome = competitor.score > array[0].score;
                var win = '<span style="color:green">W</span> ';
                var loss = '<span style="color:red">L</span> ';
                gamelog += '<td>'
                        +  '<a href="' + events[i].links.web.boxscore.href + '">' 
                        +  (competitor.team.id == teamID ?
                                (outcome ? win : loss)
                                + competitor.score
                                + '-' + array[0].score
                            : (outcome ? loss : win)
                                + array[0].score + '-'
                                + competitor.score)
                        +  '</a></td>';
            }
        });
        gamelog += '</tr>';
    }
    gamelog += '</table></div>';
    ddg_spice_espn_bind();

}

function ddg_spice_espn_news(response) {
    console.log(response);
    headlines = response.headlines;

    news = '<div id="espn_zci_news">'
         + '<img src="/iu/?u=' + headshot.href
         + '" height="' + headshot.height
         + '" width="' + headshot.width
         + '" style="float:right;margin:-20px 0px 10px 0px;"><ul>';

    for (var i = 0; i < 3 && i < headlines.length; i++) {
        var article = headlines[i];
        news += '<li><a href="' + article.links.web.href
             +  '">' + article.headline + '</a>'
             +  ' (' + article.source + ')</li>';
    }
    news += '</ul>'
         +  '</div>';

    ddg_spice_espn_bind();
}

function ddg_spice_espn_team(response) {
    response = response.sports[0].leagues[0].teams[0];
    var record = response.record;
    var stats = response.stats;
    var roster = response.athletes;
    var logo = response.logos.large.href;
    var teamColor = response.color;
    var totalGames = record.wins + record.losses + record.ties;
    var winPercentage = Math.floor(record.wins / totalGames * 100);
    var lossPercentage = Math.floor(record.losses / totalGames * 100);
    var tiePercentage = 100 - winPercentage - lossPercentage;
    var season = record.season.year
               + " (" + record.season.description + " season)";
    console.log(response);
    team = '<div id="espn_zci_team">'
         + '<img style="float:right;" src="' + logo + '">'
         + '<fieldset style="border-top:1px solid #'
         + teamColor + ';padding:10px 10px 20px 10px;width:67%;">'
         + '<legend>&nbsp;' + season + '&nbsp;</legend>'
         + '<div style="background-color:green;width:'
         + winPercentage + '%">&nbsp;' + record.wins + ' wins</div>'
         + '<div style="background-color:red;margin-top:0px;width:'
         + lossPercentage + '%">&nbsp;' + record.losses + ' losses</div>'
         + (record.ties !== 0 ? 
            '<div style="background-color:grey;width:'
            + tiePercentage + '%">&nbsp;' + record.ties + ' ties</div>'
            : "") + '</fieldset>'
         + '<table style="border-spacing:20px;margin-top:10px;">'
         + '<th>Name</th><th>Position</th><th>No.</th>'
         + '<th>Age</th><th>HT</th><th>WT</th>'
         + roster.map(function(player) {
             return '<tr>'
                    + '<td><a href="/?q='
                    + encodeURIComponent(player.displayName)
                    + '">' + player.displayName + '</td>'
                    + '<td>' + player.positions[0].name + '</td>'
                    + '<td>' + player.jersey + '</td>'
                    + '<td>' + player.age + '</td>'
                    + '<td>' + player.height + '</td>'
                    + '<td>' + player.weight + '</td>'
                    + '</tr>';
         }).join("") + '</table>';
    team += '</div>';

    ddg_spice_espn_bind();
}

function ddg_spice_espn_bind() {
    if (++callsMade != numberOfCalls) return;

    items[0]['a'] = tabs
                  + news
                  + team
                  + stats
                  + gamelog;

	nra(items);

    var table = document.getElementById("espn_zci_stats");
    for (var i = 0; i < table.rows.length; i++) {
        if (i % 2 == 0) table.rows[i].className="tr_odd";
    }

    ids = [ "espn_zci_gamelog_link",
            "espn_zci_stats_link",
            "espn_zci_team_link",
            "espn_zci_news_link"
          ];

    var bgtabs = [];
    ids.map( function(id) {
        bgtabs.push(document.getElementById(id.replace("_link","")))
    });

    var current_link = document.getElementById("espn_zci_news_link");
    YAHOO.util.Dom.setStyle(current_link, "text-decoration", "underline");


    YAHOO.util.Event.addListener(ids, "click", function(e) {
        YAHOO.util.Dom.setStyle(current_link, "text-decoration", "none");
        current_link = this;
        YAHOO.util.Dom.setStyle(this, "text-decoration", "underline");
        var current_tab = this.id.replace("_link", "");
        bgtabs.map(function(i){i.style.display="none";});
        current_tab = document.getElementById(current_tab);
        current_tab.style.display = "block";
        e.stopImmediatePropagation();
    });

    YAHOO.util.Event.addListener(ids, "mouseenter", function(e) {
        YAHOO.util.Dom.setStyle(this, 'text-decoration', 'underline');
    });

    YAHOO.util.Event.addListener(ids, "mouseleave", function(e) {
        if (this != current_link) {
            YAHOO.util.Dom.setStyle(this, 'text-decoration', 'none');
        }
    });
}