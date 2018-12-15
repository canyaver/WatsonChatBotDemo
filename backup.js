request(config.apmreport, (err2,resp2,body2) => {

                  if (err2)
                      logger.error(err2.message);
                  else {
                      
                      let ret2 = body2.Objects;
                      config.apmreport.json.Report="all_user_profiles";
                      delete config.apmreport.json.ReportArgs;

                      request(config.apmreport, (err3,resp3,body3) => {
                          if (err3) {
                            logger.error(err3.message);
                          }
                          else  {
                            let ret3 = body3.Objects;
                            let all_profiles = [];
                            logger.debug(JSON.stringify(ret3));
                            for (let i3 of ret3) {
                              all_profiles.push({"id":i3.Values.REFSTR,"name":i3.Values.NAME});
                            }
                            wat_resp.context.all_profiles = all_profiles;
                            
                            if (ret2.length === 0) {
                              wat_resp.context.userStatus = "new";
                              res.send({"wat":`You don't have an account defined in APM. Which profile do you need?<br>${hlp.recListNoColName(all_profiles,["name"])}`,
                                    "ctx":wat_resp.context});

                            } else if (ret2.length === all_profiles.length) {
                                wat_resp.context.userStatus = "full";
                                res.send({"wat": "You have all the possible profiles",
                                        "ctx":{}});

                            } else {
  
                              let users_profiles = [];
                              for (let i2 of ret2) {
                                users_profiles.push({"id":i2.Values.refstr, "name" : i2.Values.profile_name});
                              }
                              
                              wat_resp.context.users_profiles = users_profiles;
                              wat_resp.context.userStatus = "user2update";
                              delete wat_resp.context.action;
                              res.send({"wat":`You already have the following profiles:${hlp.recListNoColName(users_profiles,["name"])} Do you need an additional profile?`,
                                    "ctx":wat_resp.context});
                            
                            }
                        }
                      });
                    }  
                  });