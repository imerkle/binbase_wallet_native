// @flow
import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { View } from 'react-native';
import { Button, Title, Text, TextInput } from 'react-native-paper';

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
    }
    unlockWallet = async () => {
        await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_unlock)
        this.props.rootStore.appStore.setSnackMsg("Wallet unlocked!");
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
        } = this.state;

        return (
        <View>
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
                <Button 
                style={{marginVertical: 10, borderRadius: 5}}
                mode="contained"
                onPress={this.unlockWallet}>Send</Button>
            </View>                
            }        
            <View style={{flexDirection: "row"}}>
                <View style={{flex: 0.5}}>
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
                  {mnemonic_copy && 
                    <View>
                     <Title>Generated Mnemonic</Title>
                     <Text>Backup this 24 word mnemonic phrase carefully</Text>
                     <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Surface><Text>{mnemonic_copy}</Text></Surface>
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
                <View style={{flex: 0.5}}>
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
                  style={{marginVertical: 10, borderRadius: 5}}
                  mode="contained"
                  onPress={this.restoreWallet}>Restore Wallet</Button>
                </View>
            </View>
        </View>
            );
    }
}
export default Home;
