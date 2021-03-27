import React from 'react';
import './App.css';
import AppNav from "./AppNav";
import { getWeb3, getInstance}  from "./Web3Util";
import backgroundImg from './bg.png';

var sectionStyle = {
  width: "100vw",
  paddingBottom:"150px",
  backgroundImage: `url(${backgroundImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover'
};

class ArtDetail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasData: false,
      message: "",
      rows:[],
      columns: [],
      user: '',
      tokenIds: [],
      title: [],
      desc: [],
      price: [],
      publishDate: [],
      author: [],
      image: [],
      total: 0,
      contractInstance: '',
      user:'',
      selectedId:props.match.params.selectedId,
      art:null,
      priceInEther:0,
      owner:''
    };
    this.buyArt = this.buyArt.bind(this);
  }
  resetPendingArts() {
    this.setState({ 
      tokenIds: [],
      title: [],
      desc: [],
      price: [],
      publishDate: [],
      author: [],
      image: [],
      total: 0
    });
  }
  componentDidMount = async () => {
    const web3 = await getWeb3();
    window.web3 = web3;
    const contractInstance = await getInstance(web3);
    window.user = (await web3.eth.getAccounts())[0];
    this.setState({ user: window.user });
    this.setState({ contractInstance: contractInstance });
    await this.loadDigitalArts(web3);

  }
  async loadDigitalArts(web3) {
      try {
        const art = await this.state.contractInstance.methods.findArt(this.state.selectedId).call();
        const owner = await this.state.contractInstance.methods.ownerOf(this.state.selectedId).call();

        if(art != null){
          let avaxPrice =  web3.utils.fromWei(art[3], 'ether')
          this.setState({ hasData: true,art,avaxPrice,owner});
        } else {
          this.setState({ hasData: false });
        }
 
    } catch (e) {console.log('Error', e)}
  
  }
  async buyArt(tokenId, priceInEther) {
    try {
      const priceInWei =  window.web3.utils.toWei(priceInEther, 'ether');
      await this.state.contractInstance.methods.buyArt(tokenId).send({
          from: this.state.user, gas: 3000000, value: priceInWei
      })
      window.location.reload(); 
    } catch (e) {console.log('Error', e)}
  };

  render() {
    if (this.state.hasData) {
      let style = {background:"white",paddingBottom:"15px"}
      if(this.state.art[0] =="1"||
      this.state.art[0] =="2"||
      this.state.art[0] =="3"){
        style = {background:"white",boxShadow:"0px 0px 10px 9px #ffdf00",paddingBottom:"15px"}
      }
      return (
        <div className="App" style={sectionStyle}>
          <AppNav></AppNav>
          <section className="text-center">

       
            <div className="container">
                <div className="row" style={{marginTop:"50px"}}  >
                <div className="col-lg-4 col-md-12 mb-lg-0 mb-0"></div>
                    <div className="col-lg-4 col-md-12 mb-lg-0 mb-0">
                            <div style={style}>
                            <div className="view overlay rounded z-depth-2 mb-2">
                              <img className="img-fluid" src={this.state.art[9]} alt="Sample"/>
                            </div>
                            <h5 className="font-weight-bold mb-1 marginTopC">#{this.state.art[0]} - {this.state.art[1]}</h5>
                            <div className="dark-grey-text text20"> {this.state.avaxPrice} $AVAX</div>
                            <p style={{whiteSpace: 'nowrap',overflow: 'hidden',textOverflow:'ellipsis'}}>by <span className="font-weight-bold">@{this.state.art[6]}</span></p>
                            {/*<p style={{whiteSpace: 'nowrap',overflow: 'hidden',textOverflow:'ellipsis'}}>by <span className="font-weight-bold">{this.state.art[6]}</span>, {this.state.art[5]}</p>
                            
                            <p className="alert alert-primary dark-grey-text text20">{this.state.art[2]}</p>*/}
                            {this.state.art["status"]!=0 ?
                              <button className="btn btn-red btn-rounded btn-md" onClick={e => (e.preventDefault(),this.buyArt(this.state.art[0], this.state.avaxPrice))}>Collect NFT</button>
                            : <p style={{height:"20px"}}></p>}
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-12 mb-lg-0 mb-0"></div>
                </div>
              </div>
              <div style={{color:"white"}}className="h1-responsive  font-weight-bold text-center my-5">
              Creator:<br/><span className="detail">{this.state.art[7]}</span><br/>
              Current owner:<br/><span className="detail"> {this.state.owner}</span><br/>
            </div>
          </section>
        </div>
      );
    } else {
      return (
        <div className="App" style={sectionStyle}>
          <AppNav></AppNav>
          <section className="text-center">

            <div  style={{color:"white"}} className="h1-responsive normal font-weight-bold text-center my-5">
              Trade Digital Art on 420Swap
            </div>
            <p  style={{color:"white"}}  className="h1-responsive normal font-weight-bold text-center my-5">
            All the artworks on 420Swap are on the blockchain
            </p>
        
       
            
            <div className="container">
              <div className="alert alert-primary" role="alert">
                You need metamask installed and configured on Avalanche c-chain to use this site! Learn how to do it by checking the links below. 
              </div>
              <p ><a className="customA"href="https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask" target="_blank">How to change metamask Network to Avax C-Chain Mainnet?</a></p>
              <p ><a className="customA" href="https://docs.avax.network/build/tutorials/platform/transfer-avax-between-x-chain-and-c-chain" target="_blank">Need help transferring $AVAX to c-chain?</a></p>
              
              </div>
          </section>
        </div>
      );
    }

  }
}

export default ArtDetail;
