import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { Snackbar, Button, Text, TextInput, IconButton, } from 'react-native-paper';
import { Dimensions, ScrollView, Linking, TouchableOpacity, Modal, View, StyleSheet, Clipboard } from 'react-native';
import { 
  getAtomicValue,
  getConfig,
  isValidAddress,
  numberWithCommas,
  smartTrim,
  MAX_DECIMAL,
  MAX_DECIMAL_FIAT
} from 'app/constants';
import FeeBox from './FeeBox';
import QR from './QR';
import QRG from './QRG';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import formatDistance from 'date-fns/formatDistance';

const styles = StyleSheet.create({
	uppercase: {
	},
	balance: {
    	fontWeight: "bold",
    	fontSize: 24,
	},
	pending: {
	    fontSize: 12,
	    opacity: .5,
	    fontStyle: "italic",
	    paddingHorizontal: 5,
	    fontWeight: "normal",
	},
	tx_header: {
	    paddingVertical: 2,
	    paddingHorizontal: 8,
	    fontSize: 10,
	    backgroundColor: '#201e1e',
	    margin: 4,
	    borderRadius: 4,
		shadowOffset:{  width: 5,  height: 3  },
		elevation: 7,
		shadowColor: '#1b1a1a',
		shadowOpacity: 1.0,
	    borderWidth: 1,
	    borderStyle: "solid",
   		borderColor: '#4D4D4D',	
		opacity: 1,
	    color: "#FFF",
   	},
	tx_box: {
    	backgroundColor: "rgba(0,0,0,.1)",
    	borderRadius: 4,
		  shadowOffset:{  width: 5,  height: 3 },
		  elevation: 10,
		  shadowColor: '#141111',
		  shadowOpacity: 1.0,
    	borderWidth: 1,
    	borderStyle: "solid",
    	borderColor: "#3e3e3e",
    	marginVertical: 20,
    	marginHorizontal: 0,
    	padding: 20,
    	zIndex: 1,
	},
  tx_pending: {
    opacity: .5,
    fontStyle: "italic",    
  },
  got:{
      borderRadius: 4,
      padding: 4,
      backgroundColor: "#23ff23",
  },
  sent:{
      borderRadius: 4,
      padding: 4,
      backgroundColor: "#fc1888",
  },
  tx_box_text: {
     fontSize: 11,
     marginVertical: 3,
  }
});
const textInputColors = {background: "#303030", primary: "#FFF", placeholder: "#4D4D4D", disabled: "gray"};

@inject('rootStore')
@observer
class Exchange extends React.Component<any, any>{
  componentDidMount(){
    this.init()
  }
  init = () => {
    const { exchangeStore } = this.props.rootStore;
    const { navigation } = this.props;
    const base = navigation.getParam('base', '');
    const rel = navigation.getParam('rel', '');
    exchangeStore.setBase(base);
    exchangeStore.setRel(rel);
    if(base && rel){
    	exchangeStore.init();
    }

  }

  state = {
    addressField: "",
    amountField: "",
    addressError: false,
    qrscan_visible: false,
    qrshow_visible: false,
    isSending: false,
  }

