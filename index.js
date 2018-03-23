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

  main(JSON.parse(data).US.Michigan.cityPrefix);
})

//      (array links ex:'detroit')    (array)            US->STATE->{cityLinks: array, cityName: array}
//JSON = { cityLinks: Array(420), stateNames: Array(52), US: Object}
const main = (JSON) =>{
  const mainResults = [];//scrapped results live here  
  let linkPrefixList = JSON; //test prefix
  
   const q = async.queue((linkPrefix,callback)=>{

    //random number between 30-45. Each request is delayed by this amount
    let delay = 30+Math.floor(Math.random()*15);
    console.log('Will scrape '+linkPrefix+' in '+delay);
    setTimeout(function() {
      console.log('Scraping '+linkPrefix+'...');
      scraper.searchResultsOdemeter("subaru+forester+1999",linkPrefix,200000,'')
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
    }, delay*1000);

  }, 3);
  
  _.each(linkPrefixList,(linkPrefix)=>{
    q.push(linkPrefix,(res,err)=>{
      //callback (means im finished with on request)
      if(err){
        return console.log(err);
      }
      if(res.results.length>0) mainResults.push(res);
    })
  });

  q.drain = ()=>{
    console.log('all items have been processed');
    scraper.resultsToFile(mainResults);
    console.log('\u0007');  
  };
}

