// @flow
import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Vibration, TouchableOpacity, ScrollView, View, Clipboard } from 'react-native';
import { Divider, Checkbox, Surface, Button, IconButton, Title, Text, TextInput } from 'react-native-paper';
import FingerprintScanner from 'react-native-fingerprint-scanner';

const textInputColors = {background: "#303030", primary: "#FFF", placeholder: "#4D4D4D", disabled: "gray"};

@inject('rootStore')
@observer
class Home extends React.Component<any, any>{
    state = {
        passphrase: "",
        mnemonic_copy: "",
        mnemonic_paste: "",
        passphrase_paste: "",
        passphrase_unlock: "",
        useFingerprint: false,
        unlock_loading: false,
    }    
    componentDidMount() {
      const { coinStore } = this.props.rootStore;
      if(FingerprintScanner.isSensorAvailable() && !coinStore.isUnlocked){
        this.unlockFingerPrint();
      }
    }
    componentWillUnmount() {
      FingerprintScanner.release();
    } 
    unlockFingerPrint = async () => {
      const { appStore, configStore, coinStore } = this.props.rootStore;
      const useFingerprint = await configStore.getKey("useFingerprint");
      if(useFingerprint){      
        const passphrase_unlock = await configStore.getKey("passphraseunlock");
        try{  
          await FingerprintScanner.authenticate({ onAttempt: (e)=>{ } })
          await this.unlockWalletInternal(passphrase_unlock)
        }catch(e){
          Vibration.vibrate()
          appStore.setSnackMsg("Fingerprint Failed!");
          //unlockFingerPrint();
        }
      }
    } 
    unlockWalletInternal = async (passphrase_unlock) => {
        const { appStore, configStore, coinStore } = this.props.rootStore;
        this.setState({unlock_loading: true})
        Vibration.vibrate()
        await coinStore.generateKeys(false, passphrase_unlock)
        appStore.setSnackMsg("Wallet unlocked!")
        this.setState({unlock_loading: false})
    }
    unlockWallet = async () => {
        const { appStore, configStore, coinStore } = this.props.rootStore;
        await this.unlockWalletInternal(this.state.passphrase_unlock)
        configStore.setKey("useFingerprint", this.state.useFingerprint)
        if(this.state.useFingerprint){
          configStore.setKey("passphraseunlock", this.state.passphrase_unlock)
        }
    }
    generateNewWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(true, this.state.passphrase);
        this.props.rootStore.appStore.setSnackMsg("New Wallet Generated!");
        this.setState({mnemonic_copy: mnemonic})
    }
    restoreWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_paste, this.state.mnemonic_paste);
        this.props.rootStore.appStore.setSnackMsg("Wallet restored!");
    }
    render() {
        const {appStore, coinStore} = this.props.rootStore;
        const { 
          passphrase,
          mnemonic_copy,
          mnemonic_paste,
          passphrase_paste,
          passphrase_unlock,
          useFingerprint,
          unlock_loading,
        } = this.state;

        return (
        <ScrollView style={{margin: 20}}>        
           {!coinStore.isUnlocked &&    
            <View>
              <Title>Unlock Wallet</Title>
              <TextInput
                mode="outlined"
                theme={{colors: textInputColors}}
                value={passphrase_unlock}
                label={`Your Passphrase`}
                onChangeText={(text)=>{
                    this.setState({passphrase_unlock: text })
                }}
                />
                <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={() => { this.setState({ useFingerprint: !useFingerprint }) }}>
                  <Checkbox status={useFingerprint ? 'checked' : 'unchecked'} />
                  <Text>Use fingerprint to unlock wallet</Text>
                </TouchableOpacity>
                <Button 
                style={{backgroundColor: "#E10050", marginVertical: 10, borderRadius: 5}}
                mode="contained"
                loading={unlock_loading}
                onPress={this.unlockWallet}>Unlock Wallet</Button>
                <Divider style={{backgroundColor: "rgba(255,255,255,.2)", marginVertical: 25, marginHorizontal: 40}} />
            </View>                
            }        
            <View>
                <View>
                  <Title>Generate New Wallet</Title>
                  <TextInput
                    mode="outlined"
                    theme={{colors: textInputColors}}
                    value={passphrase}
                    label={`New Passphrase`}
                    onChangeText={(text)=>{
                        this.setState({passphrase: text })
                    }}
                  />
                  {!!mnemonic_copy && 
                    <View>
                     <Title>Generated Mnemonic</Title>
                     <Text>Backup this 24 word mnemonic phrase carefully</Text>
                     <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Surface style={{flex: .99, padding: 20, backgroundColor: "rgba(0,0,0,.5)"}}><Text>{mnemonic_copy}</Text></Surface>
                        <IconButton 
                          icon="content-copy"
                          onPress={()=>{
                            Clipboard.setString(mnemonic_copy);
                            appStore.setSnackMsg("Mnemonic phrase copied to clipboard");
                        }} />
                      </View>
                    </View>
                  }
                  <Button 
                  style={{marginVertical: 10, borderRadius: 5}}
                  mode="contained"
                  onPress={this.generateNewWallet}>Generate New Wallet</Button>
                </View>
                <View>
                  <Title>Restore Wallet</Title>
                  <TextInput
                    mode="outlined"
                    theme={{colors: textInputColors}}
                    value={mnemonic_paste}
                    label={`Write your mnemonic phrase`}
                    onChangeText={(text)=>{
                        this.setState({mnemonic_paste: text })
                    }}
                    multiline
                  />
                  <TextInput
                    mode="outlined"
                    theme={{colors: textInputColors}}
                    value={passphrase_paste}
                    onChangeText={(text)=>{
                        this.setState({passphrase_paste: text })
                    }}                    
                    label={`Your Passphrase`}
                  />
                  <Button 
                  style={{backgroundColor: "#E10050", marginVertical: 10, borderRadius: 5}}
                  mode="contained"
                  onPress={this.restoreWallet}>Restore Wallet</Button>
                </View>
            </View>
        </ScrollView>
            );
    }
}
export default Home;
