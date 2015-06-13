var expect = require('chai').expect;

describe('Truthy', function() {
  it('should be very truthy', function() {
    var notFalse = true;
    expect(notFalse).to.equal(true);
  });
});
