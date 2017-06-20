var config = require('./config.json');
var jsonFileData = require('./data.json');
var Client = require('node-rest-client').Client;
var fs = require("fs")
 
// configure basic http auth for every request 
var options_auth = { 
	user: config.jiraUserName, 
	password: config.jiraPassword
};

var argsJql ={
    requesConfig: { timeout: 1000 },
    responseConfig: { timeout: 2000 },
    data: { jql: "queryString" },
    headers: { "Content-Type": "application/json" }
};
 
var client = new Client(options_auth);

//function to get the active sprint from project board and update a json file with the values
function getActiveSprint(file){
	client.get("https://"+config.jiraProjectURL + "/rest/agile/1.0/board/" + config.jiraProjectBoard + "/sprint", function(data, response) {
    // search for active sprint in project board
    var activeSprintId = 0;
    var activeSprintName = 0;
    var activeSprintStartDate = 0;
    var activeSprintEndDate = 0;
    for (var i=0; i < data.values.length; i++){
    	if (data.values[i].state == "active"){
    		activeSprintId = data.values[i].id;
    		activeSprintName = data.values[i].name;
    		activeSprintStartDate = formatDate(data.values[i].startDate);
    		activeSprintEndDate = formatDate(data.values[i].endDate);
    	}
    }
    updateJsonFile(file, ["activeSprint", "id"], activeSprintId);
    updateJsonFile(file, ["activeSprint", "name"], activeSprintName);
    updateJsonFile(file, ["activeSprint", "startDate"], activeSprintStartDate);
    updateJsonFile(file, ["activeSprint", "endDate"], activeSprintEndDate)
  	});
}
getActiveSprint("data.json");

//function to search for jira issues and update a json file with the values
function searchJql(query, file, key){
	//define query
	argsJql.data.jql = query;
	//post query to search api
 	client.post("https://" + config.jiraProjectURL + "/rest/api/2/search", argsJql, function (data, response) {
    // parse response and update json file
    console.log("search result   = " + data.total);
	updateJsonFile(file, key, data.total)
   });
}

// execute jira queries
/*searchJql( "project = " + config.project + " AND issuetype = Bug AND status = Open", "data.json", "open");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = Closed", "data.json", "closed");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = 'In Progress'", "data.json", "in_progress");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = Resolved", "data.json", "resolved");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = Draft", "data.json", "draft");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = 'Need Info'", "data.json", "need_info");
searchJql( "project = " + config.project + " AND issuetype = Bug AND status = Published", "data.json", "published");
*/

//searchJql( "project = "+config.project+" AND issuetype = Bug AND created >= "+jsonFileData.activeSprint.startDate+" AND created <= "+jsonFileData.activeSprint.endDate, "data.json", ["activeSprint", "bugsCreated"]);
//searchJql( "project = "+config.project+" AND issuetype = Bug AND status = Closed AND Sprint = " + +jsonFileData.activeSprint.id, "data.json", ["activeSprint", "bugsClosed"]);
//searchJql( "project = "+config.project+" AND issuetype = Test AND created >= "+jsonFileData.activeSprint.startDate+" AND created <= "+jsonFileData.activeSprint.endDate, "data.json", ["activeSprint", "testCasesCreated"]);
//searchJql( "project = "+config.project+" AND issuetype = Story AND status = Closed AND Sprint = " + +jsonFileData.activeSprint.id, "data.json", ["activeSprint", "storiesClosed"]);
searchJql( "project = " + config.project + " AND issuetype = Story AND status in (Open, 'In Progress', Draft, 'Need Info', Published)", "data.json", ["stories", "open"]);
searchJql( "project = " + config.project + " AND issuetype = Epic AND status in (Open, 'In Progress', Draft, 'Need Info', Published)", "data.json", ["epics", "open"]);
searchJql( "project = " + config.project + " AND issuetype = Story AND status in (Open, 'In Progress', Draft, 'Need Info', Published) AND Sprint = " + jsonFileData.activeSprint.id, "data.json", ["activeSprint", "storiesToDo"]);

//function for file input
function getFile(filename) {
	var data = fs.readFileSync(filename,"ascii")
	return data }

//function for updating specific values in json. Key is an array of category and key. e.g. [bugs, closed]
function updateJsonFile(file, key, value){
	//parsing json
	var jsonString = [getFile(file)];
	var jsonObj = JSON.parse(jsonString);

	// updating values in JSON
	jsonObj[key[0]][key[1]] = value; 

	// writing back in JSON file
	var toStringJson = JSON.stringify(jsonObj);
	fs.writeFileSync(file, toStringJson);

	// testing update
	var jsonTestValue= [getFile(file)];
	console.log("jsonTestValue  = " + jsonTestValue);

}

//function for formatting date to jira api requirements
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}