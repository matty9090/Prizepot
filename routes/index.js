var express = require('express');
var http = require('follow-redirects').http;
var sqlite3 = require('sqlite3');

var router = express.Router();
var db = new sqlite3.Database('bin/db');
var events = [];

db.each('SELECT id, name FROM events', function(err, row) {
    var event = { name: row.name, milestones: [] };
    
    db.each(`SELECT name, pot FROM milestones WHERE achieved=0 AND event=${row.id}`, function(err, ms) {
        event.milestones.push({ name: ms.name, pot: ms.pot });
    });

    events.push(event);
});

router.get('/', function(req, res, next) {
    var json = '';
    var today = new Date().toISOString().split('T')[0];

    var req = http.request({
        host: 'www.worldcubeassociation.org',
        path: `/api/v0/search/competitions?q=&country_iso2=GB&start=${today}}`,
        method: 'GET'
    }, (resp) => {
        resp.on('data', (d) => {
            json += d;
        });

        resp.on('end', function() {
            var comps = JSON.parse(json).result.reverse();         
            res.render('index', { title: 'UK Competition Prizepot', events: events, comp: comps[0] });
        });
    });

    req.on('error', (error) => {
        console.log(error);
    });
    
    req.end();
});

module.exports = router;
