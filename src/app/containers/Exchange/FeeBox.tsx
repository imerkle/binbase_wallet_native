import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';

import { Button, Text, TextInput, IconButton, } from 'react-native-paper';
import { View, StyleSheet, Clipboard } from 'react-native';

const textInputColors = {background: "#303030", primary: "#FFF", placeholder: "#4D4D4D", disabled: "gray"};

@inject('rootStore')
@observer
class FeeBox extends React.Component<any, any>{

    render(){
        const { exchangeStore, configStore } = this.props.rootStore;
        const { rel, base } = exchangeStore;
        const config = toJS(configStore.config);
        if(!base || !rel){ return (null)}
        
        const fee_label = config[base].fee_label;
        let showFees = true;
        let dualFees = false;

        if ((config[rel] && config[rel].hasOwnProperty("noFee")) || config[base].hasOwnProperty("noFee")){
            showFees = false
        }
        if ((config[rel] && config[rel].hasOwnProperty("dualFee")) || config[base].hasOwnProperty("dualFee") ) {
            dualFees = true
        }
                
        return (
            <View>
                {
                    showFees && dualFees &&
                    <View style={{flexDirection: "row"}}>
                        <TextInput
                            style={{flex: 0.5}}
                            mode="outlined"
                            theme={{colors: textInputColors}}
                            value={exchangeStore.gasLimit.toString()}
                            onChangeText={(text) => { exchangeStore.setFees(text, 1) }}
                            label={`Gas Limit (in ${fee_label})`} 
                            />

                        <TextInput
                            style={{flex: 0.5}}
                            mode="outlined"
                            theme={{colors: textInputColors}}
                            value={exchangeStore.gasPrice.toString()}
                            onChangeText={(text) => { exchangeStore.setFees(text, 2) }}
                            label={`Gas Price (in ${fee_label})`}
                            />
                    </View>
                }
                {showFees && !dualFees &&
                    <TextInput
                        mode="outlined"
                        theme={{colors: textInputColors}}
                        value={exchangeStore.fees.toString()}
                        onChangeText={(text) => { exchangeStore.setFees(text) }}
                        label={`Network Fees (${fee_label})`}
                        />
                }
       
            </View>
        );
    }
}
export default FeeBox;