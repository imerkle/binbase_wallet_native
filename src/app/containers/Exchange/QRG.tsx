import * as React from 'react';

import { Text } from 'react-native-paper';
import { View, Modal } from 'react-native';
import QRCode from 'react-native-qrcode';

class QR extends React.Component<any, any>{
    render(){
        const { text, visible, onRequestClose } = this.props;
                
        return (
        <Modal
          animationType="slide"
          transparent
          visible={visible}
          onRequestClose={() => {
            onRequestClose()
          }}
          >
          <View style={{flex: 1, backgroundColor: "rgba(0,0,0,.5)"}}>
          	<View style={{borderTopStartRadius: 10,borderTopEndRadius: 10,position: "absolute", bottom: 0,width: "100%", padding: 30,backgroundColor: "#FFF", alignItems: "center"}}>
              <QRCode
                value={text}
                size={200}
                />            
            </View>
          </View>
        </Modal>        	
        );
    }
}

export default QR;