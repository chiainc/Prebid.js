import { expect } from 'chai';
import CONSTANTS from 'src/constants.json';
import Adapter from 'src/adapters/scarlet';
import bidManager from 'src/bidmanager';
import adLoader from 'src/adloader';

describe('Scarlet Adapter', () => {
  let sandbox;

  const REQUEST = {
    'bidderCode': 'scarlet',
    'requestId': '7eb7b145-82ce-4780-a845-59441c514d61',
    'bidderRequestId': '12f54c7ee1cbd28',
    'bids': [
      {
        'bidder': 'scarlet',
        'params': {
          'placementId': '100'
        },
        'placementCode': 'div-gpt-ad-1497458649085-0',
        'sizes': [
          [300, 250],
          [728, 90],
        ],
        'bidId': '24b1799c9814668',
        'bidderRequestId': '1de4f552dda1f48',
        'requestId': '7eb7b145-82ce-4780-a845-59441c514d61'
      }
    ],
    'start': 1499152017227
  };

  const RESPONSE = {
    cb_id: '24b1799c9814668',
    cpm: 0.01,
    width: 300,
    height: 250,
    ad: '<div>Ad markup</div>'
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(bidManager, 'addBidResponse');
    sandbox.stub(adLoader, 'loadScript');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('scarlet callBids', () => {
    let adapter;

    beforeEach(() => {
      adapter = new Adapter();
    });

    it('with valid request', () => {
      adapter.callBids(REQUEST);
      expect(adLoader.loadScript.getCall(0).args[0]).to.contain('placement_id=100');
      expect(adLoader.loadScript.getCall(0).args[0]).to.contain('sizes=300x250%2C728x90');
    });

    it('with empty bids', () => {
      adapter.callBids({});
      expect(adLoader.loadScript.called).to.equal(false);
    });
  });

  describe('scarlet bidResponse', () => {
    beforeEach(() => {
      $$PREBID_GLOBAL$$._bidsRequested.push(REQUEST);
    });

    it('with success', () => {
      $$PREBID_GLOBAL$$.scarletCallback(RESPONSE);
      expect(bidManager.addBidResponse.getCall(0).args[0]).to.equal('div-gpt-ad-1497458649085-0');

      let bid = bidManager.addBidResponse.getCall(0).args[1];
      expect(bid.bidderCode).to.equal('scarlet');
      expect(bid.cpm).to.equal(0.01);
      expect(bid.width).to.equal(300);
      expect(bid.height).to.equal(250);
      expect(bid.ad).to.equal('<div>Ad markup</div>');
    });
  });
});
