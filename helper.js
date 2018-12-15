const _ = require('underscore');

module.exports = {
    singleRecHTMLTable: function(result) {
        let retVal = '<table class="DataTable">';
        for (let key in result) {
            if (typeof result[key] === "object" && result[key].hasOwnProperty("fieldVal") && result[key].hasOwnProperty("fieldLabel"))
            {
                retVal += `<tr>
                            <td class="fieldName">${result[key].fieldLabel}</td>`;
                if (!Array.isArray(result[key].fieldVal)) {
                    retVal += `<td>${result[key].fieldVal}</td></tr>`;
                } else {
                    let nmb = 1;
                    retVal += '<td>'
                    for (let i of result[key].fieldVal) {
                        result[key].numbering ? retVal += `${nmb}.${i.val}` : retVal += i.val;
                        retVal += '<br>';
                        nmb++;
                    }
                    retVal = retVal.slice(0,-4) + '</tr></td>'; //slice(0,-4) removes the last <br> tag
                }
            }
        }
        return retVal + '</table>';
    },
    //fields2Display is an array of fields in the objects of the input array
    recListNoColName: function(input,fields2Display) {

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
    },
    //Subtracts the elements of the 2nd array from the 1st array
    arraySubtract : function(arr1, arr2) {
        return _.filter(arr1, (obj)=> {
            return !_.findWhere(arr2, obj); 
        });
    },
    //'to' is a String, 'from' is an array
    buildRelationsBody : function (toref,fromref) {
        let retArray = [];
        for (var k of fromref) {
            retArray.push({"FromRef":toref,
                            "Property" : "PROFILES",
                            "ToRef" : k                
            });
        }
        return retArray;
    }
    
}