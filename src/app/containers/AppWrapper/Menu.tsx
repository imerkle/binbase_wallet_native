import React from 'react';
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Button, TouchableRipple, Text, List, FAB } from 'react-native-paper';
import {toJS} from 'mobx';

const color_86 = '#868686';
const fontSize_11 = 11;
const fontSize_16 = 16;
const paddingRight_3 = 3;
const arrows = ["Coin","Value"];
const sorter = {value: 0, dir: 1};

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    flex: 1,
  },
  leftBar: {
    flex: 0.25,
    backgroundColor: '#1a1818',
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingLeft: 0,
  },
  midBar:{
    flex: 0.75,
  	backgroundColor: '#292726',
  },
  topBar:{
  	flex: 0.9,
  },
  bottomBar:{
  	flex: 0.1,
  	backgroundColor: '#202020',
  },
  fabdiv:{
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: -5,
  },
  nib_selected:{
    opacity: 1
  },
  nib: {
    margin: 5,
    padding: 3,
    backgroundColor: '#fbfbfb',
    borderTopStartRadius: 0,
    borderTopEndRadius: 12,
    borderBottomEndRadius: 12,
    borderBottomStartRadius: 0,
    opacity: 0,
  },
  fab: {
    backgroundColor: '#3c50a3',
  },
  fabImg: {
  	height: 56,
  	width: 56,
  	borderRadius: 28,
  },
  fab_selected: {
    borderRadius: 12,
    backgroundColor: '#424448',
  },
  baseheader:{
    backgroundColor: '#202020',
    fontSize: 18,
    padding: 10,
    color: '#fbfbfb',
  },
  assets_menu_container:{
  },  
  li:{
  	padding: 20,
  	flexDirection: 'row',
  	alignItems: "center",
  },
  li_selected:{
	backgroundColor: '#383838',
  },
  rel: {
	fontSize: fontSize_16,
	paddingRight: paddingRight_3,
  },
  price: {
	fontSize: fontSize_16,
	paddingRight: paddingRight_3,
  },
  vol:{
  	color: color_86,
  	fontSize: fontSize_11,
  	paddingRight: paddingRight_3,  	
  	fontWeight: 'bold',
  },
  priceusd: {
  	color: color_86,
  	fontSize: fontSize_11,
  },
  base: {
  	color: color_86,
  },
  arrow:{
 	fontSize: 10,
 	paddingRight: paddingRight_3,  	
  },
  sorter: {
    //box-shadow: 5px 3px 7px ;
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
    borderColor: "transparent",
    opacity: .5,
    flex: 0.5,
    color: "#FFF",
   },
   sorter_selected: {
   	borderColor: '#4D4D4D',	
	opacity: 1,
   }
});

export default function Menu({ config, rel, base, onItemSelected, onItemSelected2, balances, fiat, fiat_prices, toggleSort }) {
  return (
	  <View style={styles.menu}>
	      <View style={styles.leftBar}>
	        <View style={styles.fabdiv}>
	          <View style={[styles.nib, !base && styles.nib_selected]}></View>
	            <FAB style={[styles.fab, !base && styles.fab_selected]} icon="home" onPress={() => { onItemSelected("")} } />
	        </View>
	         {Object.keys(config).map( (ox, i) => {
	            const o = config[ox];
	            if(!o.base){
	              return (null)
	            }
	            return (
	                <TouchableOpacity style={styles.fabdiv} key={i} onPress={()=>{onItemSelected(ox)}}>
	                  <View style={[styles.nib, ox == base && styles.nib_selected]}></View>
	  					<Image style={[styles.fabImg, styles.fab, ox == base && styles.fab_selected]} source={{uri: `https://raw.githack.com/imerkle/cryptocurrency-icons/master/128/color/${ox.toLowerCase()}.png` }} />                  
	                </TouchableOpacity>
	              )
	          })}         
	      </View>
	      <View style={styles.midBar}>
	      	<View style={styles.topBar}>
              {!base &&
			    <List.Section>
			        <List.Item
			          title="Transaction History" 
			          description="Show Withdraw and Deposit History"
			       />
			    </List.Section>
              }
              { !!base && Object.keys(config).length > 0 &&
               <View>
               	<View style={styles.baseheader}>
               			<Text>{config[base].name}</Text>
               	</View>

                <View style={{flexDirection: "row"}}>
                  {arrows.map( (o, i) =>{
                    return (
                    	<Button color={"#FFF"} compact key={i} icon={sorter.dir ? "arrow-upward" : "arrow-downward"} onPress={()=>{ toggleSort(i) }} style={[styles.sorter, sorter.value == i && styles.sorter_selected]}>
                    		{o}
                    	</Button>
                    )
                  })}
                </View>
               </View>
              }

              { !!base && Object.keys(config).length > 0 &&
                <ScrollView style={styles.assets_menu_container}>
                  { ([base]).concat(config[base].forks || [], Object.keys(config[base].assets || {})).map( (ox, i) =>  {
                    const balance = balances[ox] || {balance: 0};
                    const price_usd = fiat_prices[ox] ? fiat_prices[ox][fiat.name] : 0;
                    if (!(balance.balance > 0 || base == ox || config[ox]!==undefined ) ){
                      return (null)
                    }
                    return (
                    <TouchableOpacity key={i} style={{flex: 1}} onPress={()=>{onItemSelected2(ox)}}>
                      <View style={[styles.li, ox == rel && styles.li_selected]}>
	                     	<View style={{flex: 0.2}}>
                  				<Image style={{ height: 16, width: 16}} source={{ uri: `https://raw.githack.com/imerkle/cryptocurrency-icons/master/32/color/${ox.toLowerCase()}.png` }} />
	                      	</View>
	                     	
	                     	<View style={{flex: 0.3}}>
	                          	<Text style={styles.rel}>{ox}</Text>
	                            <Text style={styles.vol}>{fiat.symbol}{+(price_usd* balance.balance).toFixed(2)}</Text>    
	                      	</View>

	                      	<View style={{flex: 0.5}}>
	                            <Text style={styles.price}>{+(balance.balance).toFixed(8)}</Text>
	                      	</View>
                      </View>
                    </TouchableOpacity>                   
                  )})}
                </ScrollView>              
              }

	      	</View>
	      	<View style={styles.bottomBar}>
	      	</View>
	      </View>
      </View>
  );
}