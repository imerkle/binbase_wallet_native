import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Text, Snackbar, List } from 'react-native-paper';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Menu from './Menu';
//import SideMenu from 'react-native-side-menu';
import { DrawerActions, NavigationActions } from 'react-navigation';

@inject('rootStore')
@observer
class AppWrapper extends React.Component<any, any>{
    constructor(props){
      super(props)
    }
    private base;
    onMenuItemSelected = (base) => {
        this.base = base;
        this.props.rootStore.exchangeStore.setBase(base)
        if(!base){
          this.props.navigation.navigate('Empty');
        }
    }
    onMenuItemSelected2 = (rel) => {
        this.props.rootStore.exchangeStore.setRel(rel)
        this.props.rootStore.exchangeStore.init()
        this.props.navigation.navigate('Exchange', {
          rel: rel,
          base: this.base,
        });
        DrawerActions.closeDrawer()
    }  
    toggleSort = (i) => {
      //add later sort by coin/price
    }
    render() {
        const { children } = this.props;
        const { appStore, exchangeStore, priceStore, coinStore, configStore } = this.props.rootStore;
        const { base, rel } = exchangeStore;
        const { config } = configStore;
        const { isUnlocked } = coinStore;
        const sorter = { value: 1, dir: 1 };
        return (
              <SafeAreaView style={styles.container} forceInset={{ top: 'always' }}>
                  <Menu config={config} rel={rel} base={base} onItemSelected={this.onMenuItemSelected} onItemSelected2={this.onMenuItemSelected2} fiat_prices={priceStore.fiat_prices} fiat={priceStore.fiat} balances={coinStore.balances} toggleSort={this.toggleSort} isUnlocked={isUnlocked}/>              
              </SafeAreaView>
          )
        /*
        return (
          <SideMenu
            menu={menu}
            isOpen={this.state.isOpen}
            onChange={isOpen => this.updateMenuState(isOpen)}
            openMenuOffset={4/5*Dimensions.get('window').width}
          >
              <View style={styles.container}>
              </View>
          </SideMenu>
        )
        */
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWrapper;