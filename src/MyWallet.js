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
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover'
};


class MyWallet extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasData: false,
      message: "",
      rows:[],
      columns: [],
      tokenIds: [],
      title: [],
      desc: [],
      price: [],
      publishDate: [],
      author: [],
      image: [],
      status:[],
      total: 0,
      user: '',
      balance: 0,
      contractInstance: '',
      networkId:'',
      networkType:'',
      sellTokenId: '',
      sellPrice:0,
      showModal: false
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.changeRecipient = this.changeRecipient.bind(this);
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
      status:[],
      total: 0
    });
  }
  componentDidMount = async () => {
    const web3 = await getWeb3();
    window.web3 = web3;
    const contractInstance = await getInstance(web3);
    window.user = (await web3.eth.getAccounts())[0];
    const balanceInWei = await web3.eth.getBalance(window.user);
    var balance = web3.utils.fromWei(balanceInWei, 'ether');
    const networkId = await web3.eth.net.getId();
    const networkType = await web3.eth.net.getNetworkType();
    this.setState({ user: window.user });
    this.setState({ balance: balance});
    this.setState({ contractInstance: contractInstance });
    this.setState({ networkId: networkId});
    this.setState({ networkType: networkType});
    await this.loadMyDigitalArts(web3);

  }
  async loadMyDigitalArts(web3) {
      try {
        let ids;
        const result = await this.state.contractInstance.methods.findMyArts().call();
        let _total = result.length;
        if(_total>0) {
          let row;
          if(_total<=3) {
            row = 1;
          } else {
            row = Math.ceil(_total/3);
          }
          let columns = 3;
          let rowArr = Array.apply(null, {length: row}).map(Number.call, Number);
          let colArr = Array.apply(null, {length: columns}).map(Number.call, Number);
          this.setState({ rows: rowArr, columns: colArr });
          let _tokenIds= [], _title =[],  _desc= [], _price= [], _publishDate= [],  _image =[], _author=[], _status=[];
          let idx =0;
          this.resetPendingArts();
          for(let i = 0; i<row; i++) {
            for(let j = 0; j < columns; j++) {
               if(idx<_total) {
                 let tokenId= result[idx];
                 const art = await this.state.contractInstance.methods.findArt(tokenId).call();
                 const priceInEther = web3.utils.fromWei(art[3], 'ether');
                 _tokenIds.push(art[0]);
                 _title.push(art[1]);
                 _desc.push(art[2]);
                 if(art[4]==1) {
                    _status.push("In selling");
                 } else {
                    _status.push("Publish");
                 }
                
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
            status: _status,
            image: _image,
            total: _total
          });
          this.setState({ hasData: true });
        } else {
          this.setState({ hasData: false });
        }
 
    } catch (e) {console.log('Error', e)}
  
  }
  changeHandler = event => {
    this.setState({
        [event.target.name]: event.target.value
        }, function(){ })
   };
   sellArt(tokenId) {
    try {
      //open  popup window
      this.setState({ sellTokenId: tokenId, showModal: true });
    } catch (e) {console.log('Error', e)}
  };

  async transferArt(tokenId){
    try {
       await this.state.contractInstance.methods.transfer(this.state.recipientAddress,tokenId).send({
          from: this.state.user, gas: 6000000
       })
      window.location.reload(); 
    } catch (e) {console.log('Error', e)}
  }
  changeRecipient(event){
    this.setState({
      recipientAddress:event.target.value
    })
  }

  async submitArtSell() {
    try {
      const priceInWei =  window.web3.utils.toWei(this.state.sellPrice, 'ether');
       await this.state.contractInstance.methods.resellArt(this.state.sellTokenId, priceInWei).send({
           from: this.state.user, gas: 6000000
       })
      window.location.reload(); 
    } catch (e) {console.log('Error', e)}
  };
  render() {
    if (this.state.hasData) {
      return (
        <div className="App" style={sectionStyle}>
          <AppNav></AppNav>
          <section className="text-center">
            <div className="row mb-3 mt-3">
                    <div className="col-md-2 mb-md-0 mb-1"></div>
                    <div className="col-md-8 mb-md-0 mb-1">
                        <div className="card">
                            <div className="card-body ">
                              <div className="row">
                                <div className="col-md-6 mb-md-0">
                                    <span className="font-weight-bold blue-grey-text">My Address:</span> {this.state.user}
                                </div>
                                <div className="col-md-6 mb-md-0">
                                <span className="font-weight-bold blue-grey-text">Balance:</span> {this.state.balance} $AVAX
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2 mb-md-0 mb-1"></div>
                </div>
            <h5 className="h1-responsive font-weight-bold text-center my-3" style={{color:"white"}}>My NFT collection</h5>
            <div className="container">
               {this.state.rows.map((row, i) =>
                <div className="row"  key={i}>
                  {this.state.columns.map((col, j) =>
                    <div style={{marginTop:"50px"}} className="col-lg-4 col-md-12 mb-lg-0 mb-0" key={j}>
                        { i*3+j < this.state.total &&
                            <div style={{background:"white",paddingBottom:"15px"}}>
                            <div className="view overlay rounded z-depth-2 mb-2">
                             <a href={"/#/art/"+this.state.tokenIds[i*3+j]}> <img className="img-fluid" src={this.state.image[i*3+j]} alt="Sample"/></a>
                            </div>
                            <h5 className="font-weight-bold mb-1 marginTopC">#{this.state.tokenIds[i*3+j]} - {this.state.title[i*3+j]}</h5>
                            <div className="dark-grey-text text20">{this.state.price[i*3+j]} $AVAX</div>
                            <p>by <span className="font-weight-bold">@{this.state.author[i*3+j]}</span></p>
                            {/*<p>by <span className="font-weight-bold">{this.state.author[i*3+j]}</span>, {this.state.publishDate[i*3+j]}</p>
                            
                        <p className="alert alert-primary dark-grey-text text20">{this.state.desc[i*3+j]}</p>*/}
                            { this.state.status[i*3+j]==='Publish' &&
                                <button className="btn btn-red btn-rounded btn-md" data-toggle="modal" onClick={e => (e.preventDefault(),this.sellArt(this.state.tokenIds[i*3+j]))} data-target=".sell-modal" >{this.state.status[i*3+j]}</button>
                            }
                              <button className="btn btn-red btn-rounded btn-md" onClick={e => (e.preventDefault(),this.transferArt(this.state.tokenIds[i*3+j]))} data-target=".sell-modal" >Transfer NFT</button>
                              <input onChange={this.changeRecipient} placeholder="Recipient address" />
                        </div>
                        }
                    </div>

                  )}
                </div>
              )}
              </div>
              <div className={`modal fade sell-modal ${this.props.showModal ? 'show' : ''}`} id="submitModal" tabIndex="-1" role="dialog" aria-labelledby="submitModalLabel"  aria-hidden="true">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="myLabel">Sell NFT: choose the price in $AVAX</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div className="modal-body">
                          <input className="form-control mb-4" id="sellPrice" name="sellPrice"  type="text" placeholder="Price $AVAX"  onChange={this.changeHandler}  value={this.state.sellPrice}/>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={e => (e.preventDefault(),this.submitArtSell())}>Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
          </section>
        </div>
      );
    } else {
      return (
        <div className="App" style={sectionStyle}>
          <AppNav></AppNav>
          <section className="text-center">
          <div className="row mb-3 mt-3">
                <div className="col-md-2 mb-md-0 mb-1"></div>
                    <div className="col-md-8 mb-md-0 mb-1">
                        <div className="card">
                            <div className="card-body ">
                              <div className="row">
                                <div className="col-md-6 mb-md-0">
                                    <span className="font-weight-bold blue-grey-text">My Address:</span> {this.state.user}
                                </div>
                                <div className="col-md-6 mb-md-0">
                                <span className="font-weight-bold blue-grey-text">Balance:</span> {this.state.balance} $AVAX
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2 mb-md-0 mb-1">
                     
                    </div>
                </div>

          </section>
        </div>
      );
    }

  }
}

export default MyWallet;
