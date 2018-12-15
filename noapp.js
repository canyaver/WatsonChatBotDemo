//const hlp = require('./helper');
let result = [
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Admin"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Viewer"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Anonymous User"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Application Owner"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Architect"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"Manager"}},
{"RefStr":"0-0-0","Values":{"refstr":"273-1575-0","user_name":"STEVE.ADAMSON@NESTLE.COM","profile_name":"User Admin"}}]
  
function nocolTable(input,fields2Display) {

        let retVal = '<table class="DataTable">';

        for (let key in input) {

            if (typeof input[key] === "object") {

              for (let d of fields2Display) {

                if (input[key].hasOwnProperty(d)) {

                  retVal += `<tr><td>${input[key][d]}</td></tr>`;

                }
              }
            }
        }
        return retVal + '</table>';
    }

    console.log(nocolTable(result,["profile_name"])); 
    