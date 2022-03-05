import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import * as SQLite from'expo-sqlite';

export default function App() {
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [products, setProducts] = useState([])
  const db = SQLite.openDatabase('productdb.db');

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from products;', [], (_, { rows }) =>
        setProducts(rows._array)
      )
    }, null, null)
  }

  useEffect(() => { db.transaction(tx => { tx.executeSql('create table if not exists products (id integer primary key not null, product text, amount text);'); }, null, updateList);}, []);

  const addProduct = () => {
    db.transaction(tx => {
      tx.executeSql('insert into products (product, amount) values (?, ?);', [product, amount])
    }, null, updateList)
  }

  const deleteProduct = (id) => {
    db.transaction(
      tx => {tx.executeSql('delete from products where id = ?;', [id])}, null, updateList
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.up}>
        <TextInput style={styles.input} onChangeText={product => setProduct(product)} placeholder="product" value={product}/>
        <TextInput style={styles.input} onChangeText={amount => setAmount(amount)} placeholder="Amount" value={amount}/>
        <Button title="Add" onPress={addProduct}/>
      </View>
      <View style={styles.down}>
        <Text>Shopping List {'\n'}</Text>
        <FlatList 
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) =>
            <View style={{flexDirection: "row", marginTop: 3}}>
              <Text>{item.product}, {item.amount} </Text>
              <Text style={{color: '#0000ff'}} onPress={() => deleteProduct(item.id)}>bought</Text> 
            </View>}
          data={products}
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 10,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1 
  },
  up : {
    flex: 1,
    justifyContent: 'flex-end',
  },
  down : {
    justifyContent: 'flex-start',
    flex: 3,
  }
});
