const CONSTANTS = require('../constants.json');
const utils = require('../utils.js');
const bidfactory = require('../bidfactory.js');
const bidmanager = require('../bidmanager.js');
const adloader = require('../adloader');

const Scarlet = function Scarlet() {
  const endpoint = '//scarlet.chi.as/pb';

  function _callBids(request) {
    let bids = request.bids || [];
    bids.forEach(function(bid) {
      let parameters = {
        placement_id: bid.params.placementId,
        cb: '$$PREBID_GLOBAL$$.scarletCallback',
        cb_id: bid.bidId,
        sizes: bid.sizes.map(function(size) {
          return `${size[0]}x${size[1]}`;
        }).join(','),
        referrer: utils.getTopWindowUrl(),
        url: utils.getTopWindowLocation(),
        ua: window.navigator.userAgent
      };
      let queryParams = _stringify(parameters);
      adloader.loadScript(`${endpoint}?${queryParams}`);
    });
  }

  function _stringify(parameters) {
    return Object.keys(parameters).map(function(key) {
      return `${key}=${encodeURIComponent(parameters[key])}`;
    }).join('&');
  }

  $$PREBID_GLOBAL$$.scarletCallback = function(bidResponse) {
    if (bidResponse && bidResponse.cb_id) {
      let bidRequest = utils.getBidRequest(bidResponse.cb_id);
      delete bidResponse.cb_id;
      let bid = bidfactory.createBid(CONSTANTS.STATUS.GOOD, bidRequest);
      bid.bidderCode = bidRequest.bidder;
      Object.assign(bid, bidResponse)
      bidmanager.addBidResponse(bidRequest.placementCode, bid);
    } else {
      utils.logMessage('No prebid response for placement %%PLACEMENT%%');
    }
  };

  return {
    callBids: _callBids
  };
};

module.exports = Scarlet;
