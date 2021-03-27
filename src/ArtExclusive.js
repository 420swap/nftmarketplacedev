import React from 'react';
import './App.css';
import AppNav from "./AppNav";
import { getWeb3, getInstance}  from "./Web3Util";
import backgroundImg from './bg.png';


var sectionStyle = {
  width: "100vw",
  minHeight:"110vh",
  paddingBottom:"150px",
  backgroundImage: `url(${backgroundImg})`,
  backgroundSize: 'cover',

    backgroundAttachment: 'fixed'
};

class ArtExclusive extends React.Component {

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
      user:''
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
        let ids;
        const result = await this.state.contractInstance.methods.findAllPendingArt().call();
        ids = result[0];
        let newIds = [];

        for(let counter =0;counter<ids.length;++counter){
          if(ids[counter] == "1"
            || ids[counter] == "2"){
            newIds[newIds.length]=ids[counter];
          }
        }

        let _total = newIds.length;
        if(newIds && _total>0) {
          let row;
          if(_total<=3) {
            row = 1;
          } else {
            row = Math.ceil(_total/3);
          }
          let columns = 3;
          this.setState({ rows: [], columns: [] });
          let rowArr = Array.apply(null, {length: row}).map(Number.call, Number);
          let colArr = Array.apply(null, {length: columns}).map(Number.call, Number);
          this.setState({ rows: rowArr, columns: colArr });
          let _tokenIds= [], _title =[],  _desc= [], _price= [], _publishDate= [],  _image =[], _author=[];
          let idx =0;
          this.resetPendingArts();
          for(let i = 0; i<row; i++) {
            for(let j = 0; j < columns; j++) {
               if(idx<_total) {
                 let tokenId= newIds[idx];
                 const art = await this.state.contractInstance.methods.findArt(tokenId).call();
                 const priceInEther = web3.utils.fromWei(art[3], 'ether');
                 _tokenIds.push(art[0]);
                 _title.push(art[1]);
                 _desc.push(art[2]);
                 _price.push(priceInEther);
                 _publishDate.push(art[5]);
                 _image.push(art[9]);
                 _author.push(art[6]);
               }
              idx++;
            }
        }
         
          this.setState({ 
            tokenIds: _tokenIds,
            title: _title,
            desc: _desc,
            price: _price,
            publishDate: _publishDate,
            author: _author,
            image: _image,
            total: _total
          });
          this.setState({ hasData: true });
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
      let style = {background:"white",boxShadow:"0px 0px 10px 9px #ffdf00",paddingBottom:"15px"}
      return (
        <div className="App" style={sectionStyle}>
          <AppNav ></AppNav>
          <section className="text-center">

          <div style={{color:"white",textOverflow:"visible"}}className="h1-responsive font-weight-bold text-center my-5">
              Exclusive first gen NFT's on 420Swap
            </div>
       
            <div className="container">
               {this.state.rows.map((row, i) =>
                <div className="row"  key={i}>
                  {this.state.columns.map((col, j) =>
                    <div className="col-lg-12 col-md-12 mb-lg-0 mb-0"  style={{marginTop:"50px"}} key={j}>
                        { i*3+j < this.state.total &&
                            <div style={style}>
                            <div className="view overlay rounded z-depth-2 mb-2">
                             <a target="_blank" href={"/#/art/"+this.state.tokenIds[i*3+j]} > <img className="img-fluid" src={this.state.image[i*3+j]} alt="Sample"/></a>
                            </div>
                            <h5 className="font-weight-bold mb-1 marginTopC">#{this.state.tokenIds[i*3+j]} - {this.state.title[i*3+j]}</h5>
                            <div className="dark-grey-text text20"> {this.state.price[i*3+j]} $AVAX</div>
                             {/** <p style={{whiteSpace: 'nowrap',overflow: 'hidden',textOverflow:'ellipsis'}}>by <span className="font-weight-bold">{this.state.author[i*3+j]}</span>, {this.state.publishDate[i*3+j]}</p>
                            
                        <p className="alert alert-primary dark-grey-text text20">{this.state.desc[i*3+j]}</p>*/}
                            <button className="btn btn-red btn-rounded btn-md" onClick={e => (e.preventDefault(),this.buyArt(this.state.tokenIds[i*3+j], this.state.price[i*3+j]))}>Collect NFT</button>
                        </div>
                        }
                    </div>

                  )}
                </div>
              )}
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
              <p ><a className="customA" href="https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask" target="_blank">How to change metamask Network to Avax C-Chain Mainnet?</a></p>
              <p ><a className="customA" href="https://docs.avax.network/build/tutorials/platform/transfer-avax-between-x-chain-and-c-chain" target="_blank">Need help transferring $AVAX to c-chain?</a></p>
              
              </div>
          </section>
        </div>
      );
    }

  }
}

export default ArtExclusive;
