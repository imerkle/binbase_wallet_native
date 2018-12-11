import * as React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { observer } from 'mobx-react';
import { Provider as StoreProvider } from 'mobx-react';
import { createStores } from 'app/stores/index.ts';

import AppWrapper from 'app/containers/AppWrapper';
import Exchange from 'app/containers/Exchange';
import Home from 'app/containers/Home';

import { createDrawerNavigator, createAppContainer } from "react-navigation";
const DrawerNavigator = createDrawerNavigator({
  Exchange: {
    screen: Exchange
  },
  Empty: {
    screen: Home,
  }
},{
  //drawerType: 'slide',
  drawerWidth: 300,
  contentComponent: AppWrapper,
  initialRouteName: 'Empty'
});

const AppContainer = createAppContainer(DrawerNavigator);
/*
primary: {
    light: "#d3d9ee",
    main: "#6b80c5",
    dark: "#3c50a3",
    contrastText: "#fff",
}
*/
const theme = {
  ...DefaultTheme,
  dark: true,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3c50a3',
    text: '#FFF',
  }
};

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#303030',
    margin: 0,
  },
});

//import { createStackNavigator } from 'react-navigation';
const rootStore = createStores();

@observer
class AppFragment extends React.Component<any, any>{
    constructor(props){
      super(props)
      this.initiate()
    }
    initiate = async () => {
      await rootStore.configStore.setConfig();
      rootStore.priceStore.syncFiatPrices();
      rootStore.coinStore.generateKeys();
    }  
    render() {
        const { classes } = this.props;
        return (
        <StoreProvider rootStore={rootStore}>
            <PaperProvider theme={theme}>
                <View style={styles.container}>
                    <AppContainer />
                </View>    
            </PaperProvider>
        </StoreProvider>
		)
    }
}

export default AppFragment;