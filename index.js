const scraper = require("./scraping/scraper");
const _ = require("lodash");
const async = require("async");
const fs = require("fs");

/* Run all requests asynchronously*/

//read links from file and then start main!
fs.readFile(scraper.allLinksFilePath,(err,data)=>{
  if(err){
    return console.log(err);
  }

  main(JSON.parse(data));
})

//      (array links ex:'detroit')    (array)            US->STATE->{cityLinks: array, cityName: array}
//JSON = { cityLinks: Array(420), stateNames: Array(52), US: Object}
const main = (JSON) =>{
  mainResults = [];//scrapped results live here  
  linkPrefixList = JSON.cityLinks; //test prefix

  //queue to asynchronously request craigslist pages and scrape results
  const q = async.queue((linkPrefix,callback)=>{
    //searchResults takes a link and returns a promise with a scraped array as an aruement
    scraper.searchResults('https://'+linkPrefix+'.craigslist.org/search/cto?query=subaru+forester')
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
  }, 1);
  
  _.each(linkPrefixList,(linkPrefix)=>{
    q.push(linkPrefix,(res,err)=>{
      //callback (means im finished with on request)
      if(err){
        return console.log(err);
      }
      console.log('pussh baby puush ;)');
      mainResults.push(res);
    })
  });

  q.drain = ()=>{
    console.log('all items have been processed');
  };
}

