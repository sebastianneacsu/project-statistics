//get project name and credentials from config file
var config = require('./config.json');
var fs = require("fs")

//authenticate to jira using jira node plugin
JiraApi = require('jira').JiraApi;
var jira = new JiraApi('https', config.jiraProjectURL, null, config.jiraUserName, config.jiraPassword, '2');


//search for jira issues and update a json file with the values
function search(query, file, key){
	jira.searchJira(query,{
		maxResults:1000
	},function(error, search) {
		updateJsonFile(file, key, search.total)
	});
}

jira.findRapidView("UNIONVMS", function(error, search) {
		console.log(search);
		console.log(error);
	});

// execute jira queries
/*search( "project = " + config.project + " AND issuetype = Bug AND status = Open", "data.json", "open");
search( "project = " + config.project + " AND issuetype = Bug AND status = Closed", "data.json", "closed");
search( "project = " + config.project + " AND issuetype = Bug AND status = 'In Progress'", "data.json", "in_progress");
search( "project = " + config.project + " AND issuetype = Bug AND status = Resolved", "data.json", "resolved");
search( "project = " + config.project + " AND issuetype = Bug AND status = Draft", "data.json", "draft");
search( "project = " + config.project + " AND issuetype = Bug AND status = 'Need Info'", "data.json", "need_info");
search( "project = " + config.project + " AND issuetype = Bug AND status = Published", "data.json", "published");*/


//function for file input
function getFile(filename) {
	var data = fs.readFileSync(filename,"ascii")
	return data }

//function for updating specific values in json
function updateJsonFile(file, key, value){
	//parsing json
	var jsonString = [getFile(file)];
	var jsonObj = JSON.parse(jsonString);

	// updating values in JSON
	jsonObj.bugs[key] = value; 

	// writing back in JSON file
	var toStringJson = JSON.stringify(jsonObj);
	fs.writeFileSync(file, toStringJson);

	// testing update
	var jsonTestValue= [getFile(file)];
	console.log("jsonTestValue  = " + jsonTestValue);

}


