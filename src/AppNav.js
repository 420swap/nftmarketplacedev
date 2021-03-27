import React from "react";
import { withRouter,Link} from 'react-router-dom';
import "./App.css";
import { getWeb3, getInstance}  from "./Web3Util";

class AppNav extends React.Component {
    constructor(props) {
      super(props);
      this.handleNavClick = this.handleNavClick.bind(this);
      this.state = { 
            name: '',
            symbol: ''
        };
    }
    handleNavClick = param => e => {
      e.preventDefault();
      this.props.history.push('/'+param)
    };
    componentDidMount = async () => {

      const web3 = await getWeb3();
      const contractInstance = await getInstance(web3);
      window.user = (await web3.eth.getAccounts())[0];
      const symbol = await contractInstance.methods.symbol().call()

      this.setState({ symbol: symbol });
            const name = await contractInstance.methods.name().call();

      this.setState({ name: name });
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark stylish-color">
        <div className="navbar-brand">  
            <a id="logo" className="navbar-item text-white" href="/">  
                420Swap {/*<span className="hideOnMobile">- NFT Marketplace on Avalanche Mainnet</span>*/} 
            </a>   
        </div> 
      <form className="form-inline  my-2 my-lg-0 ml-auto" style={{marginRight:"15px"}}>
        <a  className="btn btn-outline-white btn-md my-2 my-sm-0 ml-3"  href="/">Art Gallery</a> 
        <a className="btn btn-outline-white btn-md my-2 my-sm-0 ml-3"   href= "/#/exclusive">Exclusive NFT's</a> 
        
        <a className="btn btn-outline-white btn-md my-2 my-sm-0 ml-3"  href= "/#/publishArt">Create your NFT</a> 
        <a className="btn btn-outline-white btn-md my-2 my-sm-0 ml-3"   href= "/#/sold">Rare NFT's</a> 
        <a className="btn btn-outline-white btn-md my-2 my-sm-0 ml-3"   href= "/#/myWallet">My NFTs</a> 
        </form>
      </nav>
    );
  }
}
export default withRouter(AppNav);
