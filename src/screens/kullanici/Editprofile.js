import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppService from '../../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';


export default function Editprofile({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    userId: '',
    eposta: '',
    telefon_no: ''
  });

  const [editMode, setEditMode] = useState({
    eposta: false,
    telefon_no: false
  });

  const [newValues, setNewValues] = useState({
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserInfo(parsedData);
          setNewValues({ email: parsedData.eposta, phone: parsedData.telefon_no });
        }
      } catch (error) {
        console.error('Kullanıcı verisi alınamadı:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field) => {
    try {
      const response = await AppService.editProfile(userInfo.userId, newValues.email, newValues.phone);
      if (response.success) {
        const updatedUserInfo = { ...userInfo, eposta: response.eposta, telefon_no: response.telefon_no };
        setUserInfo(updatedUserInfo);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserInfo));
        setEditMode({ ...editMode, [field]: false });
        Alert.alert('Başarılı', 'Bilgileriniz güncellendi!');
      } else {
        Alert.alert('Hata', response.hata);
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderField = (field, label, keyboardType = 'default') => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>{label}</Text>
          {!editMode[field] && (
            <TouchableOpacity onPress={() => handleEdit(field)} style={styles.editIcon}>
              <Ionicons name="pencil-outline" size={20} color="#6c5ce7" />
            </TouchableOpacity>
          )}
        </View>
        {editMode[field] ? (
          <View>
            <TextInput
              style={styles.input}
              value={newValues[field === 'eposta' ? 'email' : 'phone']}
              onChangeText={(text) => setNewValues({ ...newValues, [field === 'eposta' ? 'email' : 'phone']: text })}
              keyboardType={keyboardType}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(field)}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.value}>{userInfo[field]}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../../assets/images/arkaplanlar/profile.png')} 
        style={styles.background}
        imageStyle={{ opacity: 0.1 }}
      >
      <LinearGradient
        colors={['#6F4E37', '#4B371C']}
        style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF5E6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Düzenle</Text>
        <Ionicons name="cafe-outline" size={24} color="#FFF5E6" style={styles.coffeeIcon} />
      </LinearGradient>

      <View style={styles.form}>
        {renderField('eposta', 'E-posta Adresi', 'email-address')}
        {renderField('telefon_no', 'Telefon Numarası', 'phone-pad')}
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6' },
  background: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  backButton: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#6F4E37', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4B371C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    
    
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#FFF5E6', 
    marginLeft: 16,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 1,
  },
  coffeeIcon: {
    marginLeft: 10,
  },
  form: { 
    padding: 20,
    marginTop: 30,
  },
  fieldContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 24,
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3E9DE',
  },
  fieldHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  label: { 
    fontSize: 14, 
    color: '#6F4E37', 
    fontWeight: '600', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Roboto-Medium',
  },
  value: { 
    fontSize: 16, 
    color: '#4B371C', 
    marginTop: 8, 
    fontWeight: '500',
    fontFamily: 'Roboto-Regular',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E0D5C8', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    marginTop: 12, 
    backgroundColor: '#FFF', 
    color: '#4B371C',
    fontFamily: 'Roboto-Regular',
  },
  saveButton: { 
    backgroundColor: '#6F4E37', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 16,
    shadowColor: '#4B371C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.5,
  },
});