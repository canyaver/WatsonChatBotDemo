const express     = require('express');
const bodyParser  = require('body-parser');
const request     = require('request');
const           _ = require('underscore');
//const reqprom     = require('request-promise');
const log4js      = require('log4js'); 
const hlp         = require('./helper');
const moment      = require('moment');
var config        = require('./config');
const watson      = require('watson-developer-cloud');
const conversation = new watson.ConversationV1({
  username: process.env.CONVERSATION_USERNAME || '2f770a48-85f3-4bce-9628-3049f4b036c0',
  password: process.env.CONVERSATION_PASSWORD || '3vAlyx4RwiXl',
  path: { workspace_id: '7c0f1ad0-8d9d-4817-bfe6-061ed91ea949' }, 
  version_date: watson.ConversationV1.VERSION_DATE_2017_02_03
});
log4js.configure(config.log4jsConfig);
const logger = log4js.getLogger("watsonAPI");
var globalToken = { "val" : "",
                    "born": null};
//getting apm token
request(config.apmtoken, (err,resp,body) => {
  if (err) {

    logger.error(`error in original token request: ${err.message}`);

  } else {

    globalToken.val = JSON.parse(body).access_token;
    globalToken.born = moment();
    
  }
});

const app = express();
app.use(bodyParser.json());
app.use('/chatbot',express.static('../Chat_Demo/Material Modern Chat/'));

