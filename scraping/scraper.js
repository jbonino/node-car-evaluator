const request = require("request-promise-native");
const cheerio = require('cheerio');
const fs = require("fs");

exports.allLinksFilePath = './allLinks';
exports.resultsFilePath = './results';


/* Gets all craigslist postings from a single page. 
  Parsing is focused for car listings, may not work for others
*/
exports.searchResults = (uri) => {
  let options = {
    uri: uri,
    transform: function(body) {
      return parseSearchResults(cheerio.load(body));
    }
  };
  return request(options)
};
const parseSearchResults = $ => {
  let results = [];
  $(".rows").find('.result-row').each((index, el) => {
      //each results
      results.push({
        dataPid: $(el).attr("data-pid"),
        link: $(el).find(".result-info .result-title").attr("href"),
        title: $(el).find(".result-info .result-title").text(),
        shortDate: $(el).find(".result-info time").text(),
        longDate: $(el).find(".result-info time").attr("datetime"),
        price: $(el).find(".result-info .result-meta .result-price").text(),
      });
    });
  return results;
};


//returns promise
exports.allLinks = () =>{
  let siteListOptions = {
    uri: "https://www.craigslist.org/about/sites",
    transform: function(body) {
      return parseAllLinks(cheerio.load(body));
    }
  };
  return request(siteListOptions);
}
const parseAllLinks = $ => {
  let retJSON = {};
  //country, state, city link/prefix
  let allCities = [];
  let allStateNames = [];
  let US = {};
  //parse DOM and fill variables above
  $("h1").each((countryIndex, countryEl) => {
    if ($(countryEl).text() === "US") {
      //US country
      $(countryEl)
        .next()
        .find("h4")
        .each((stateIndex, stateEl) => {
          //US states
          let cityArray = [];
          let cityNameArray = [];
          $(stateEl)
            .next()
            .find("li a")
            .each((cityIndex, cityEl) => {
              //city
              const prefix = $(cityEl)
                .attr("href")
                .slice(8)
                .match(/^[A-z]+/g)[0];
              //push all cities to this array for quick access
              allCities.push(prefix);
              cityArray.push(prefix);
              cityNameArray.push($(cityEl).text());
            });
          //after you grab city stuff,
          allStateNames.push($(stateEl).text());
          US = {
            ...US,
            [$(stateEl).text()]: {
              cityPrefix: cityArray,
              cityName: cityNameArray
            }
          };
        });
    }
  });

  return {
    cityLinks: allCities,
    stateNames: allStateNames,
    US: US
  };
};

exports.allLinksToFile = () =>{
  exports.allLinks()
    .then(res => {
      fs.writeFile(exports.allLinksFilePath, JSON.stringify(res), err => {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        })
    })
    .catch(error => {
      console.log(error);
    });
}

//formats string then be passed as parameter to searchResults,
//makes use of odemeter!
exports.searchResultsOdemeter = (query, prefix, minMiles, maxMiles) =>{
  return exports.searchResults(
    'https://'+prefix+
    '.craigslist.org/search/cto?query='+ query +
    '&min_auto_miles='+minMiles+
    '&max_auto_miles='+maxMiles+
    '&bundleDuplicates=1')
}
exports.resultsToFile = (res) =>{
  fs.writeFile(exports.resultsFilePath, JSON.stringify(res), err => {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

