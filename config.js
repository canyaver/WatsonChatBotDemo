module.exports = {
    sNowOptions1 : {
        method: "GET",
        url: "https://dev32023.service-now.com/api/39060/get_ag_and_service_of_an_inc/get_ag/",
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : 'Basic YWRtaW46TnJlVHVldWI4'
        }
    },
    sNowOptions2 : {
        method: "PUT",
        url : "https://dev32023.service-now.com/api/now/table/incident/",
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : 'Basic YWRtaW46TnJlVHVldWI4'
        },
        qs: {
            'sysparm_exclude_reference_link':true,
            'sysparm_suppress_auto_sys_field':true
        }
    },
    apmreport : {
        method: 'POST',
        headers: {
            "Content-Type" : 'application/json; charset=utf-8', 
            "Authorization" : "bearer "
        },
        url : "https://nestle-test-api.alfabet.com/rest/api/v2/objects",
        json: {
            "Language":1033, 
            "EmptyValues":true, 
            "Report":"", //Enter APM report name here
            "ReportResult": "DataSet", 
            "Offset":0,
            "Limit": 100,
            "ReportArgs" : {
                "u_name" : "" //Set the Nestle email here
            }
        }
    },

    apmtoken : {

            url: `https://nestle-test-api.alfabet.com/rest/api/token`,
            headers: {
                 "Content-Type" : "application/x-www-form-urlencoded"
            },
            method: 'POST',
            form: {
                    grant_type:"password", 
                    username: "NES_INTERFACE_USER", 
                    password: "5BSH6LPHEEYFW65DPJP2ELFZN66NB6RE",
            }  
    },
    addUser : {
        method: 'PUT',
        url: "https://nestle-test-api.alfabet.com/rest/api/v2/update",
        headers: {
            "Content-Type" : 'application/json; charset=utf-8', 
            "Authorization" : "bearer "
        },
        json: {
        
                "Objects" : [{
                            "ClassName" : "Person",
                            "Id" : "1",
                            "Values" : {
                                "firstname" : "Donald",
                                "name" : "Trump",
                                "EMail" : "donald.trump@nestle.com",
                                "USER_NAME" : "donald.trump@nestle.com",
                                "TYPE" : 1
                            }
                }]
        }
        
    },
    updateUser: {
        method: 'PUT',
        url: "https://nestle-test-api.alfabet.com/rest/api/v2/update",
        headers: {
            "Content-Type" : 'application/json; charset=utf-8', 
            "Authorization" : "bearer "
        },
        json: { "Relations": [{
                    "FromRef" : "", //person id here
                    "Property" : "PROFILES",
                    "ToRef" : "" //profile ID here
        }]
    }

    },
    lmsOptions: {
        method:"GET",
        url: "", //append talentlmsbase_url with email address for the url
        headers: {
            "Authorization":"Basic WWo1cmZHWHM3MjhCNjlNOFBFQm55MkdDVFlXVlBEOg=="
        }
    },
    requiredTrainings: [
        {"profile_id" : "230-6-0", //User needs to have passed this training to be eligible for the profile.
        "name" : "Application Owner",
        "url" : "https://canyaver.talentlms.com/learner/course/id:125",
        "loid":"125",
        "NES_TrainingsTaken":"Application Owner"}
    ],
    noTrainingProfiles :["230-3-0"],
    talentlmsbase_url :"https://canyaver.talentlms.com/api/v1/users/email:",
    "log4jsConfig": {"appenders": [{ "type": "file",
                                        "filename": "./logs/watsonAPI.log",
                                        "maxLogSize": 50000,
                                        "backups": 10,
                                        "category": "watsonAPI"}]
   },
    user: "captain.america@nestle.com",
}