app.post('/watsonservice',(req,res) => {
   
    if (req.body.message !== undefined && req.body.message.length>0) {
        conversation.message({
            "input": {
              "text": req.body.message
            },
            "context" : req.body.context,
            "alternate_intents": false
          }, (err, wat_resp) => {

              var it = processWatsonResponse(err,wat_resp);
              it.next();
              //console.log(it.value);
              //it.return();
              function* processWatsonResponse(err, wat_resp) {

                  if (err) {
                      res.send(err.message); // something went wrong
                      return;
                  }
                  
                  // Display the output from dialog, if any.
                  if (wat_resp.output.text[0] !== "apiresponds") {
                        res.send({"wat":wat_resp.output.text[0],
                                  "ctx":wat_resp.context
                        });
                  } else if (wat_resp.context.action !== undefined ) {
                        switch(wat_resp.context.action) {
                            case "fetchIncTicket":
                                config.sNowOptions1.url += wat_resp.context.ticketNumber;
                                request(config.sNowOptions1, (sn_err, sn_resp, sn_body) => {
                                      if (!sn_err) {
                                            const sn_json_result = JSON.parse(sn_body).result;
                                            let fetchResp =  'Is this the ticket we are talking about?<br>' + hlp.singleRecHTMLTable(sn_json_result);
                                            delete wat_resp.context.action;
                                            delete wat_resp.context.ticketNumber;
                                            wat_resp.context.supportingAGs = sn_json_result.supporting_ags;
                                            wat_resp.context.ticket_sys_id = sn_json_result.sys_id;
                                            res.send({"wat": fetchResp,
                                                      "ctx": wat_resp.context
                                          });
                                      }
                                });
                            break;
                            case "assigntoSupportingAGindex":
                                config.sNowOptions2.url += wat_resp.context.ticket_sys_id;
                                config.sNowOptions2.json = {
                                  'assignment_group' : wat_resp.context.supportingAGs.fieldVal[parseInt(wat_resp.context.agindex)-1].id
                                }
                                request(config.sNowOptions2, (sn_err, sn_resp, sn_body) => {
                                    if (!sn_err && sn_resp.statusCode === 200) {
                                      res.send({"wat":"Success in assigning to " + wat_resp.context.supportingAGs.fieldVal[parseInt(wat_resp.context.agindex)-1].val,
                                                "ctx":{}
                                      });
                                    }
                                });
                            break;
                            case "checkapmuser":
                                if (moment().diff(globalToken.born,'minutes')>15 || globalToken.val.length<10) {
                                    const tok = yield doRequest(config.apmtoken);
                                    if (!tok.err) {
                                        globalToken.val= JSON.parse(tok.body).access_token;
                                        globalToken.born = moment();
                                    }
                                }
                                config.apmreport.headers.Authorization  = "bearer " + globalToken.val;
                                config.apmreport.json.Report            = "profile_of_a_user";
                                config.apmreport.json.ReportArgs        = {};
                                config.apmreport.json.ReportArgs.u_name = config.user;
                                
                                const usrProfRepRet = yield doRequest(config.apmreport);

                                config.apmreport.json.Report="all_user_profiles";
                                delete config.apmreport.json.ReportArgs;

                                const allProfRepRet = yield doRequest(config.apmreport);
                                let all_profiles = [];

                                for (let i of allProfRepRet.body.Objects) {
                                    all_profiles.push({"id":i.Values.REFSTR,"name":i.Values.NAME});
                                }

                                wat_resp.context.all_profiles = all_profiles;

                                if (usrProfRepRet.body.Objects.length === 0) {

                                    wat_resp.context.userStatus = "new";
                                    res.send({"wat":`You don't have an account defined in APM. Which profile(s) do you need?<br>${hlp.recListNoColName(all_profiles,["name"])}`,
                                          "ctx":wat_resp.context});

                                } else if (usrProfRepRet.body.Objects.length === all_profiles.length) {

                                    wat_resp.context.userStatus = "full";
                                    res.send({"wat": "You have all the possible profiles",
                                            "ctx":{}});

                                } else {

                                    let users_profiles = [];
                                    let watRespTemp    = '';
                                    for (let i of usrProfRepRet.body.Objects) {

                                        if (i.Values.prof_refstr !== null && i.Values.prof_name !== null) {

                                            users_profiles.push({"id":i.Values.prof_refstr, "name" : i.Values.prof_name});
                                        }        
                                    }

                                    wat_resp.context.userapmid = usrProfRepRet.body.Objects[0].Values.usr_refstr;
                                    
                                    wat_resp.context.users_profiles = users_profiles;

                                    wat_resp.context.userStatus = "user2update";
                                    
                                    delete wat_resp.context.action;

                                    if (users_profiles.length === 0) {
                                        watRespTemp = `You don't have any profiles. Do you need to add profiles?`;
                                    } else {
                                        watRespTemp = `You already have the following profiles:${hlp.recListNoColName(users_profiles,["name"])} Do you need an additional profile?`;
                                    }

                                    res.send({"wat": watRespTemp,
                                          "ctx":wat_resp.context});
                                    
                                
                                }         
                      
                            break;
                            case "listMissingProfiles":
                                
                                res.send({"wat" : `Select from the below profiles which you do not have:
                                                    ${hlp.recListNoColName(hlp.arraySubtract(wat_resp.context.all_profiles, wat_resp.context.users_profiles ),["name"])}`,
                                          "ctx":wat_resp.context});
                                
                            break;
                            case "checkRequestedProfile":
                                let profileRespText = "";
                                let profilesAddOk = [];
                                
                                for (let i of wat_resp.entities) {

                                    //no need for a i.entity ==="apmProfile" check here because the condition is at the conversation level.
                                    let entityProfileName = _.findWhere(wat_resp.context.all_profiles, {"id":i.value});

                                    let searchExProfile = _.findWhere(wat_resp.context.users_profiles,{"id":i.value});

                                    let searchTraining = _.findWhere(config.requiredTrainings,{"profile_id":i.value});

                                    if ( searchExProfile !== undefined) {

                                        profileRespText += `You already have got ${searchExProfile.name} profile<br>`;

                                    } else if ( searchTraining !== undefined ) {

                                        config.lmsOptions.url = config.talentlmsbase_url + config.user;
                              
                                        const lmsResp = yield doRequest(config.lmsOptions);

                                        if (!lmsResp.err) {
                                            const parsedlmsBody = JSON.parse(lmsResp.body);
                                            if (parsedlmsBody.courses !== undefined && parsedlmsBody.courses.length > 0) {
                                                
                                                for (let z of parsedlmsBody.courses) {
                                                    
                                                    if (z.id === searchTraining.loid) {

                                                            if (z.completion_percentage === "100" && z.completion_status === "completed") {

                                                                    profilesAddOk.push({"id":i.value,"name" : entityProfileName.name,"nes_tr":searchTraining.NES_TrainingsTaken});

                                                                    break;

                                                            } else {

                                                                    profileRespText += `${searchTraining.name} requires training to be completed. Please complete the training at <a href="${searchTraining.url}" target="_blank">here</a>`;

                                                            }
                                                    }

                                                }

                                            } else if (parsedlmsBody.courses !== undefined && parsedlmsBody.courses.length === 0) {

                                                    profileRespText += `Please complete the ${searchTraining.name} training you were assigned <a href="https://canyaver.talentlms.com/catalog/index" target="_blank">here</a>.`;
                                            
                                            } 
                
                                            else if (parsedlmsBody.error !== undefined) {

                                                    profileRespText += `${searchTraining.name} requires training completed. Please request the training be assigned from APM team.`;

                                            }
                                        }

                                    } else {

                                        profilesAddOk.push({"id":i.value,"name" : entityProfileName.name});

                                    }
                                }

                                if (profilesAddOk.length>0) {
                                    
                                    switch (wat_resp.context.userStatus) {

                                        case "new":
                                            
                                            config.addUser.headers.Authorization = "bearer " + globalToken.val;
                                            
                                            const addusresp = yield doRequest(config.addUser);

                                            if (!addusresp.err) {

                                                config.updateUser.headers.Authorization = "bearer " + globalToken.val;
                                                config.updateUser.json.Relations = hlp.buildRelationsBody(addusresp.body.NewObjects["1"],_.pluck(profilesAddOk,"id"));
                                                const addprofres = yield doRequest(config.updateUser);
                                                if (!addprofres.err) {
                                                    
                                                    res.send({"wat": `User with the requested profiles added: ${_.pluck(profilesAddOk,"name")}.<a href="https://nestle-test.alfabet.com/" target="_blank">Login</a><br>${profileRespText}`,
                                                              "ctx":wat_resp.context
                                                    });
                                                    
                                                }
                                            }
                                        break;

                                        case "user2update":

                                            config.updateUser.headers.Authorization = "bearer " + globalToken.val;
                                            
                                            config.updateUser.json.Relations = hlp.buildRelationsBody(wat_resp.context.userapmid,_.pluck(profilesAddOk,"id"));
                                            const addprofres = yield doRequest(config.updateUser);
                                            
                                            if (!addprofres.err) {
                                                
                                                res.send({"wat": `${_.pluck(profilesAddOk,"name")} profile added to the existing user.<br>${profileRespText}`,
                                                          "ctx":wat_resp.context
                                                });
                                                
                                            }
                                        break;

                                  }
                                } else {
                                        res.send({"wat":profileRespText,
                                                  "ctx":wat_resp.context
                                        });
                                        
                                }
                            break;
                            case "apmFeatureRequest":
                                if (moment().diff(globalToken.born,'minutes')>15 || globalToken.val.length<10) {
                                        const tok = yield doRequest(config.apmtoken);
                                        if (!tok.err) {
                                            globalToken.val= JSON.parse(tok.body).access_token;
                                            globalToken.born = moment();
                                        }
                                }
                                config.apmreport.headers.Authorization  = "bearer " + globalToken.val;
                                config.apmreport.json.Report            = "profile_of_a_user";
                                config.apmreport.json.ReportArgs        = {};
                                config.apmreport.json.ReportArgs.u_name = config.user;
                                
                                const usrProf = yield doRequest(config.apmreport);

                                for (let i of wat_resp.entities) {
                                        if (i.value === "le_dashboard") {
                                                if (usrProf.body.Objects.length>0) { //the user is in
                                                        for (let x of usrProf.body.Objects) {
                                                                if (x.Values.prof_refstr !== null) { //any profile gives access
                                                                        res.send({"wat": `You already have access to <a href="https://nestle-test.alfabet.com/Application.aspx?alfa_param=T4WSOT%2FPJxRzN1PdDCyQwFZfXGPFLRF%2F7mEFudvlyTlOBa9NVjraSYHPHGa6HqupAcy6OXmGWtwC1GZ4ZycjMw%3D%3D" target="_blank">Legacy Elimination Dashboard</a>`,
                                                                                "ctx":wat_resp.context
                                                                        });
                                                                        break;
                                                                }
                                                        }
                                                } else {  //the user is not in Alfabet
                                                        config.addUser.headers.Authorization = "bearer " + globalToken.val;
                                            
                                                        let addusresp = yield doRequest(config.addUser);

                                                        if (!addusresp.err) {

                                                            config.updateUser.headers.Authorization = "bearer " + globalToken.val;
                                                            config.updateUser.json.Relations = hlp.buildRelationsBody(addusresp.body.NewObjects["1"],["230-3-0"]);
                                                            let addprofres = yield doRequest(config.updateUser);
                                                            if (!addprofres.err) {
                                                                
                                                                res.send({"wat": `I added a Viewer account for you in APM. You can now access LE Dashboard <a href="https://nestle-test.alfabet.com/Application.aspx?alfa_param=T4WSOT%2FPJxRzN1PdDCyQwFZfXGPFLRF%2F7mEFudvlyTlOBa9NVjraSYHPHGa6HqupAcy6OXmGWtwC1GZ4ZycjMw%3D%3D" target="_blank">here</a>`,
                                                                        "ctx":wat_resp.context
                                                                });
                                                                
                                                            }
                                                        }  
                                                }
                                        }  
                                }

                            break;
                        }
                  }

              }
              function doRequest(opts) {
                  request(opts, (err,resp,body) => {
                      it.next({"body":body, "err":err});
                  });
              }
  
        });
    }
});
app.get('/chatbot',(req,res)=>{
  res.sendFile('/Users/canyaver/Documents/Chat_Demo/index.html');
});


app.listen(3300);