  render(){
    const { classes } = this.props;
    const { configStore, exchangeStore, coinStore, priceStore, appStore } = this.props.rootStore;
    const { address, txs } = exchangeStore;
    const { isSending, addressField, amountField, addressError } = this.state;
    const { rel, base } = exchangeStore;
    const config = toJS(configStore.config);
    if(!rel || !base || Object.keys(config).length == 0 ){
      return (null)
    }
    const balance = coinStore.balances[rel] || {balance: 0, pending: 0};
    const balance_usd = priceStore.getFiatPrice(rel) * balance.balance;
    const { explorer } = getConfig(config, rel, base);

    return (
      <View style={{flex: 1, padding: 10}}>
      <ScrollView style={{zIndex: 1, flex: 1}}>
        <View style={{zIndex: 1, flexDirection: "row", justifyContent: "space-between"}}>
          <View>
            <Text style={styles.uppercase}>{`${rel} Balance`.toUpperCase()}{} </Text>
            <View>
              <Text style={styles.balance}>{balance.balance.toFixed(MAX_DECIMAL)}</Text>
              <Text style={styles.pending}>{balance.pending > 0 ? `(${+balance.pending.toFixed(MAX_DECIMAL)} pending)` : ""}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.uppercase}>{`${priceStore.fiat.name} Value`.toUpperCase()}</Text>
            <Text style={styles.balance}>{priceStore.fiat.symbol}{numberWithCommas(+balance_usd.toFixed(MAX_DECIMAL_FIAT))}</Text>
          </View>
        </View>
       <View style={{zIndex: 1,flexDirection: "row", alignItems: "center"}}>
     	  <TextInput
        	label={`Your ${rel} Address`}
        	value={smartTrim(address, 25)}
        	mode="outlined"
        	theme={{colors: textInputColors}}
        	disabled
            style={{flex: 0.99}}
      		/>
          <IconButton 
            icon="content-copy"
          	onPress={()=>{
          	  Clipboard.setString(address);
              appStore.setSnackMsg("Address copied to clipboard");
          }} />
          <IconButton 
            icon={({ size, color }) => (
				    <Icon name="qrcode" size={size} color={color} />
				  )}
          	onPress={()=>{
          		this.setState({qrshow_visible: true});
          }} />          
        </View>

        <View style={styles.tx_box}>
          <View style={styles.tx_header}><Text>Send Transaction</Text></View>
          <View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
            <TextInput
              mode="outlined"
        	    theme={{colors: textInputColors}}
              error={!!addressError}
              value={addressField}
              label={addressError ? `Invalid ${rel} address` : `Recieving Address`}
              onChangeText={(text)=>{ 
                  let _addressError = false;
                if (!isValidAddress(config, text, rel, base)){
                    _addressError = true;
                  }
                  this.setState({addressField: text, addressError: _addressError })
              }}
              style={{flex: 0.99}}
              />
		      <IconButton 
		      	onPress={()=>{this.setState({qrscan_visible: true })}}
				icon={({ size, color }) => (
				    <Icon name="qrcode-scan" size={size} color={color} />
				  )} />
		    </View>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <TextInput
              	mode="outlined"
        	  	  theme={{colors: textInputColors}}
                value={amountField.toString()}
                onChangeText={(text)=>{ this.setState({amountField: text }) }}
                label={`${rel} Amount to Send`}
                style={{flex: 0.99}}
                />             
			  <IconButton
			    icon="call-made"
			    onPress={() => this.setState({ amountField: balance.balance - (exchangeStore.fees / getAtomicValue(config, rel, base)) }) }
			  />
            </View>
          </View>
          <FeeBox />
          <Button 
          style={{marginVertical: 10, borderRadius: 5}}
          mode="contained"
          disabled={!!addressError || isSending} 
          onPress={this.send}>Send</Button>
        </View>

        {txs.length > 0 &&
          <View style={styles.tx_box}>
          <View>
            <View style={{flexDirection: "row"}}>
            <Text style={[{flex: .3},styles.tx_header]}>TxHash</Text>
            <Text style={[{flex: .2},styles.tx_header]} >Age</Text>
            <Text style={{flex: .1}} ></Text>
            <Text style={[{flex: .25},styles.tx_header]} >Value</Text>
            <Text style={[{flex: .15},styles.tx_header]} >TxFee</Text>
            </View>
          {txs.map((o,i)=>{ 
            return (
            <TouchableOpacity key={i} style={[{flexDirection: "row", paddingHorizontal: 8}, o.confirmations == 0 && styles.tx_pending]} onPress={()=>{
                Linking.openURL(`${explorer}/tx/${o.hash}`)
               }}>
                <Text style={[styles.tx_box_text, {flex: .3}]}>{smartTrim(o.hash, 10)}</Text>
                <Text style={[styles.tx_box_text, {flex: .2}]}>{o.confirmations == 0 || o.timestamp == null ? (null) : 
                  formatDistance(new Date(o.timestamp*1000), new Date(), { addSuffix: true })
                  //moment.unix(o.timestamp).fromNow()
                }</Text>
                <View style={{flex: .1, alignItems: "center"}}>
                  <Text style={[styles.tx_box_text, o.kind == "got" && styles.got, o.kind == "sent" && styles.sent]}>{o.kind == "got" ? "IN": "OUT" }</Text>
                </View>
                <Text style={[styles.tx_box_text, {flex: .25}]} >{+o.value.toFixed(MAX_DECIMAL)} {o.asset ? o.asset.ticker : rel}</Text>
                <Text style={[styles.tx_box_text, {flex: .1}]}>{o.fee}</Text>
            </TouchableOpacity>
            )
          })}
            <TouchableOpacity onPress={()=>{ Linking.openURL(`${explorer}/address/${exchangeStore.address}`) }}><Text style={{fontWeight: "bold", textDecorationLine: "underline"}}>View all Transactions</Text></TouchableOpacity>
          </View>
         </View>
        }        

        <QR toptext={`Scan QR Code`} visible={this.state.qrscan_visible} onRequestClose={()=>{this.setState({qrscan_visible: false })}} onSuccess={(e)=>{ this.setState({addressField: e.data, qrscan_visible: false}) }} />
        <QRG text={address} visible={this.state.qrshow_visible} onRequestClose={()=>{this.setState({qrshow_visible: false })}} />

      </ScrollView>
      <Snackbar style={{zIndex: 10, backgroundColor: "#000"}} onDismiss={() => {appStore.snackOpen(false)}} visible={appStore.snackopen} >{appStore.snackmsg}</Snackbar>
      </View>
    	)    
  }
  send = async () => {
    const { configStore, coinStore, exchangeStore, appStore} = this.props.rootStore;
    const { rel, base } = exchangeStore;
    const { addressError, addressField, amountField } = this.state;
    const config = toJS(configStore.config);

    const balance = coinStore.balances[rel];
      try{
        const amt = parseFloat(amountField);
        let fees = exchangeStore.fees / getAtomicValue(config, rel, base);
          
        if(addressError || !addressField){
          appStore.setSnackMsg("Invalid Address");
          throw "Invalid Address";
        }
        if(isNaN(amt)){
          appStore.setSnackMsg("Invalid Amount");
          throw new Error("Invalid Amount");
        }
        if (balance.balance < amt){
          appStore.setSnackMsg("Not enough balance");
          throw new Error("Not enough balance");
        }
        if (balance.balance < fees + amt){
          appStore.setSnackMsg("Not enough balance to cover network fees");
          throw new Error("Not enough balance to cover network fees");
        }
        appStore.setSnackMsg("Transaction is being broadcasted!");
        this.setState({
          isSending: true,
        });            
        const {txid} = await exchangeStore.send(addressField, amt)
        appStore.setSnackMsg(`Transaction broadcast completed. tx: ${txid}`);
        this.setState({
          addressField: "",
          amountField: "",
          isSending: false,
        });
      }catch(e){
        this.setState({
          isSending: false,
        });
        appStore.setSnackMsg("Transaction Failed to broadcast!");
        throw e;
      }
        //exchangeStore.syncBalance(false)
    }  
}
export default Exchange;