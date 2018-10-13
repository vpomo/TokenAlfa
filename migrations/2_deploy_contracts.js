const AFACrowdsale = artifacts.require('./AFACrowdsale.sol');

module.exports = (deployer) => {
    //http://www.onlineconversion.com/unix_time.htm
    var owner =  "0x3b8F30afD95065958200e081d9eaB543A73800B8";
    var wallet = "0x3ded37aa55B69A78323899bE2BF640Eb8c5f377a";

    deployer.deploy(AFACrowdsale, owner, wallet);
};