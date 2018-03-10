const scraper = require("./scraping/scraper");
const _ = require("lodash");
const async = require("async");
const fs = require("fs");

/* Run all requests asynchronously*/

//      (array links ex:'detroit')    (array)            US->STATE->{cityLinks: array, cityName: array}
//JSON = { cityLinks: Array(420), stateNames: Array(52), US: Object}
const main = (JSON) =>{
  linkPrefixList = ['detroit','annarbor','porthuron'];
  let requestQueue = async.queue((linkPrefix,callback)=>{
    scraper.searchResults('https://'+linkPrefix+'.craigslist.org/search/cto?query=subaru+forester&min_price=500&max_price=2000&max_auto_year=2005')
      .then((res)=>{
        res = {
          results: res,
          linkPrefix: linkPrefix
        }
        callback(res);
      })
      .catch((err)=>{
        callback(null,err);
      })

  }, linkPrefixList.length);

  totalResults = [];
  _.each(linkPrefixList,(linkPrefix)=>{
    requestQueue.push(linkPrefix,(res,err)=>{
      //callback (means im finished with on request)
      if(err){
        return console.log(err);
      }
      totalResults.push(res);
    })
  })

}

//read links from file and then start main!
fs.readFile(scraper.allLinksFilePath,(err,data)=>{
  if(err){
    return console.log(err);
  }
  main(JSON.parse(data));
})

