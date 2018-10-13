const NZOCrowdsale = artifacts.require('./NZOCrowdsale.sol');

module.exports = (deployer) => {
    //http://www.onlineconversion.com/unix_time.htm
    var owner =  "0x3b8F30afD95065958200e081d9eaB543A73800B8";

    deployer.deploy(NZOCrowdsale, owner);
};